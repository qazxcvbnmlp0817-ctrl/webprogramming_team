package com.example.demo.dto;

public class NoticeCommentDto {
    private final Long id;
    private final Long noticeId;
    private final String author;
    private final String authorUsername;
    private final String content;
    private final String date;

    public NoticeCommentDto(Long id, Long noticeId, String author, String authorUsername,
                            String content, String date) {
        this.id = id; this.noticeId = noticeId; this.author = author;
        this.authorUsername = authorUsername; this.content = content; this.date = date;
    }

    public Long getId()               { return id; }
    public Long getNoticeId()         { return noticeId; }
    public String getAuthor()         { return author; }
    public String getAuthorUsername() { return authorUsername; }
    public String getContent()        { return content; }
    public String getDate()           { return date; }
}
