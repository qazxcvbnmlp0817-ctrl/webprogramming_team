package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NOTICE_ATTACHMENTS")
public class NoticeAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long noticeId;

    @Column(nullable = false, length = 512)
    private String originalName;

    @Column(nullable = false)
    private String savedName;

    private long fileSize;

    private String fileType;

    private boolean isImage;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getNoticeId() { return noticeId; }
    public void setNoticeId(Long noticeId) { this.noticeId = noticeId; }
    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }
    public String getSavedName() { return savedName; }
    public void setSavedName(String savedName) { this.savedName = savedName; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public boolean isImage() { return isImage; }
    public void setImage(boolean image) { isImage = image; }
}
