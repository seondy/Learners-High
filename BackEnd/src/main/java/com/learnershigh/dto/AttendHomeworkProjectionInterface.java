package com.learnershigh.dto;

public interface AttendHomeworkProjectionInterface {
    // 수업 회차 no
    Long getClassRoundNo();

    // 수업 회차 출결 상태
    String getClassAttendStatus();

    // 수업 회차 과제 상태
    String getHomeworkStatus();

    // 수업 회차 과제 파일 명
    String getHomeworkFileName();

    // 수업 회차 과제 원본파일 명
    String getHomeworkFileOriginName();
}
