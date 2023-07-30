// 공통 Header 컴포넌트
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
    const userType = useSelector((state) => state.user.userType);

    return (
        <header>
            <nav>
                <h1>
                    <NavLink to="/">
                        <img src="#" alt="logo" />
                    </NavLink>
                </h1>

                {/* 로그인이 안 되어있을 경우 */}
                {!userType && (
                    <>
                        <NavLink to="/class">전체 강의</NavLink>
                        <NavLink to="/join">회원가입</NavLink>
                        <li>로그인</li>
                    </>
                )}

                {/* 로그인이 되어있고 선생님일 경우 */}
                {userType === "T" && (
                    <>
                        <li>전체 강의</li>
                        <li>수업 관리</li>
                        <li>강의 개설</li>
                        <li>로그아웃</li>
                        <li>마이페이지</li>
                    </>
                )}

                {/* 로그인이 되어있고 학생일 경우 */}
                {userType === "S" && (
                    <>
                        <li>전체 강의</li>
                        <li>수강 목록</li>
                        <li>로그아웃</li>
                        <li>마이페이지</li>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
