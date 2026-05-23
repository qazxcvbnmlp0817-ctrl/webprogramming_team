package com.example.demo.dto;

public class CommentWriteRequestDto {
    private String author;
    private String authorUsername;
    private String content;

    public String getAuthor()                      { return author; }
    public void setAuthor(String author)           { this.author = author; }
    public String getAuthorUsername()              { return authorUsername; }
    public void setAuthorUsername(String u)        { this.authorUsername = u; }
    public String getContent()                     { return content; }
    public void setContent(String content)         { this.content = content; }
}
