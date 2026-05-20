package com.example.demo.service;

import com.example.demo.dto.PostDto;
import com.example.demo.dto.PostWriteRequestDto;
import com.example.demo.entity.Post;
import com.example.demo.repository.PostRepository;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
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
        post.setCreatedDate(LocalDate.now());
        post.setViewCount(0);
        post.setLikes(0);
        post.setCommentCount(0);
        post.setFeatured(false);
        post.setNotice(false);
        return postRepository.save(post);
    }

    private String gradesToString(List<Integer> grades) {
        if (grades == null || grades.isEmpty()) return "1,2,3,4";
        return grades.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private PostDto toDto(Post p) {
        List<Integer> grades = parseGrades(p.getTargetGrades());
        return new PostDto(
                p.getId(),
                p.getTitle(),
                p.getAuthor(),
                p.getLikes(),
                p.getCategory(),
                p.getViewCount(),
                p.getCreatedDate().toString(),
                p.isFeatured(),
                p.getCommentCount(),
                p.isNotice(),
                p.getImageUrl(),
                grades,
                p.getVisibility()
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
