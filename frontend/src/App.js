import React from 'react';
import { Route, Routes } from 'react-router-dom';

// 컴포넌트
import Main from './Main';
import UserJoin from './components/auth/UserJoin'
import UserJoinTeacherJob from './components/auth/UserJoinTeacherJob';
import UserJoinTeacherEdu from './components/auth/UserJoinTeacherJEdu';

import UserLogIn from './components/auth/UserLogIn';
import FormStructor from './pages/LogInSignUpPage';


// test용


function App() {
  return (
    <div className="App">
    

    {/* <UserJoin/> */}
    <UserLogIn/>
    {/* <FormStructor/> */}

    {/* <TeacherJobItem/> */}
    <UserJoinTeacherJob/>
    <UserJoinTeacherEdu/>

    <Routes>
      <Route path="/" element={<Main/>}></Route>
      <Route path="/join" element={<UserJoin/>}></Route>
    </Routes>


    </div>
  );
}

export default App;
