package com.example.demo.controller;

import com.example.demo.dto.UniversityDto;
import com.example.demo.util.DummyDataHelper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class UniversityController {

    @GetMapping("/api/universities")
    @ResponseBody
    public List<UniversityDto> apiUniversities() {
        return DummyDataHelper.getUniversities();
    }

    @GetMapping("/api/universities/{id}")
    @ResponseBody
    public ResponseEntity<UniversityDto> apiUniversity(@PathVariable Long id) {
        UniversityDto university = DummyDataHelper.findUniversity(id);
        if (university == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(university);
    }
}
