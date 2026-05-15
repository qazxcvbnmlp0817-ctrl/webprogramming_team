package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class NoticeController {

    @GetMapping("/api/notices")
    @ResponseBody
    public Map<String, Object> apiNotices(@RequestParam(required = false) Long deptId) {
        List<NoticeDto> notices = (deptId != null)
            ? DummyDataHelper.getNoticesByDept(deptId)
            : DummyDataHelper.getNoticesByDept(1L);
        if (notices.isEmpty()) return Map.of("notices", notices);
        return Map.of("featured", notices.get(0), "notices", notices);
    }
}
