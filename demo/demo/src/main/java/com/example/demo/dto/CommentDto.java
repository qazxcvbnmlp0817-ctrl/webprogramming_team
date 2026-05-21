package com.example.demo.dto;

public class CommentDto {
    private final Long id;
    private final Long postId;
    private final String author;
    private final String content;
    private final String date;

    public CommentDto(Long id, Long postId, String author, String content, String date) {
        this.id = id; this.postId = postId; this.author = author;
        this.content = content; this.date = date;
    }

    public Long getId()        { return id; }
    public Long getPostId()    { return postId; }
    public String getAuthor()  { return author; }
    public String getContent() { return content; }
    public String getDate()    { return date; }
}
