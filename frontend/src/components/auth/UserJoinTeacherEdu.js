import React, {useState, useRef} from "react";
import {useSelector} from "react-redux"
import axios from 'axios'
import { url } from "../../api/APIPath";

const UserJoinTeacherEdu = (props) => {
    const nextId = useRef(1)
    const userNo = useSelector(state => state.user.userNo) || props.userNo
    const initialState = [
        {
            id: nextId-1,
            userNo: userNo,
            universityName: '',
            majorName: '',
            degree: '',
            eduStartDate: '',
            eduEneDate: ''
        }
    ]

    const [eduInputList, setEduInputList] = useState(initialState)
    // input 객체 추가 이벤트
    const addEduInputItem = () => {
        const input = {
            id: nextId.current,
            userNo: userNo,
            universityName: '',
            majorName: '',
            degree: '',            
            eduStartDate: '',
            eduEneDate: ''
        }
        setEduInputList([...eduInputList, input]) // 새로운 인풋 객체 추가
        nextId.current+=1
    }
    // input 객체 삭제 이벤트
    const deleteEduInputItem = (index) => {
        console.log(index)
        setEduInputList(eduInputList.filter(item => item.id !== index))
    }
    
    const onChange = (event, index) => {
        if (index > eduInputList.length) return // 예외처리

        const {value, name} = event.currentTarget


        // 인풋 배열의 copy
        const EduInputListCopy = JSON.parse(JSON.stringify(eduInputList))
        EduInputListCopy[index][name] = value
        setEduInputList(EduInputListCopy)
        console.log(eduInputList)
    }

    // const [hireStartDateYear, setHireStartDateYear] = useState('')
    // const [hireStartDateMonth, setHireStartDateMonth] = useState('')
    // const [hireEndDateYear, setHireEndDateYear] = useState('')
    // const [hireEndDateMonth, setHireEndDateMonth] = useState('')

    const postTeacherEdu = () => {
        // 데이터를 [id: id, {data들} // or {id: userId, ... 이렇게?}]
        eduInputList.map((item) => (    
            axios.post(`${url}/user/join/edu`, 
            item,
            {headers: {"Content-Type": 'application/json'}}
            )
        ))
    }

    return (
        <>
            <form onSubmit={(e)=>e.preventDefault()}>
                {
                    eduInputList.map((item, index) => (
                        <div key={index}>
                            <p>학력 {item.id+1}</p>

                            <span>학교명</span>
                            <input
                            type="text"
                            name="universityName"
                            className={`universityName-${index}`}
                            onChange={e=>onChange(e, index)}
                            value={item.universityName}
                            />

                            <span>전공명</span>
                            <input
                            type="text"
                            name="majorName"
                            className={`majorName-${index}`}
                            onChange={e=>onChange(e, index)}
                            value={item.majorName}
                            />

                            <span>전공명</span>
                            <input
                            type="text"
                            name="degree"
                            className={`degree-${index}`}
                            onChange={e=>onChange(e, index)}
                            value={item.degree}
                            />

                            <span>입학년월</span>
                            <input
                            type="text"
                            name="eduStartDate"
                            className={`eduStartDate-${index}`}
                            onChange={e=>onChange(e, index)}
                            value={item.eduStartDate}
                            /> 
                            <span>졸업년월</span>
                            <input
                            type="text"
                            name="eduEneDate"
                            className={`eduEneDate-${index}`}
                            onChange={e=>onChange(e, index)}
                            value={item.eduEneDate}
                            /> 
                            <button onClick={()=>deleteEduInputItem(item.id)}>삭제</button>
                        </div>
                    ))
                }
            </form>
            <button onClick={addEduInputItem}>+</button>
            <br/>
            <button onClick={postTeacherEdu}>학력 등록</button>
        </>
    )
}

export default UserJoinTeacherEdu