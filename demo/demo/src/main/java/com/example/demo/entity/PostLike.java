package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "POST_LIKES",
       uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "username"}))
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(nullable = false)
    private String username;

    public Long getId()                        { return id; }
    public Long getPostId()                    { return postId; }
    public void setPostId(Long postId)         { this.postId = postId; }
    public String getUsername()                { return username; }
    public void setUsername(String username)   { this.username = username; }
}
