package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "NOTICE_COMMENTS")
public class NoticeComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long noticeId;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String authorUsername;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column
    private LocalDate modifiedDate;

    public Long getId()                      { return id; }
    public void setId(Long id)               { this.id = id; }
    public Long getNoticeId()                { return noticeId; }
    public void setNoticeId(Long noticeId)   { this.noticeId = noticeId; }
    public String getAuthor()                { return author; }
    public void setAuthor(String author)     { this.author = author; }
    public String getAuthorUsername()        { return authorUsername; }
    public void setAuthorUsername(String u)  { this.authorUsername = u; }
    public String getContent()               { return content; }
    public void setContent(String content)   { this.content = content; }
    public LocalDate getCreatedDate()        { return createdDate; }
    public void setCreatedDate(LocalDate d)  { this.createdDate = d; }
    public LocalDate getModifiedDate()       { return modifiedDate; }
    public void setModifiedDate(LocalDate d) { this.modifiedDate = d; }
}
