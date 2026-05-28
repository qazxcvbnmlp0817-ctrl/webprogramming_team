package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PostAttachmentDto {
    private Long id;
    private String originalName;
    private String url;
    private long fileSize;
    private String fileType;
    private boolean isImage;

    public PostAttachmentDto() {}

    public PostAttachmentDto(Long id, String originalName, String url,
                             long fileSize, String fileType, boolean isImage) {
        this.id           = id;
        this.originalName = originalName;
        this.url          = url;
        this.fileSize     = fileSize;
        this.fileType     = fileType;
        this.isImage      = isImage;
    }

    public Long getId()             { return id; }
    public void setId(Long id)      { this.id = id; }
    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }
    public String getUrl()          { return url; }
    public void setUrl(String url)  { this.url = url; }
    public long getFileSize()       { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getFileType()     { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    @JsonProperty("isImage")
    public boolean isImage()        { return isImage; }
    @JsonProperty("isImage")
    public void setImage(boolean image) { isImage = image; }
}
