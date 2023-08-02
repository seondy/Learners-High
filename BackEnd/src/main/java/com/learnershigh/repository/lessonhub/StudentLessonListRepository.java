package com.learnershigh.repository.lessonhub;

import com.learnershigh.domain.lesson.Lesson;
import com.learnershigh.domain.lessonhub.StudentLessonList;
import com.learnershigh.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentLessonListRepository extends JpaRepository<StudentLessonList, Long> {
    @Query(value = "SELECT studentLesson FROM StudentLessonList studentLesson WHERE studentLesson.lessonNo.lessonNo = :lessonNo")
    List<StudentLessonList> findByLessonNo(@Param("lessonNo") Long lessonNo);

    StudentLessonList findByLessonNoAndUserNo(Lesson lessonNo, User userNo);

    List<StudentLessonList> findAllByUserNo(User userNo);
}

