package com.learnershigh.repository;

import com.learnershigh.domain.StudentClassList;
import com.learnershigh.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentClassListRepository extends JpaRepository<StudentClassList, Long> {
    @Query(value = "SELECT studentClass FROM StudentClassList studentClass WHERE studentClass.classNo.classNo = :classNo")
    List<StudentClassList> findByClassNo(@Param("classNo") Long classNo);


    List<StudentClassList> findAllByUserNo(User userNo);
}

