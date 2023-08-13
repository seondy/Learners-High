import React, { useState, useRef } from "react";
import { UserStatusOption } from "seeso";
import EasySeeso from "seeso/easy-seeso";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Webcam from "react-webcam";
import Button from "../../components/common/Button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import StudentLessonRoomPage from "./StudentLessonRoomPage";
import axios from "axios";
import { licenseKey } from "../../api/Ignore";
// import { seesoUrl } from "../../api/APIPath";

const dotMaxSize = 10;
const dotMinSize = 5;

const StudentWaitLessonRoomPage = () => {
    const userNo = useSelector((state) => state.user.userNo);
    const userId = useSelector((state) => state.user.userId);
    const userName = useSelector((state) => state.userName);
    const [enterRoom, setEnterRoom] = useState(false);
    const videoRef = useRef(null);
    
    // console.log("여기 왔어?")
    let userStatus = useRef(null);
    const eyeTracker = useRef(null);
    let currentX, currentY;
    const navigate = useNavigate();
    const { lessonNo, lessonRoundNo } = useParams();
    const [ isSeesoInit, setSeesoInit ] = useState(false);

    const [attentionScore, setAttentionScore] = useState(0);
    const [isFocus, setIsFocus] = useState(true);
    const [isTest, setIsTest] = useState(false);
    const [calibrationData, setCalibrationData] = useState(null);

    useEffect(() => { 
        window.addEventListener('blur',focusOutLessonRoom);  
        window.addEventListener('focus',focusInLessonRoom);  
        (async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            } catch (error) {
              console.error('Error accessing webcam:', error);
            }
        })();


        if (!eyeTracker.current) {
            eyeTracker.current = new EasySeeso();
            userStatus.current = new UserStatusOption(true, false, false);
            (async ()=>{
                await eyeTracker.current.init(
                    licenseKey,
                    () => {
                        setSeesoInit(true);
                        setIsTest(false);
                        if (!eyeTracker.current.checkMobile()) {
                            eyeTracker.current.setMonitorSize(16); // 14 inch
                            eyeTracker.current.setFaceDistance(70);
                            eyeTracker.current.setCameraPosition(
                                window.outerWidth / 2,
                                true
                            );
                        }
                    }, // callback when init succeeded.
                    () => console.log("callback when init failed."), // callback when init failed.
                    userStatus.current
                );
            })();
        }
        return ()=>{
            window.removeEventListener('blur',focusOutLessonRoom);  
            window.removeEventListener('focus',focusInLessonRoom);  

            if (videoRef.current) {
                const stream = videoRef.current.srcObject;
                if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                }
            }
        }
    }, []);
    

    // 다른 화면으로 변경 시 실행되는 callback 함수
    const focusOutLessonRoom = useCallback(()=>{
        console.log('다른 화면 봄');
        setIsFocus(false);

    });

    // 강의실 화면으로 변경 시 실행되는 callback 함수
    const focusInLessonRoom = useCallback(()=>{
        console.log('강의룸으로 돌아 옴');
        setIsFocus(true);
    });

    useEffect(()=>{
        eyeTracker.current.startTracking(onGaze,onDebug);
    },[isSeesoInit]);

    useEffect(()=>{
        saveAttentionScore(attentionScore);
    },[attentionScore]);

    // 화면을 보는지 안 보는 지를 파악하여 mongodb에 넣는 함수
    const saveAttentionScore = useCallback((score)=>{
            let currentScore = score;
            if(!isFocus){
                console.log("다른 화면 보는 중");
                currentScore = 0;
            }
            // 조건
            if(enterRoom){
                console.log("AttentScore : ", currentScore);
            }
            // mongodb server와 통신
            //     {
            // axios.post(
            //     `${seesoUrl}/seeso/attention-rate`,
            //       lessonRoundNo: Number(lessonRoundNo),
            //       lessonNo: Number(lessonNo),
            //       userNo: Number(userNo),
            //       rate: Number(score),
            //     },
            //     {
            //       headers: { "Content-Type": "application/json" }, // 요청 헤더 설정
            //     }
            //   )
            //     .then((res) => {
            //       console.log(res, "ddd");
            //     })
            //     .catch((err) => {
            //       console.error(err);
            //     });
    },[isFocus,enterRoom]);

    const onAttention = useCallback((timestampBegin, timestampEnd, score) =>{
        console.log(
        `Attention event occurred between ${timestampBegin} and ${timestampEnd}. Score: ${score}`
        );
        setAttentionScore(score);
    },[]);
    
    useEffect(()=>{
        if(calibrationData !== null){
            eyeTracker.current.startTracking(onGaze,onDebug);
            eyeTracker.current.setCalibrationData(calibrationData);
            console.log('test 함');
        }else{
            console.log('test 안함');
        }
    },[enterRoom]);
    
    // calibration callback.
    function onCalibrationNextPoint(pointX, pointY) {
        currentX = pointX;
        currentY = pointY;
        let ctx = clearCanvas();
        drawCircle(currentX, currentY, dotMinSize, ctx);
        eyeTracker.current.startCollectSamples();
    }
    
    // calibration callback.
    function onCalibrationProgress(progress) {
        let ctx = clearCanvas();
        let dotSize = dotMinSize + (dotMaxSize - dotMinSize) * progress;
        drawCircle(currentX, currentY, dotSize, ctx);
    }
    
    // calibration callback.
    const onCalibrationFinished = useCallback((calibrationData) => {
        clearCanvas();
        eyeTracker.current.setUserStatusCallback(
            onAttention,
            null,
            null
            );
        eyeTracker.current.setAttentionInterval(10);
        setIsTest(false);
        setCalibrationData(calibrationData);
        }, []);

    function drawCircle(x, y, dotSize, ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2, true);
        ctx.fill();
    }  
    function clearCanvas() {
        let canvas = document.getElementById("output");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return ctx;
    }
    const onGaze = ((gazeInfo)=> { });
    const onDebug = (FPS, latency_min, latency_max, latency_avg)=> { };

    const tmpClick = useCallback(() => {
        setIsTest(true);
        setTimeout(function () {
            eyeTracker.current.startCalibration(
                onCalibrationNextPoint,
                onCalibrationProgress,
                onCalibrationFinished
                );
            }, 1000);
    }, []);

    const enterTheLessonRoom =  useCallback(() => {
        setEnterRoom(true);
    },[]);

    return (
        <>
            <div style={{ position: "relative" }}>
                <div className="Wrap-Cam-canvas">
                    <canvas
                            id="output"
                            style={{
                                position: "absolute",
                                height: "500px",
                                width: "100%",
                                margin: "auto",
                                zIndex:9999
                            }}
                        />
                        {!enterRoom ? (
                            <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={{
                                width: '100%',
                                maxWidth: '500px',
                                }}
                            />
                                
                            <div
                                style={{
                                    position: "relative",
                                    top: "500px",
                                    backgroundColor: "blue",
                                    width: "1000px",
                                    marginLeft: "10%",
                                    paddingLeft: "auto",
                                    borderRadius: "20px",
                                }}
                            >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "start",
                                top: "50%",
                            }}
                        >
                            {/* <span> {lessonName} </span> */}
                        </div>
                        <div style={{ display: "flex", justifyContent: "end" }}>
                            <Button onClick={enterTheLessonRoom} disabled ={isTest}>
                                실제 룸 입장
                            </Button>
                            <button onClick={tmpClick} disabled={isTest} >테스트</button>
                        </div>
                    </div>
                            </>

                        ) : (
                            <StudentLessonRoomPage/>
                        )
                        }
                </div>
            </div>
        </>
    );
};

export default StudentWaitLessonRoomPage;
