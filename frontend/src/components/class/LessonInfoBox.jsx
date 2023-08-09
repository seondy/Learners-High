// 강의 상세 페이지 상단에 있는 강의에 대한 세부 내용이 담긴 박스
// 다른 곳에서도 강의 세부 내용 박스로 쓰일 컴포넌트

import { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";

import { Container } from "@mui/material";
import { useParams } from "react-router-dom";
import { url } from "../../api/APIPath";
import { HiOutlineHeart } from "react-icons/hi";
import LessonStatusBox from "../common/LessonStatusBox";
import Button from "../common/Button";
import Modal from "../common/Modal";
import UserLogIn from "../auth/UserLogIn";

// 강의 wrap
const ImgInfoWrap = styled.div`
    padding: 3rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// image styled
const StyledThumbnail = styled.img`
    width: 40%;
    border-radius: 1.25rem;
`;

// info wrap
const InfoWrap = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 55%;

    & > *:not(:first-child) {
        margin-top: 1rem;
    }
`;

const FlexWrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

// 하단바 styled
const StyledBottomBar = styled.div`
    position: fixed;
    text-align: center;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 5rem;
    background-color: #e1e6f9;
    z-index: 1;
`;

const BottomBarContents = styled.div`
    width: 65%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LessonInfoBox = ({ lessonInfo, handleApplyChange, $info, $edu }) => {
    const userType = useSelector((state) => state.user.userType);
    const userNo = useSelector((state) => state.user.userNo);
    const lessonNo = useParams();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [lessonStateDataSet, setLessonStateDataSet] = useState(null);

    // 로그인 버튼 클릭 했을 때, 로그인 모달 창
    const handleLoginButtonClick = () => {
        setShowLoginModal(true);
        document.body.classList.add("overflow-hidden");
    };
    // 모달을 닫을 때
    const handleCloseModal = () => {
        setShowLoginModal(false);
        document.body.classList.remove("overflow-hidden");
    };

    // 수강 가능한 상태인지 (학생일 경우!)
    if (userType === "S") {
        axios
            .get(`${url}/student/${userNo}/lesson/${lessonNo.lessonNo}/state`)
            .then((response) =>
                setLessonStateDataSet(response.data.resultCode)
            );
    }

    console.log(lessonStateDataSet, typeof lessonStateDataSet);

    return (
        <Container maxWidth="md">
            {lessonInfo && (
                <>
                    <ImgInfoWrap>
                        <StyledThumbnail
                            src={
                                lessonInfo.lessonThumbnailImg
                                    ? lessonInfo.lessonThumbnailImg
                                    : "/assets/bannerimg.jpg"
                            }
                            alt="thumbnail-img"
                        />
                        <InfoWrap>
                            <FlexWrap>
                                <div>
                                    <LessonStatusBox $point>
                                        {lessonInfo.lessonTypeName}
                                    </LessonStatusBox>
                                    <LessonStatusBox $point>
                                        총 {lessonInfo.lessonTotalRound}회차
                                    </LessonStatusBox>
                                </div>
                                <div>
                                    {lessonInfo.lessonStartDate} ~{" "}
                                    {lessonInfo.lessonEndDate}
                                </div>
                            </FlexWrap>
                            <FlexWrap>
                                <h3>{lessonInfo.lessonName}</h3>
                                <span>{lessonInfo.lessonPrice.toLocaleString()}원</span>
                            </FlexWrap>
                            <div>{lessonInfo.userName}</div>
                            <div>{lessonInfo.lessonThumbnailInfo}</div>

                            {$info && (
                                <>
                                    {/* 수강신청을 한 경우 */}
                                    {lessonStateDataSet === -1 && (
                                        <Button disabled>
                                            이미 수강신청을 하셨습니다.
                                        </Button>
                                    )}

                                    {/* 비회원인 경우 수강신청 불가 => 로그인 모달 이동? */}
                                    {!userType && (
                                        <>
                                            <Button
                                                onClick={handleLoginButtonClick}
                                            >
                                                로그인을 해주세요!
                                            </Button>

                                            {/* 로그인 모달창 */}
                                            <Modal
                                                title="로그인"
                                                show={showLoginModal}
                                                onClose={handleCloseModal}
                                            >
                                                <UserLogIn
                                                    onClose={handleCloseModal}
                                                />
                                            </Modal>
                                        </>
                                    )}

                                    {/* 강사인 경우 수강신청 불가 => 비활성화 버튼 */}
                                    {userType === "T" && (
                                        <Button disabled>수강신청 불가</Button>
                                    )}

                                    {/* 학생이고, 해당 과목을 아직 수강신청하지 않았을 때 */}
                                    {userType === "S" &&
                                        lessonStateDataSet === 0 && (
                                            <>
                                                <Button
                                                    onClick={handleApplyChange}
                                                >
                                                    수강 신청 ({" "}
                                                    {lessonInfo.totalStudent} /{" "}
                                                    {lessonInfo.maxStudent} 명 )
                                                </Button>
                                                <Button>
                                                    <HiOutlineHeart />
                                                </Button>
                                            </>
                                        )}
                                </>
                            )}
                            {$edu && (
                                <>
                                    <Button $point>강의 입장</Button>
                                    <Button>
                                        <HiOutlineHeart />
                                    </Button>
                                </>
                            )}
                        </InfoWrap>
                    </ImgInfoWrap>

                    {/* 하단바 */}
                    {$info && (
                        <StyledBottomBar>
                            <BottomBarContents>
                                <span>
                                    <strong>{lessonInfo.lessonName}</strong>
                                </span>
                                <span>{lessonInfo.lessonPrice.toLocaleString()}원</span>

                                {/* 수강신청을 한 경우 */}
                                {lessonStateDataSet === -1 && (
                                    <Button disabled>
                                        이미 수강신청을 하셨습니다.
                                    </Button>
                                )}

                                {/* 비회원인 경우 수강신청 불가 => 로그인 모달 이동? */}
                                {!userType && (
                                    <Button onClick={handleLoginButtonClick}>
                                        로그인을 해주세요!
                                    </Button>
                                )}

                                {/* 강사인 경우 수강신청 불가 => 비활성화 버튼 */}
                                {userType === "T" && (
                                    <Button disabled>수강신청 불가</Button>
                                )}

                                {/* 학생이고, 해당 과목을 아직 수강신청하지 않았을 때 */}
                                {userType === "S" &&
                                    lessonStateDataSet === 0 && (
                                        <div>
                                            <Button onClick={handleApplyChange}>
                                                수강 신청 ({" "}
                                                {lessonInfo.totalStudent} /{" "}
                                                {lessonInfo.maxStudent} 명 )
                                            </Button>
                                            <Button>
                                                <HiOutlineHeart />
                                            </Button>
                                        </div>
                                    )}
                            </BottomBarContents>
                        </StyledBottomBar>
                    )}
                </>
            )}
        </Container>
    );
};

export default LessonInfoBox;
