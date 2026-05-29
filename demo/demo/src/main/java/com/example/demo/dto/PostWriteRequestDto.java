package com.example.demo.dto;

import java.util.List;

public class PostWriteRequestDto {
    private String title;
    private String content;
    private String category;
    private String author;
    private List<Integer> targetGrades;
    private String visibility; // public, grade
    private String scopeType;  // dept, faculty, univ
    private Long scopeId;
    private String authorUsername;
    private List<PostAttachmentDto> attachments;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public List<Integer> getTargetGrades() { return targetGrades; }
    public void setTargetGrades(List<Integer> targetGrades) { this.targetGrades = targetGrades; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }
    public Long getScopeId() { return scopeId; }
    public void setScopeId(Long scopeId) { this.scopeId = scopeId; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public List<PostAttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<PostAttachmentDto> attachments) { this.attachments = attachments; }
}
