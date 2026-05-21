package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOTICES")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    private String content;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String category; // 학사, 장학, 행사, 취업

    @Column(nullable = false)
    private int viewCount;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private String scopeType; // dept, faculty, univ

    @Column(nullable = false)
    private Long scopeId;

    @Column
    private String targetGrades; // 쉼표 구분 (예: "1,2,3,4")

    @Column
    private String authorUsername;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }
    public Long getScopeId() { return scopeId; }
    public void setScopeId(Long scopeId) { this.scopeId = scopeId; }
    public String getTargetGrades() { return targetGrades; }
    public void setTargetGrades(String targetGrades) { this.targetGrades = targetGrades; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
}
