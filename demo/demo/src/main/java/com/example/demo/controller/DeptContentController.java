package com.example.demo.controller;

import com.example.demo.dto.DeptPageContentDto;
import com.example.demo.service.DeptAuthService;
import com.example.demo.service.DeptContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dept/content")
public class DeptContentController {

    private final DeptAuthService deptAuthService;
    private final DeptContentService deptContentService;

    public DeptContentController(DeptAuthService deptAuthService,
                                  DeptContentService deptContentService) {
        this.deptAuthService = deptAuthService;
        this.deptContentService = deptContentService;
    }

    @GetMapping
    public ResponseEntity<DeptPageContentDto> getContent(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        Long resolved = deptAuthService.resolveDeptId(username, deptId);
        return ResponseEntity.ok(deptContentService.getContent(resolved));
    }

    @PutMapping
    public ResponseEntity<Void> saveContent(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId,
            @RequestBody DeptPageContentDto dto) {
        Long resolved = deptAuthService.resolveDeptId(username, deptId);
        deptContentService.saveContent(resolved, dto, username);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/section/{section}")
    public ResponseEntity<Void> saveSection(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId,
            @PathVariable String section,
            @RequestBody DeptPageContentDto dto) {
        Long resolved = deptAuthService.resolveDeptId(username, deptId);
        deptContentService.saveSection(resolved, section, dto, username);
        return ResponseEntity.ok().build();
    }
}
