package com.example.demo.dto;

public class ClassScheduleRequestDto {
    private Long courseId;
    private Long professorId;
    private Long deptId;
    private String dayOfWeek;  // 월|화|수|목|금
    private String startTime;  // HH:mm
    private String endTime;    // HH:mm
    private String room;
    private String semester;   // e.g. "2025-1"
    private String memo;

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }
}
