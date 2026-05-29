package com.example.demo.dto;

public class TimetableEntryDto {
    private Long entryId;
    private LectureOfferingDto offering;

    public TimetableEntryDto(Long entryId, LectureOfferingDto offering) {
        this.entryId = entryId;
        this.offering = offering;
    }

    public Long getEntryId() { return entryId; }
    public LectureOfferingDto getOffering() { return offering; }
}
