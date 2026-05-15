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
        PostDto featured = posts.get(0);
        return Map.of("featured", featured, "posts", posts);
    }
}
