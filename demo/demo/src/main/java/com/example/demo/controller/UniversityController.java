package com.example.demo.controller;

import com.example.demo.dto.UniversityDto;
import com.example.demo.service.UniversityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UniversityController {

    private final UniversityService universityService;

    public UniversityController(UniversityService universityService) {
        this.universityService = universityService;
    }

    @GetMapping("/api/universities")
    public List<UniversityDto> apiUniversities() {
        return universityService.getAllUniversities();
    }

    @GetMapping("/api/universities/{id}")
    public ResponseEntity<UniversityDto> apiUniversity(@PathVariable Long id) {
        return universityService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
