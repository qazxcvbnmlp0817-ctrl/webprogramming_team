package com.example.demo.service;

import com.example.demo.dto.CommentDto;
import com.example.demo.dto.CommentWriteRequestDto;
import com.example.demo.entity.Comment;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository    = postRepository;
    }

    public List<CommentDto> getByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedDateAsc(postId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public CommentDto add(Long postId, CommentWriteRequestDto req) {
        Comment c = new Comment();
        c.setPostId(postId);
        c.setAuthor(req.getAuthor());
        c.setAuthorUsername(req.getAuthorUsername());
        c.setContent(req.getContent());
        c.setCreatedDate(LocalDate.now());
        Comment saved = commentRepository.save(c);

        postRepository.findById(postId).ifPresent(post -> {
            post.setCommentCount((int) commentRepository.countByPostId(postId));
            postRepository.save(post);
        });

        return toDto(saved);
    }

    @Transactional
    public CommentDto update(Long postId, Long commentId, CommentWriteRequestDto req) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!c.getPostId().equals(postId))
            throw new RuntimeException("Comment does not belong to this post");
        String stored = c.getAuthorUsername();
        if (stored != null && !stored.equals(req.getAuthorUsername()))
            throw new RuntimeException("No permission");
        c.setContent(req.getContent());
        c.setModifiedDate(LocalDate.now());
        return toDto(commentRepository.save(c));
    }

    @Transactional
    public void delete(Long postId, Long commentId, String username, String memberType) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        String stored = c.getAuthorUsername();
        boolean isAdmin = "admin".equals(memberType);
        if (!isAdmin && stored != null && !stored.equals(username))
            throw new RuntimeException("No permission");
        commentRepository.deleteById(commentId);
        postRepository.findById(postId).ifPresent(post -> {
            post.setCommentCount((int) commentRepository.countByPostId(postId));
            postRepository.save(post);
        });
    }

    private CommentDto toDto(Comment c) {
        return new CommentDto(c.getId(), c.getPostId(), c.getAuthor(),
                              c.getAuthorUsername(), c.getContent(),
                              c.getCreatedDate().toString());
    }
}
