package com.example.demo.dto;

public class CommentDto {
    private final Long id;
    private final Long postId;
    private final String author;
    private final String authorUsername;
    private final String content;
    private final String date;
    private final Long parentId;
    private final String postTitle;

    public CommentDto(Long id, Long postId, String author, String content, String date) {
        this(id, postId, author, null, content, date, null, null);
    }

    public CommentDto(Long id, Long postId, String author, String authorUsername,
                      String content, String date) {
        this(id, postId, author, authorUsername, content, date, null, null);
    }

    public CommentDto(Long id, Long postId, String author, String authorUsername,
                      String content, String date, Long parentId) {
        this(id, postId, author, authorUsername, content, date, parentId, null);
    }

    public CommentDto(Long id, Long postId, String author, String authorUsername,
                      String content, String date, Long parentId, String postTitle) {
        this.id = id; this.postId = postId; this.author = author;
        this.authorUsername = authorUsername; this.content = content;
        this.date = date; this.parentId = parentId; this.postTitle = postTitle;
    }

    public Long getId()               { return id; }
    public Long getPostId()           { return postId; }
    public String getAuthor()         { return author; }
    public String getAuthorUsername() { return authorUsername; }
    public String getContent()        { return content; }
    public String getDate()           { return date; }
    public Long getParentId()         { return parentId; }
    public String getPostTitle()      { return postTitle; }
}
