package com.example.demo.dto;

import java.util.List;

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
    private final List<Integer> targetGrades;
    private final String visibility;
    private final String content;
    private final String authorUsername;
    private final List<PostAttachmentDto> attachments;
    private final String scopeType;
    private final Long scopeId;
    private final boolean hidden;

    // DummyDataHelper 호환용 (content = null, authorUsername = null, attachments = null)
    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility) {
        this(id, title, author, likes, category, viewCount, date, featured,
             commentCount, isNotice, imageUrl, targetGrades, visibility, null, null, null, null, null, false);
    }

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility, String content) {
        this(id, title, author, likes, category, viewCount, date, featured,
             commentCount, isNotice, imageUrl, targetGrades, visibility, content, null, null, null, null, false);
    }

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility, String content,
                   String authorUsername) {
        this(id, title, author, likes, category, viewCount, date, featured,
             commentCount, isNotice, imageUrl, targetGrades, visibility, content,
             authorUsername, null, null, null, false);
    }

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility, String content,
                   String authorUsername, List<PostAttachmentDto> attachments) {
        this(id, title, author, likes, category, viewCount, date, featured,
             commentCount, isNotice, imageUrl, targetGrades, visibility, content,
             authorUsername, attachments, null, null, false);
    }

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility, String content,
                   String authorUsername, List<PostAttachmentDto> attachments,
                   String scopeType, Long scopeId) {
        this(id, title, author, likes, category, viewCount, date, featured,
             commentCount, isNotice, imageUrl, targetGrades, visibility, content,
             authorUsername, attachments, scopeType, scopeId, false);
    }

    public PostDto(Long id, String title, String author, int likes,
                   String category, int viewCount, String date, boolean featured,
                   int commentCount, boolean isNotice, String imageUrl,
                   List<Integer> targetGrades, String visibility, String content,
                   String authorUsername, List<PostAttachmentDto> attachments,
                   String scopeType, Long scopeId, boolean hidden) {
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
        this.content      = content;
        this.authorUsername = authorUsername;
        this.attachments  = attachments;
        this.scopeType    = scopeType;
        this.scopeId      = scopeId;
        this.hidden       = hidden;
    }

    public Long getId()                              { return id; }
    public String getTitle()                         { return title; }
    public String getAuthor()                        { return author; }
    public int getLikes()                            { return likes; }
    public String getCategory()                      { return category; }
    public int getViewCount()                        { return viewCount; }
    public String getDate()                          { return date; }
    public boolean isFeatured()                      { return featured; }
    public int getCommentCount()                     { return commentCount; }
    public boolean isNotice()                        { return isNotice; }
    public String getImageUrl()                      { return imageUrl; }
    public List<Integer> getTargetGrades()           { return targetGrades; }
    public String getVisibility()                    { return visibility; }
    public String getContent()                       { return content; }
    public String getAuthorUsername()                { return authorUsername; }
    public List<PostAttachmentDto> getAttachments()  { return attachments; }
    public String getScopeType()                     { return scopeType; }
    public Long getScopeId()                         { return scopeId; }
    public boolean isHidden()                        { return hidden; }
}
