package com.example.demo.controller;

import com.example.demo.dto.ActivityDto;
import com.example.demo.service.ActivityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/ranking")
    public List<ActivityDto> getRanking(
            @RequestParam(defaultValue = "univ") String scopeType) {
        return activityService.getActivityRanking(scopeType);
    }
}
