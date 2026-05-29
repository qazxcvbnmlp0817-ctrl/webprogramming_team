package com.example.demo.dto;

public class NoticeCommentWriteRequestDto {
    private String author;
    private String authorUsername;
    private String content;
    private Long parentId;

    public String getAuthor()               { return author; }
    public void setAuthor(String author)    { this.author = author; }
    public String getAuthorUsername()       { return authorUsername; }
    public void setAuthorUsername(String u) { this.authorUsername = u; }
    public String getContent()              { return content; }
    public void setContent(String content)  { this.content = content; }
    public Long getParentId()               { return parentId; }
    public void setParentId(Long parentId)  { this.parentId = parentId; }
}
