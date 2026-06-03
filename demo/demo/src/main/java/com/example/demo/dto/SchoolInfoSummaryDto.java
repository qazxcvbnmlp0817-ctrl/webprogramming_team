package com.example.demo.dto;

public class SchoolInfoSummaryDto {
    private final int schoolCount;
    private final int facultyCount;
    private final int deptCount;
    private final int noticeCount;
    private final int scheduleCount;

    public SchoolInfoSummaryDto(int schoolCount, int facultyCount, int deptCount,
                                int noticeCount, int scheduleCount) {
        this.schoolCount = schoolCount;
        this.facultyCount = facultyCount;
        this.deptCount = deptCount;
        this.noticeCount = noticeCount;
        this.scheduleCount = scheduleCount;
    }

    public int getSchoolCount() { return schoolCount; }
    public int getFacultyCount() { return facultyCount; }
    public int getDeptCount() { return deptCount; }
    public int getNoticeCount() { return noticeCount; }
    public int getScheduleCount() { return scheduleCount; }
}
