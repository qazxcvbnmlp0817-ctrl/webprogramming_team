package com.example.demo.dto;

import java.util.List;

public class NoticeWriteRequestDto {
    private String title;
    private String content;
    private String category;
    private String author;
    private String scopeType;
    private Long scopeId;
    private List<Integer> targetGrades;
    private List<PostAttachmentDto> attachments;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }
    public Long getScopeId() { return scopeId; }
    public void setScopeId(Long scopeId) { this.scopeId = scopeId; }
    public List<Integer> getTargetGrades() { return targetGrades; }
    public void setTargetGrades(List<Integer> targetGrades) { this.targetGrades = targetGrades; }
    public List<PostAttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<PostAttachmentDto> attachments) { this.attachments = attachments; }
    private String authorUsername;
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    private Boolean isPublicToOutsiders;
    public Boolean getIsPublicToOutsiders() { return isPublicToOutsiders; }
    public void setIsPublicToOutsiders(Boolean isPublicToOutsiders) { this.isPublicToOutsiders = isPublicToOutsiders; }
}
