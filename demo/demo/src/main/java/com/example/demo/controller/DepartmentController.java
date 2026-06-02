package com.example.demo.controller;

import com.example.demo.dto.DepartmentDetailDto;
import com.example.demo.service.UniversityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DepartmentController {

    private final UniversityService universityService;

    public DepartmentController(UniversityService universityService) {
        this.universityService = universityService;
    }

    @GetMapping("/api/departments/{id}")
    public ResponseEntity<DepartmentDetailDto> getDepartmentDetail(@PathVariable Long id) {
        return universityService.getDepartmentDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
