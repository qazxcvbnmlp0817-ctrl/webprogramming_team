package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "POSTS")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    private String content;

    @Column(nullable = false)
    private String author;

    private int likes;

    @Column(nullable = false)
    private String category; // 자유게시판, 취업후기, 스터디, 질문

    private int viewCount;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    private boolean featured;
    private int commentCount;
    private boolean isNotice;
    private String imageUrl;

    private String targetGrades; // 쉼표 구분 "1,2,3,4"

    private String authorUsername; // 로그인 ID (수정/삭제 권한 확인용)

    @Column(nullable = false)
    private String visibility; // public, grade

    @Column(nullable = false)
    private String scopeType; // dept, faculty, univ

    @Column(nullable = false)
    private Long scopeId;

    @Column(nullable = true)
    private Boolean hidden = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
    public boolean isNotice() { return isNotice; }
    public void setNotice(boolean notice) { isNotice = notice; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getTargetGrades() { return targetGrades; }
    public void setTargetGrades(String targetGrades) { this.targetGrades = targetGrades; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }
    public Long getScopeId() { return scopeId; }
    public void setScopeId(Long scopeId) { this.scopeId = scopeId; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public boolean isHidden() { return Boolean.TRUE.equals(hidden); }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
}
