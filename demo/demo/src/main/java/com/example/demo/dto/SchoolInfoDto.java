package com.example.demo.dto;

import java.util.List;

public class SchoolInfoDto {
    private final UniversityDto university;
    private final SchoolPageContentDto content;
    private final SchoolInfoSummaryDto summary;
    private final List<NoticeDto> latestNotices;
    private final List<ScheduleDto> upcomingSchedules;

    public SchoolInfoDto(UniversityDto university,
                         SchoolPageContentDto content,
                         SchoolInfoSummaryDto summary,
                         List<NoticeDto> latestNotices,
                         List<ScheduleDto> upcomingSchedules) {
        this.university = university;
        this.content = content;
        this.summary = summary;
        this.latestNotices = latestNotices;
        this.upcomingSchedules = upcomingSchedules;
    }

    public UniversityDto getUniversity() { return university; }
    public SchoolPageContentDto getContent() { return content; }
    public SchoolInfoSummaryDto getSummary() { return summary; }
    public List<NoticeDto> getLatestNotices() { return latestNotices; }
    public List<ScheduleDto> getUpcomingSchedules() { return upcomingSchedules; }
}
