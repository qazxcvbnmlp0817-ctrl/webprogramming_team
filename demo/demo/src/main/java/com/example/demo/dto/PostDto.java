package com.example.demo.dto;

import java.util.List;

/**
 * 게시글 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (posts 변수), templates/board/list.html
 * - 연결 컨트롤러: MainController, BoardController
 * - TODO: [팀원-게시판 담당] 실제 DB 연동 시 PostEntity → PostDto 변환 추가
 */
public class PostDto {

    private final Long id;
    private final String title;
    private final String author;
    private final int likes;
    private final String category;
    private final int viewCount;
    private final String date;
    private final boolean featured;
    private final int commentCount;
    private final boolean isNotice;
    private final String imageUrl;
    private final List<Integer> targetGrades; // [1,2,3,4]
    private final String visibility;          // "public" | "grade"

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility) {
        this.id           = id;
        this.title        = title;
        this.author       = author;
        this.likes        = likes;
        this.category     = category;
        this.viewCount    = viewCount;
        this.date         = date;
        this.featured     = featured;
        this.commentCount = commentCount;
        this.isNotice     = isNotice;
        this.imageUrl     = imageUrl;
        this.targetGrades = targetGrades;
        this.visibility   = visibility;
    }

    public Long getId()                  { return id; }
    public String getTitle()             { return title; }
    public String getAuthor()            { return author; }
    public int getLikes()                { return likes; }
    public String getCategory()          { return category; }
    public int getViewCount()            { return viewCount; }
    public String getDate()              { return date; }
    public boolean isFeatured()          { return featured; }
    public int getCommentCount()         { return commentCount; }
    public boolean isNotice()            { return isNotice; }
    public String getImageUrl()          { return imageUrl; }
    public List<Integer> getTargetGrades() { return targetGrades; }
    public String getVisibility()        { return visibility; }
}
