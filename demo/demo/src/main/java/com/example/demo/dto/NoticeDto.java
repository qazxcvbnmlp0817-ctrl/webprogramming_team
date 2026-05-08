package com.example.demo.dto;

/**
 * 공지사항 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (notices 변수), templates/notice/list.html
 * - 연결 컨트롤러: MainController, NoticeController
 * - TODO: [팀원-공지사항 담당] 실제 DB 연동 시 NoticeEntity → NoticeDto 변환 추가
 */
public class NoticeDto {

    private final Long id;
    private final String title;   // 공지사항 제목
    private final String date;    // 작성 날짜 (yyyy-MM-dd 형식)
    private final String author;  // 작성자

    public NoticeDto(Long id, String title, String date, String author) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.author = author;
    }

    public Long getId()     { return id; }
    public String getTitle()  { return title; }
    public String getDate()   { return date; }
    public String getAuthor() { return author; }
}
