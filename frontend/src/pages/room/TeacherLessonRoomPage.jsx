import React, { useEffect } from "react";
import { useState, useRef } from "react"; // 내꺼.

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import tokenHttp, { url, homeurl} from "../../api/APIPath";
import axios from "axios"; 
// OpenViduu
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "../../components/stream/UserVideoComponent";
import ChatComponent from "../../components/chat/ChatComponent";

// 강사 강의룸 스타일링
import styled from "styled-components";
import { Typography } from "@mui/material";
import "./TeacherLessonRoomPage.css"

import {
    HiMicrophone,
    HiVideoCamera,
    HiDesktopComputer,
    HiOutlineBell,
} from "react-icons/hi";
import Button from "../../components/common/Button";
import { useCallback } from "react";

// 전체 Wrap (가로, 세로 100%)
export const RoomFrameWrap = styled.div`
    width: 100vw;
    height: 100vh;

    padding: 0.75rem;
    box-sizing: border-box;

    display: flex;
    justify-content: space-between;
`;

// 학생들 화면이 담길 Wrap
const StudentScreenWrap = styled.div`
    width: 17%;
    height: 100%;
    background-color: #e1e6f9;
    border-radius: 1.25rem;
    padding: 0.75rem;
    box-sizing: border-box;
    overflow: scroll;

    & > *:not(:last-child) {
        margin-bottom: 0.75rem;
    }
`;
// 학생 한 명의 화면
export const StudentScreen = styled.div`
    width: 100%;
    // height auto로 변경하기@@@ (화면 들어왔을 때, 높이 자동 설정)
    height: auto;
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: #ddd;
    position: relative;
`;

const StudentName = styled.div`
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    border-radius: inherit;
    width: 30%;
    text-align: center;
    background-color: #e1e6f9;
    padding: 0.1rem;
    box-sizing: border-box;
    font-size: 0.75rem;
`;

// 수업 컨트롤 바, 화면 공유 Wrap
const ControlBarShareWrap = styled.div`
    width: 60%;
`;

// 수업 컨트롤 바
export const LessonControlBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 4.5rem;
    background-color: #293c81;
    padding: 0.75rem 1rem;
    box-sizing: border-box;
    border-radius: 1.25rem;

    margin-bottom: 0.75rem;
`;

// 수업 컨트롤 버튼 Wrap
export const ControlButtonWrap = styled.div`
    :not(:first-child) {
        margin-left: 0.5rem;
    }
`;

// 화면 공유
export const ScreenShare = styled.div`
    width: 100%;
    height: calc(100vh - 6.75rem);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;

    border-radius: 1.25rem;
    overflow: hidden;

    background-color: #000;
`;

// 학생 상태 바, 채팅 컴포넌트 Wrap
const StateChatWrap = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 20%;
`;

// 학생 상태 바
const StateNotification = styled.div`
    width: 100%;
    height: 58%;

    border-radius: 1.25rem;
    padding: 0.75rem;
    box-sizing: border-box;

    background-color: #293c81;
    overflow: scroll;
`;

// 학생 개인별 상태 바 (상태, 주의 버튼)
const StateWrap = styled.div`
    background-color: #fff;
    width: 100%;
    height: 4.5rem;
    padding: 0.75rem;
    box-sizing: border-box;
    border-radius: inherit;
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const StateFlex = styled.div`
    display: flex;
    align-items: center;

    & > * {
        margin-left: 0.75rem;
    }
`;
const StateButton = styled.div`
    width: 3rem;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
    border-radius: 0.75rem;
    border: 1px solid #000;

    :hover {
        cursor: pointer;
        background-color: #e1e6f9;
    }
`

// 채팅 컴포넌트 Wrap
const ChatWrap = styled.div`
    position: relative;
    width: 100%;
    height: 40%;

    overflow: hidden;

    border-radius: 1.25rem;
    // padding: 0.75rem;
    box-sizing: border-box;

    background-color: #e1e6f9;
`;

const TeacherLessonRoomPage = () => {
    // 강사 No.
    const userNo = useSelector((state) => state.user.userNo);
    const userId = useSelector((state) => state.user.userId);
    const userType = useSelector((state) => state.user.userType);
    const userName = useSelector((state) => state.user.userName);
    const { lessonNo, lessonRoundNo } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const lessonName = location.state.lessonName;

    // session, state 선언
    const [mySessionId, setMySessionId] = useState(undefined);
    const [myUserName, setMyUserName] = useState(userName);
    const [session, setSession] = useState(undefined);
    const [mainStreamManager, setMainStreamManager] = useState(undefined);
    const [publisher, setPublisher] = useState(undefined);
    const [subscribers, setSubscribers] = useState([]);
    const [token, setToken] = useState("");

    // video, audio 접근 권한
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [shareEnabled, setShareEnabled] = useState(false);

    // 새로운 OpenVidu 객체 생성
    const [OV, setOV] = useState(<OpenVidu />);
    const es = useRef();

    // 2) 화면 렌더링 시 최초 1회 실행
    useEffect(() => {
        setVideoEnabled(true);
        setAudioEnabled(false);
        setShareEnabled(true);
        setMySessionId(`${lessonNo}_${lessonRoundNo}`);
        setMyUserName(myUserName);

        // // 알림
        // const sse = new EventSource(
        //     `${url}/notification/subscribe/${userId}`
        // );
        // sse.onopen = () => {
        //     console.log("SSEONOPEN==========", sse);
        // };
        // sse.addEventListener("isActive", function (event) {
        //     console.log("ADDEVENTLISTENER==========");
        //     const tmp = JSON.parse(event.data);
        //     tmp.status = Boolean(tmp.status);
        //     console.log(tmp);
        // });

        es.current = new EventSource( `${url}/notification/subscribe/${userId}`);

        es.current.onopen = (e) => {
            console.log("SSEONOPEN==========", es);
        };

        es.current.addEventListener("isActive", function (event) {
                console.log("ADDEVENTLISTENER==========");
                const tmp = JSON.parse(event.data);
                tmp.status = Boolean(tmp.status);
                console.log(tmp);
        });

        es.current.onerror = (err) => {
            console.log('[sse] error', { err });
        };
        // 윈도우 객체에 화면 종료 이벤트 추가
        joinSession(); // 세션 입장
        return () => {
            window.removeEventListener('beforeunload',leaveSession);
            es.current.close();
        };
    }, []);

    // session이 바뀌면 하는 것
    const leaveSession = async () => {
        if (session) {
            session.disconnect();
            await tokenHttp.delete(`${url}/lessonroom/teacher/${lessonNo}/${lessonRoundNo}/${userNo}`)
                            .then((res)=>{
                                if(res.data.resultCode !== 200){
                                    console.log(res.data.resultMsg);
                                }
                            }).catch(err=>{
                                console.error(err);
                            });
            setOV(null);
            setMySessionId(undefined);
            setMyUserName("");
            setSession(undefined);
            setMainStreamManager(undefined);
            setPublisher(undefined);
            setSubscribers([]);
            setToken(undefined)
        }
        // 메인화면 이동 필요
        window.location.href=homeurl;
    };
    // 세션 생성 및 세션에서 이벤트가 발생할 때의 동작을 지정
    const joinSession = async () => {
        const newOV = new OpenVidu();
        let mySession = newOV.initSession();

        // Session 개체에서 추가된 subscriber를 subscribers 배열에 저장
        mySession.on("streamCreated", (event) => {
            const subscriber = mySession.subscribe(event.stream, undefined);
            setSubscribers((subscribers) => [...subscribers, subscriber])
             // 새 구독자에 대한 상태 업데이트
            console.log("사용자가 입장하였습니다.");
            // console.log(JSON.parse(event.stream.streamManager.stream.connection.data.clientData), "님이 접속했습니다.");
        });

        // Session 개체에서 제거된 관련 subsrciber를 subsribers 배열에서 제거
        mySession.on("streamDestroyed", (event) => {
            setSubscribers((preSubscribers) =>
                preSubscribers.filter(
                    (subscriber) => subscriber !== event.stream.streamManager
                )
            );
            console.log("사용자가 나갔습니다.");
            // console.log(JSON.parse(event.stream.connection.data.clientData), "님이 접속을 종료했습니다.")
        });

        // 서버 측에서 예기치 않은 비동기 오류가 발생할 때 Session 개체에 의해 트리거 되는 이벤트
        mySession.on("exception", (exception) => {
            console.warn(exception);
        });

        // 세션 갱신
        setOV(newOV);
        setSession(mySession);
    };

    // 사용자의 토큰으로 세션 연결 (session 객체 변경 시에만 실행)
    useEffect(() => {
        if (session && !token) {
            tokenHttp
                .get(
                    `${url}/lessonroom/teacher/${lessonNo}/${lessonRoundNo}/${userNo}`
                )
                .then((res) => {
                    if (res.data.resultCode !== 200) throw res.data.resultMsg;
                    setToken(res.data.resultMsg);
                    // 첫 번째 매개변수는 OpenVidu deployment로 부터 얻은 토큰, 두 번째 매개변수는 이벤트의 모든 사용자가 검색할 수 있음.
                    session.connect(res.data.resultMsg, { clientData: JSON.stringify({userNo,userName,userId}) })
                })
                .then(async () => {
                    // Get your own camera stream ---
                    // publisher 객체 생성
                    let publisher = await OV.initPublisherAsync(undefined, {
                        audioSource: undefined,     // The source of audio. If undefined default microphone
                        videoSource: undefined,     // The source of video. If undefined default webcam
                        publishAudio: audioEnabled, // Whether you want to start publishing with your audio unmuted or not
                        publishVideo: videoEnabled, // Whether you want to start publishing with your video enabled or not
                        resolution: '640x480',      // The resolution of your video
                        frameRate: 30,              // The frame rate of your video
                        insertMode: 'APPEND',       // How the video is inserted in the target element 'video-container'
                        mirror: true,               // Whether to mirror your local video or not
                    });
                    // Publish your stream ---
                    session.publish(publisher);
                    // Set the main video in the page to display our webcam and store our Publisher
                    setPublisher(publisher);
                    setMainStreamManager(publisher);
                })
                .catch ((error) => {
                    alert(error.response.data);
                    navigate("/");
            });
        }
    }, [session]);
    // 내 웹캠 on/off (상대방도 화면 꺼지는지 확인 필요)
    const toggleVideo = () => {
        if (publisher) {
            const enabled = !videoEnabled;
            setVideoEnabled(enabled);
            publisher.publishVideo(enabled);
        }
    };

    // 내 마이크 on/off (상대방도 음성 꺼지는지 확인 )
    const toggleAudio = () => {
        if (publisher) {
            const enabled = !audioEnabled;
            setAudioEnabled(enabled);
            publisher.publishAudio(enabled);
        }

        tokenHttp.post(
            `${url}/notification/send`,
            {
                lessonNo : Number(lessonNo),
                lessonRoundNo : Number(lessonRoundNo),
                studentNo : Number(4),
                teacherId : userId
            }
        ).then(res=>{
            console.log('send 성공');
        }).catch(err=>{
            console.log('send 실패', err);
        })


    };

    const toggleShare = () => {
        if (shareEnabled) {
            console.log("공유 시작  ");
            screenShare();
        } else {
            showCam();
            console.log("공유 종료");
        }
    };

    const screenShare = async () => {
        const videoSource =
            navigator.userAgent.indexOf("Firefox") !== -1 ? "window" : "screen";
        const sharePublisher = await OV.initPublisher(
            undefined,
            {
                videoSource: videoSource,
                publishAudio: audioEnabled,
                publishVideo: videoEnabled,
                mirror: false,
            },
            (error) => {
                if (error && error.name === "SCREEN_EXTENSION_NOT_INSTALLED") {
                    alert("SCREEN_EXTENSION_NOT_INSTALLED");
                } else if (
                    error &&
                    error.name === "SCREEN_SHARING_NOT_SUPPORTED"
                ) {
                    alert("Your browser does not support screen sharing");
                } else if (
                    error &&
                    error.name === "SCREEN_EXTENSION_DISABLED"
                ) {
                    alert("You need to enable screen sharing extension");
                } else if (error && error.name === "SCREEN_CAPTURE_DENIED") {
                    alert(
                        "You need to choose a window or application to share"
                    );
                }
            }
        );

        sharePublisher.once("accessAllowed", async () => {
            sharePublisher.stream
                .getMediaStream()
                .getVideoTracks()[0]
                .addEventListener("ended", showCam);
        });
        sharePublisher.once("streamPlaying", async () => {
            setShareEnabled(!shareEnabled);
        });
        publisher.once("accessDenied", (event) => {
            console.warn("ScreenShare: Access Denied");
        });

        await session.unpublish(publisher);
        setPublisher(sharePublisher);
        await session.publish(sharePublisher);
    };

    const showCam = async () => {
        let newPublisher = await OV.initPublisherAsync(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: audioEnabled, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: videoEnabled, // Whether you want to start publishing with your video enabled or not
            resolution: "640x480", // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: true, // Whether to mirror your local video or not
        });

        await session.unpublish(publisher);
        setPublisher(newPublisher);
        await session.publish(newPublisher);

        setShareEnabled(!shareEnabled);
    };

    return (
        <>
            <RoomFrameWrap>
                {/* <h1>Room ID: {mySessionId}</h1> */}

                {/* 아래 세션은 아래의 조건에 존재 */}
                {/* {session !== undefined && session.connection !== undefined ?

                        {/* <div>
                      {console.log(session, "세션")}
                      {console.log(session.connection, "세션 커넥션")}
                      { mainStreamManager && <ChatComponent 
                      userName={userName}
                      streamManager={mainStreamManager}
                      connectionId={session.connection.connectionId}
                      />}
                    </div> */}
                <StudentScreenWrap>
                    {session !== undefined  &&
                    session.connection !== undefined ? (
                        <>
                            {/* 여기서 강사 아닌 사람들만 */}
                            {subscribers.map((sub, i) => (
                                <>
                                    <StudentScreen key={`${i}-subscriber1`}>
                                        <StudentName>
                                            {JSON.parse(JSON.parse(sub.stream.connection.data).clientData).userName}
                                        </StudentName>
                                        <UserVideoComponent
                                            streamManager={sub}
                                        />
                                    </StudentScreen>
                                </>
                            ))}
                        </>
                    ) : null}
                </StudentScreenWrap>

                {/* 수업 컨트롤 바, 화면공유 */}
                <ControlBarShareWrap>
                    {/* 강사 수업 관리 바 */}
                    <LessonControlBar>
                        {/* 수업 타이틀 @@@ */}
                        <Typography fontWeight={"bold"} color={"white"}>
                            수업 타이틀 : {lessonName}
                        </Typography>
                        {/* 우측 버튼 모음 */}
                        <ControlButtonWrap>
                            <Button
                                type="button"
                                onClick={toggleShare}
                                value={`공유 ${!shareEnabled ? "OFF" : "ON"}`}
                            >
                                <HiDesktopComputer />
                            </Button>
                            <Button
                                type="button"
                                onClick={toggleVideo}
                                value={`비디오 ${videoEnabled ? "OFF" : "ON"}`}
                            >
                                <HiVideoCamera />
                            </Button>
                            <Button
                                type="button"
                                onClick={toggleAudio}
                                value={`마이크 ${audioEnabled ? "OFF" : "ON"}`}
                            >
                                <HiMicrophone />
                            </Button>
                            <Button
                                type="button"
                                onClick={leaveSession}
                                value="나가기"
                            >
                                수업 종료
                            </Button>
                        </ControlButtonWrap>
                    </LessonControlBar>

                    {/* 화면 공유 */}
                    <ScreenShare>
                        {session !== undefined &&
                        session.connection !== undefined &&
                        publisher !== undefined &&
                        mainStreamManager !== undefined ? (
                            <>
                                <UserVideoComponent streamManager={publisher} />
                            </>
                        ) : null}
                    </ScreenShare>
                </ControlBarShareWrap>

                {/* 학생 상태 경고 바 / 채팅 컴포넌트가 담길 div 박스 */}
                <StateChatWrap>
                    {/* 학생 상태 경고 바 */}
                    <StateNotification>
                        {/* 학생 개개인의 상태와 주의 표시 버튼을 나타낼 박스 */}
                        {subscribers.map((sub, idx) => (
                            // 여기에 div Box 만들면 됩니다.
                            <>
                                <StateWrap>
                                    <div>{JSON.parse(JSON.parse(sub.stream.connection.data).clientData).userName}</div>
                                    <StateFlex>
                                        {/* 여기에 집중 여부에 따라 바꿀 것. */}
                                        <div>상태</div>
                                        {/* {console.log(subscribersStatus,"sssss")} */}
                                        <StateButton><HiOutlineBell /></StateButton>
                                    </StateFlex>
                                </StateWrap>
                            </>
                        ))}
                    </StateNotification>

                    {/* 채팅 컴포넌트 */}
                    <ChatWrap>
                        {mainStreamManager && (
                            <ChatComponent
                                userName={userName}
                                streamManager={mainStreamManager}
                                connectionId={session.connection.connectionId}
                            />
                        )}
                    </ChatWrap>
                </StateChatWrap>
            </RoomFrameWrap>
        </>
    );
};
export default TeacherLessonRoomPage;
