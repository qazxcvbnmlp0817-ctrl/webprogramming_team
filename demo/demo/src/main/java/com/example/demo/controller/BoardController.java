package com.example.demo.controller;

import com.example.demo.dto.PostDto;
import com.example.demo.dto.PostWriteRequestDto;
import com.example.demo.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class BoardController {

    private final PostService postService;

    public BoardController(PostService postService) {
        this.postService = postService;
    }

    // ── GET ──────────────────────────────────────────────────────────────────

    @GetMapping("/api/posts")
    public Map<String, Object> apiPosts(@RequestParam(required = false) Long deptId) {
        List<PostDto> posts = postService.getPostsByDept(deptId != null ? deptId : 1L);
        if (posts.isEmpty()) return Map.of("posts", posts);
        return Map.of("featured", posts.get(0), "posts", posts);
    }

    @GetMapping("/api/faculty/posts")
    public Map<String, Object> facultyPosts(@RequestParam(required = false) Long facultyId) {
        List<PostDto> posts = postService.getPostsByFaculty(facultyId != null ? facultyId : 1L);
        if (posts.isEmpty()) return Map.of("posts", posts);
        return Map.of("featured", posts.get(0), "posts", posts);
    }

    @GetMapping("/api/univ/posts")
    public Map<String, Object> univPosts(@RequestParam(required = false) Long univId) {
        List<PostDto> posts = postService.getPostsByUniv(univId != null ? univId : 1L);
        if (posts.isEmpty()) return Map.of("posts", posts);
        return Map.of("featured", posts.get(0), "posts", posts);
    }

    // ── POST ─────────────────────────────────────────────────────────────────

    @PostMapping("/api/posts")
    public ResponseEntity<Map<String, Object>> createDeptPost(@RequestBody PostWriteRequestDto req) {
        req.setScopeType("dept");
        postService.create(req);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/api/faculty/posts")
    public ResponseEntity<Map<String, Object>> createFacultyPost(@RequestBody PostWriteRequestDto req) {
        req.setScopeType("faculty");
        postService.create(req);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/api/univ/posts")
    public ResponseEntity<Map<String, Object>> createUnivPost(@RequestBody PostWriteRequestDto req) {
        req.setScopeType("univ");
        postService.create(req);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
