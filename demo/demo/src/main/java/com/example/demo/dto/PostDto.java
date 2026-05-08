package com.example.demo.dto;

/**
 * 게시글 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (posts 변수), templates/board/list.html
 * - 연결 컨트롤러: MainController, BoardController
 * - TODO: [팀원-게시판 담당] 실제 DB 연동 시 PostEntity → PostDto 변환 추가
 */
public class PostDto {

    private final Long id;
    private final String title;   // 게시글 제목
    private final String author;  // 작성자
    private final int likes;      // 좋아요 수 (인기순 정렬 기준)

    public PostDto(Long id, String title, String author, int likes) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.likes = likes;
    }

    public Long getId()     { return id; }
    public String getTitle()  { return title; }
    public String getAuthor() { return author; }
    public int getLikes()     { return likes; }
}
