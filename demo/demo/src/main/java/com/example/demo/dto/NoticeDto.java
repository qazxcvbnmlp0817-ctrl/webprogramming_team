package com.example.demo.dto;

/**
 * 공지사항 데이터 전송 객체
 * - 연결 컨트롤러: NoticeController, MainController
 * - 연결 템플릿: notice/list.html, main/index.html
 */
public class NoticeDto {

    private final Long id;
    private final String title;
    private final String date;
    private final String author;
    private final String category;   // 카테고리: 학사·장학·행사·취업
    private final int viewCount;     // 조회수
    private final boolean featured;  // 긴급/대표 공지 여부

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.author = author;
        this.category = category;
        this.viewCount = viewCount;
        this.featured = featured;
    }

    public Long getId()         { return id; }
    public String getTitle()    { return title; }
    public String getDate()     { return date; }
    public String getAuthor()   { return author; }
    public String getCategory() { return category; }
    public int getViewCount()   { return viewCount; }
    public boolean isFeatured() { return featured; }
}
