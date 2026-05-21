package com.example.demo.controller;

import com.example.demo.dto.CommentDto;
import com.example.demo.dto.CommentWriteRequestDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.PostWriteRequestDto;
import com.example.demo.service.CommentService;
import com.example.demo.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class BoardController {

    private final PostService postService;
    private final CommentService commentService;

    public BoardController(PostService postService, CommentService commentService) {
        this.postService    = postService;
        this.commentService = commentService;
    }

    // ── 목록 조회 ────────────────────────────────────────────────────────────

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

    // ── 단건 조회 (조회수 +1) ────────────────────────────────────────────────

    @GetMapping("/api/posts/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long id) {
        try { return ResponseEntity.ok(postService.getById(id)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    // ── 글쓰기 ───────────────────────────────────────────────────────────────

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

    // ── 수정 / 삭제 ──────────────────────────────────────────────────────────

    @PutMapping("/api/posts/{id}")
    public ResponseEntity<PostDto> updatePost(@PathVariable Long id,
                                              @RequestBody PostWriteRequestDto req) {
        try { return ResponseEntity.ok(postService.update(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/api/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── 추천 ─────────────────────────────────────────────────────────────────

    @GetMapping("/api/posts/{id}/like")
    public ResponseEntity<Map<String, Object>> getLikeStatus(@PathVariable Long id,
                                                              @RequestParam String username) {
        boolean liked = postService.isLikedByUser(id, username);
        int count = postService.getLikeCount(id);
        return ResponseEntity.ok(Map.of("liked", liked, "likes", count));
    }

    @PostMapping("/api/posts/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long id,
                                                           @RequestParam String username) {
        try { return ResponseEntity.ok(postService.toggleLike(id, username)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    // ── 댓글 ─────────────────────────────────────────────────────────────────

    @GetMapping("/api/posts/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getByPostId(id));
    }

    @PostMapping("/api/posts/{id}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long id,
                                                  @RequestBody CommentWriteRequestDto req) {
        return ResponseEntity.ok(commentService.add(id, req));
    }

    @DeleteMapping("/api/posts/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                               @PathVariable Long commentId) {
        commentService.delete(id, commentId);
        return ResponseEntity.noContent().build();
    }
}
