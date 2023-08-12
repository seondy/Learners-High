// 강사 수업 관리 목록 페이지
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { styled } from "styled-components";
import { Card, Container } from "@mui/material";

import Button from "../components/common/Button";
import LessonItemBoxList from "../components/class/LessonItemBoxList";
import tokenHttp, { url } from "../api/APIPath";
import axios from "axios";
import { StyledTeacherInfoWrap } from "./TeacherProfilePage";
import TeacherLessonCsatBox from "../components/class/TeacherLessonCsatBox";

// 탭바 버튼 wrap
export const StyledButtonWrap = styled.div`
    & > *:not(:first-child) {
        margin-left: 0.5rem;
    }
`;

const FlexButtonWrap = styled.div`
    margin-top: 2rem;

    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const EduTeacherManagePage = () => {
    const userNo = useSelector((state) => state.user.userNo);
    const [teacherLessonDataSet, setTeacherLessonDataSet] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("전체");

    useEffect(() => {
        axios
            .get(
                `${url}/teacher/lesson/list/${userNo}?status=${selectedStatus}`
            )
            .then((response) => {
                console.log(response.data.result);
                setTeacherLessonDataSet(response.data.result);
            });
    }, [selectedStatus]);

    return (
        <>
            <StyledTeacherInfoWrap>
                <Container maxWidth="md">
                    {/* 수업 만족도 / 총 강사 만족도를 나타내주는 공간 */}
                    <div>
                        <TeacherLessonCsatBox userNo={userNo} />
                    </div>
                </Container>
            </StyledTeacherInfoWrap>
            <Container maxWidth="md">
                {/* 탭바 + 강의 개설 버튼 */}
                <FlexButtonWrap>
                    <StyledButtonWrap>
                        <Button
                            onClick={() => setSelectedStatus("전체")}
                            $point={selectedStatus === "전체"}
                            disabled={selectedStatus === "전체"}
                        >
                            전체
                        </Button>
                        <Button
                            onClick={() => setSelectedStatus("강의 중")}
                            $point={selectedStatus === "강의 중"}
                            disabled={selectedStatus === "강의 중"}
                        >
                            진행 중
                        </Button>
                        <Button
                            onClick={() => setSelectedStatus("강의 전")}
                            $point={selectedStatus === "강의 전"}
                            disabled={selectedStatus === "강의 전"}
                        >
                            수업 예정
                        </Button>
                        <Button
                            onClick={() => setSelectedStatus("강의 종료")}
                            $point={selectedStatus === "강의 종료"}
                            disabled={selectedStatus === "강의 종료"}
                        >
                            종료
                        </Button>
                    </StyledButtonWrap>
                    <Link to="/lesson/join">
                        <Button $point>강의 개설</Button>
                    </Link>
                </FlexButtonWrap>

                {/* 강의 목록들이 들어갈 공간 */}
                {teacherLessonDataSet.length > 0 ? (
                    <LessonItemBoxList lessonList={teacherLessonDataSet} />
                ) : (
                    <div>존재하는 강의 없음!!! ( 여기에 어떤 것을 넣어야할지 ,,,@@@ )</div>
                )}
            </Container>
        </>
    );
};

export default EduTeacherManagePage;
