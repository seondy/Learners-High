package com.learnershigh.controller;

import com.learnershigh.dto.ClassListDto;
import com.learnershigh.dto.ClassRoundDetailDto;
import com.learnershigh.dto.CustomResponseBody;
import com.learnershigh.dto.StudentAttendHomeworkDto;
import com.learnershigh.service.ClassRoundService;
import com.learnershigh.service.ClassroomService;
import com.learnershigh.service.TeacherService;
import io.swagger.annotations.Api;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;


@RestController
@RequestMapping("/classroom")
@Api(tags = {"실시간 수업에 대한 API"})
@RequiredArgsConstructor
@CrossOrigin("*")
public class ClassroomController {
    private final ClassroomService classroomService;
    private final ClassRoundService classRoundService;

    // 수업 생성 및 출석
    @GetMapping("/teacher/{classNo}/{classRoundNo}")
    public ResponseEntity<CustomResponseBody> createClassroom(@PathVariable Long classNo, @PathVariable Long classRoundNo) {
        CustomResponseBody responseBody = new CustomResponseBody("수업 생성 완료");
        classroomService.createClassroom(classNo, classRoundNo);
        return ResponseEntity.ok().body(responseBody);
    }


}
