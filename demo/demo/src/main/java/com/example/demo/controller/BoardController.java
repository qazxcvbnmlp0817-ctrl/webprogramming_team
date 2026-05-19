package com.example.demo.controller;

import com.example.demo.dto.PostDto;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class BoardController {

    @GetMapping("/api/posts")
    @ResponseBody
    public Map<String, Object> apiPosts(@RequestParam(required = false) Long deptId) {
        List<PostDto> posts = (deptId != null)
            ? DummyDataHelper.getPostsByDept(deptId)
            : DummyDataHelper.getPostsByDept(1L);
        if (posts.isEmpty()) return Map.of("posts", posts);
        return Map.of("featured", posts.get(0), "posts", posts);
    }

    @GetMapping("/api/faculty/posts")
    @ResponseBody
    public Map<String, Object> facultyPosts(@RequestParam(required = false) Long facultyId) {
        List<PostDto> posts = (facultyId != null)
            ? DummyDataHelper.getPostsByFaculty(facultyId)
            : DummyDataHelper.getPostsByFaculty(1L);
        if (posts.isEmpty()) return Map.of("posts", posts);
        return Map.of("featured", posts.get(0), "posts", posts);
    }
}
