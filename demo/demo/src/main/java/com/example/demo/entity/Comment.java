package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "COMMENTS")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column
    private String authorUsername;

    @Column
    private LocalDate modifiedDate;

    @Column
    private Long parentId;   // null → 원댓글, not null → 대댓글

    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }
    public Long getPostId()                          { return postId; }
    public void setPostId(Long postId)               { this.postId = postId; }
    public String getAuthor()                        { return author; }
    public void setAuthor(String author)             { this.author = author; }
    public String getContent()                       { return content; }
    public void setContent(String content)           { this.content = content; }
    public LocalDate getCreatedDate()                { return createdDate; }
    public void setCreatedDate(LocalDate d)          { this.createdDate = d; }
    public String getAuthorUsername()                { return authorUsername; }
    public void setAuthorUsername(String u)          { this.authorUsername = u; }
    public LocalDate getModifiedDate()               { return modifiedDate; }
    public void setModifiedDate(LocalDate d)         { this.modifiedDate = d; }
    public Long getParentId()                        { return parentId; }
    public void setParentId(Long parentId)           { this.parentId = parentId; }
}
