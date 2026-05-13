package com.example.demo.dto;

/**
 * 게시글 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (posts 변수), templates/board/list.html
 * - 연결 컨트롤러: MainController, BoardController
 * - TODO: [팀원-게시판 담당] 실제 DB 연동 시 PostEntity → PostDto 변환 추가
 */
public class PostDto {

    private final Long id;
    private final String title;      // 게시글 제목
    private final String author;     // 작성자
    private final int likes;         // 좋아요 수
    private final String category;   // 카테고리 (자유게시판·질문·스터디·취업후기)
    private final int viewCount;     // 조회수
    private final String date;       // 작성일 (yyyy-MM-dd)
    private final boolean featured;  // 대표 게시글 여부
    private final int commentCount; // 댓글 수

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured, int commentCount) {
        this.id           = id;
        this.title        = title;
        this.author       = author;
        this.likes        = likes;
        this.category     = category;
        this.viewCount    = viewCount;
        this.date         = date;
        this.featured     = featured;
        this.commentCount = commentCount;
    }

    public Long getId()          { return id; }
    public String getTitle()     { return title; }
    public String getAuthor()    { return author; }
    public int getLikes()        { return likes; }
    public String getCategory()  { return category; }
    public int getViewCount()    { return viewCount; }
    public String getDate()      { return date; }
    public boolean isFeatured()  { return featured; }
    public int getCommentCount() { return commentCount; }
}
