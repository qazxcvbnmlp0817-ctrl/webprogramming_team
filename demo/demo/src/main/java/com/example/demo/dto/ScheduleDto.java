package com.example.demo.dto;

/**
 * 일정 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (schedules 변수), templates/schedule/list.html
 * - 연결 컨트롤러: MainController, ScheduleController
 * - TODO: [팀원-일정 담당] 실제 DB 연동 시 ScheduleEntity → ScheduleDto 변환 추가
 */
public class ScheduleDto {

    private final Long id;
    private final String title;  // 일정 이름
    private final String date;   // 일정 날짜 (yyyy-MM-dd 형식)
    private final int dday;      // D-Day 계산값 (주의: 더미 데이터에서는 정적 값 — 실제 연동 시 서비스에서 ChronoUnit.DAYS.between(LocalDate.now(), eventDate)로 계산할 것)

    public ScheduleDto(Long id, String title, String date, int dday) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.dday = dday;
    }

    public Long getId()    { return id; }
    public String getTitle() { return title; }
    public String getDate()  { return date; }
    public int getDday()     { return dday; }
}
