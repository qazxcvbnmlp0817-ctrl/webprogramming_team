package com.example.demo.service;

import com.example.demo.dto.PostAttachmentDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.PostWriteRequestDto;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostAttachment;
import com.example.demo.entity.PostLike;
import com.example.demo.repository.PostAttachmentRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.util.DummyDataHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostAttachmentRepository attachmentRepository;

    public PostService(PostRepository postRepository,
                       PostLikeRepository postLikeRepository,
                       PostAttachmentRepository attachmentRepository) {
        this.postRepository     = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.attachmentRepository = attachmentRepository;
    }

    public List<PostDto> getPostsByUsername(String username) {
        return postRepository.findByAuthorUsernameOrderByCreatedDateDesc(username)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PostDto> getPostsByDept(Long deptId) {
        List<Post> posts = postRepository
                .findByScopeTypeAndScopeIdOrderByCreatedDateDesc("dept", deptId);
        if (posts.isEmpty()) return DummyDataHelper.getPostsByDept(deptId);
        return posts.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PostDto> getPostsByFaculty(Long facultyId) {
        List<Post> posts = postRepository
                .findByScopeTypeAndScopeIdOrderByCreatedDateDesc("faculty", facultyId);
        if (posts.isEmpty()) return DummyDataHelper.getPostsByFaculty(facultyId);
        return posts.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PostDto> getPostsByUniv(Long univId) {
        List<Post> posts = postRepository
                .findByScopeTypeAndScopeIdOrderByCreatedDateDesc("univ", univId);
        if (posts.isEmpty()) return DummyDataHelper.getUniversityPosts(univId);
        return posts.stream().map(this::toDto).collect(Collectors.toList());
    }

    public PostDto getById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found: " + id));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        return toDto(post);
    }

    @Transactional
    public Post create(PostWriteRequestDto req) {
        Post post = new Post();
        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setAuthor(req.getAuthor());
        post.setCategory(req.getCategory());
        post.setVisibility(req.getVisibility() != null ? req.getVisibility() : "public");
        post.setScopeType(req.getScopeType());
        post.setScopeId(req.getScopeId());
        post.setTargetGrades(gradesToString(req.getTargetGrades()));
        post.setAuthorUsername(req.getAuthorUsername());
        post.setCreatedDate(LocalDateTime.now());
        post.setViewCount(0);
        post.setLikes(0);
        post.setCommentCount(0);
        post.setFeatured(false);
        post.setNotice(false);
        Post saved = postRepository.save(post);

        if (req.getAttachments() != null) {
            for (PostAttachmentDto a : req.getAttachments()) {
                PostAttachment entity = new PostAttachment();
                entity.setPostId(saved.getId());
                entity.setOriginalName(a.getOriginalName());
                String savedName = a.getUrl().replace("/uploads/", "");
                entity.setSavedName(savedName);
                entity.setFileSize(a.getFileSize());
                entity.setFileType(a.getFileType() != null ? a.getFileType() : "");
                entity.setImage(a.isImage());
                attachmentRepository.save(entity);
            }
        }
        return saved;
    }

    public PostDto update(Long id, PostWriteRequestDto req) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found: " + id));
        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setCategory(req.getCategory());
        if (req.getVisibility() != null) post.setVisibility(req.getVisibility());
        if (req.getTargetGrades() != null) post.setTargetGrades(gradesToString(req.getTargetGrades()));
        return toDto(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        List<PostAttachment> attachments = attachmentRepository.findByPostIdOrderByIdAsc(id);
        for (PostAttachment a : attachments) {
            try { Files.deleteIfExists(Paths.get(uploadDir, a.getSavedName())); }
            catch (IOException ignored) {}
        }
        attachmentRepository.deleteByPostId(id);
        postRepository.deleteById(id);
    }

    public Map<String, Object> toggleLike(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUsername(postId, username);
        boolean liked;
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            liked = false;
        } else {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUsername(username);
            postLikeRepository.save(like);
            liked = true;
        }
        int count = (int) postLikeRepository.countByPostId(postId);
        post.setLikes(count);
        postRepository.save(post);
        return Map.of("liked", liked, "likes", count);
    }

    public boolean isLikedByUser(Long postId, String username) {
        return postLikeRepository.findByPostIdAndUsername(postId, username).isPresent();
    }

    public int getLikeCount(Long postId) {
        return (int) postLikeRepository.countByPostId(postId);
    }

    private String gradesToString(List<Integer> grades) {
        if (grades == null || grades.isEmpty()) return "1,2,3,4";
        return grades.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private PostDto toDto(Post p) {
        List<Integer> grades = parseGrades(p.getTargetGrades());
        List<PostAttachmentDto> attachments = attachmentRepository
                .findByPostIdOrderByIdAsc(p.getId())
                .stream()
                .map(a -> new PostAttachmentDto(
                        a.getId(), a.getOriginalName(), "/uploads/" + a.getSavedName(),
                        a.getFileSize(), a.getFileType(), a.isImage()))
                .collect(Collectors.toList());

        return new PostDto(
                p.getId(),
                p.getTitle(),
                p.getAuthor(),
                p.getLikes(),
                p.getCategory(),
                p.getViewCount(),
                p.getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                p.isFeatured(),
                p.getCommentCount(),
                p.isNotice(),
                p.getImageUrl(),
                grades,
                p.getVisibility(),
                p.getContent(),
                p.getAuthorUsername(),
                attachments
        );
    }

    private List<Integer> parseGrades(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }
}
