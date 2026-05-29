package com.example.demo.dto;

import java.util.List;

public class NoticeDto {

    private final Long id;
    private final String title;
    private final String date;
    private final String author;
    private final String category;
    private final int viewCount;
    private final boolean featured;
    private final List<Integer> targetGrades;
    private final String content;
    private final List<PostAttachmentDto> attachments;
    private final String authorUsername;
    private final int commentCount;
    private final boolean isPublicToOutsiders;
    private final String scopeType;
    private final Long scopeId;

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured) {
        this(id, title, date, author, category, viewCount, featured,
             List.of(1, 2, 3, 4), null, null, null, 0, false, null, null);
    }

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured, List<Integer> targetGrades) {
        this(id, title, date, author, category, viewCount, featured,
             targetGrades, null, null, null, 0, false, null, null);
    }

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured,
                     List<Integer> targetGrades, String content, List<PostAttachmentDto> attachments) {
        this(id, title, date, author, category, viewCount, featured,
             targetGrades, content, attachments, null, 0, false, null, null);
    }

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured,
                     List<Integer> targetGrades, String content,
                     List<PostAttachmentDto> attachments, String authorUsername) {
        this(id, title, date, author, category, viewCount, featured,
             targetGrades, content, attachments, authorUsername, 0, false, null, null);
    }

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured,
                     List<Integer> targetGrades, String content,
                     List<PostAttachmentDto> attachments, String authorUsername, int commentCount) {
        this(id, title, date, author, category, viewCount, featured,
             targetGrades, content, attachments, authorUsername, commentCount, false, null, null);
    }

    public NoticeDto(Long id, String title, String date, String author,
                     String category, int viewCount, boolean featured,
                     List<Integer> targetGrades, String content,
                     List<PostAttachmentDto> attachments, String authorUsername, int commentCount,
                     boolean isPublicToOutsiders, String scopeType, Long scopeId) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.author = author;
        this.category = category;
        this.viewCount = viewCount;
        this.featured = featured;
        this.targetGrades = targetGrades;
        this.content = content;
        this.attachments = attachments;
        this.authorUsername = authorUsername;
        this.commentCount = commentCount;
        this.isPublicToOutsiders = isPublicToOutsiders;
        this.scopeType = scopeType;
        this.scopeId = scopeId;
    }

    public Long getId()                             { return id; }
    public String getTitle()                        { return title; }
    public String getDate()                         { return date; }
    public String getAuthor()                       { return author; }
    public String getCategory()                     { return category; }
    public int getViewCount()                       { return viewCount; }
    public boolean isFeatured()                     { return featured; }
    public List<Integer> getTargetGrades()          { return targetGrades; }
    public String getContent()                      { return content; }
    public List<PostAttachmentDto> getAttachments() { return attachments; }
    public String getAuthorUsername()               { return authorUsername; }
    public int getCommentCount()                    { return commentCount; }
    public boolean isPublicToOutsiders()            { return isPublicToOutsiders; }
    public String getScopeType()                    { return scopeType; }
    public Long getScopeId()                        { return scopeId; }
}
