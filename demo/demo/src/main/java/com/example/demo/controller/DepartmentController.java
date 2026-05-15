package com.example.demo.controller;

import com.example.demo.dto.DepartmentDetailDto;
import com.example.demo.util.DummyDataHelper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DepartmentController {

    @GetMapping("/api/departments/{id}")
    @ResponseBody
    public ResponseEntity<DepartmentDetailDto> getDepartmentDetail(@PathVariable Long id) {
        DepartmentDetailDto detail = DummyDataHelper.findDepartmentDetail(id);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }
}
