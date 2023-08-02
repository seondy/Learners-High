// 비로그인 상태의 메인페이지 컴포넌트
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../api/APIPath";

import Banner from "../common/Banner";
import ClassItem from "../class/ClassItem";
import Button from "../common/Button";

const GuestMain = () => {
    const [popularClassDataSet, setPopularClassDataSet] = useState([]);

    // 인기 강의 데이터 get 요청
    useEffect(() => {
        axios.get(`${url}/lesson/list/main`).then((response) => {
            console.log(response);
            setPopularClassDataSet(response.data.list[0]);
        });
    }, []);

    console.log(popularClassDataSet);

    return (
        <>
            {/* 배너 공간 */}
            <Banner $point>
                <div>
                    <strong>LEARNERS HIGH 만의</strong>
                    <br />
                    서비스를 경험해 보고 싶다면,
                </div>
                <Link to="/join">
                    <Button $active size="lg">
                        가입하기
                    </Button>
                </Link>
            </Banner>

            {/* 인기 강의 공간 */}
            <div>
                <span>인기 강의</span>
                <Link to="/lesson">더보기</Link>

                {/* 인기 강의 4개 데이터 가져와서 보여주면 됨 api: /class/list/main  */}
                {popularClassDataSet.map((lessonItem, index) => (
                    <ClassItem
                        key={index}
                        lessonName={lessonItem.lessonName}
                        userName={lessonItem.userName}
                        lessonThumbnailImg={lessonItem.lessonThumbnailImg}
                        lessonNo={lessonItem.lessonNo}
                        lessonTypeNo={lessonItem.lessonTypeNo}
                        userNo={lessonItem.userNo}
                        lessonStartDate={lessonItem.lessonStartDate}
                        maxStudent={lessonItem.maxStudent}
                        lessonPrice={lessonItem.lessonPrice}
                        lessonEndDate={lessonItem.lessonEndDate}
                        lessonStatus={lessonItem.lessonStatus}
                        totalStudent={lessonItem.totalStudent}
                        lessonTypeName={lessonItem.lessonTypeName}
                    />
                ))}
            </div>

            {/* 서비스 내용이 들어갈 공간 */}
            <div>
                서비스의 장점들이 들어갈 어쩌고저쩌고...
                <div>
                    LEARNERS HIGH의{" "}
                    <strong>다양한 서비스를 경험해 보세요!</strong>
                </div>
                <Link to="/join">
                    <Button $active $point size="lg">
                        회원가입
                    </Button>
                </Link>
            </div>
        </>
    );
};

export default GuestMain;
