package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DEPT_PAGE_CONTENTS")
public class DeptPageContent {

    @Id
    private Long deptId;

    @Column(length = 500)
    private String slogan;

    @Column(length = 500)
    private String homepage;

    @Lob private String keywordsJson;
    @Lob private String guideCardsJson;
    @Lob private String introHighlightsJson;
    @Lob private String careersJson;
    @Lob private String facilitiesJson;
    @Lob private String faqsJson;
    @Lob private String studentLifeJson;
    @Lob private String professorEnhancementsJson;
    @Lob private String requirementsJson;

    private Integer overviewNotices;
    private Integer overviewSchedules;
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String updatedBy;

    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }
    public String getSlogan() { return slogan; }
    public void setSlogan(String slogan) { this.slogan = slogan; }
    public String getHomepage() { return homepage; }
    public void setHomepage(String homepage) { this.homepage = homepage; }
    public String getKeywordsJson() { return keywordsJson; }
    public void setKeywordsJson(String keywordsJson) { this.keywordsJson = keywordsJson; }
    public String getGuideCardsJson() { return guideCardsJson; }
    public void setGuideCardsJson(String guideCardsJson) { this.guideCardsJson = guideCardsJson; }
    public String getIntroHighlightsJson() { return introHighlightsJson; }
    public void setIntroHighlightsJson(String introHighlightsJson) { this.introHighlightsJson = introHighlightsJson; }
    public String getCareersJson() { return careersJson; }
    public void setCareersJson(String careersJson) { this.careersJson = careersJson; }
    public String getFacilitiesJson() { return facilitiesJson; }
    public void setFacilitiesJson(String facilitiesJson) { this.facilitiesJson = facilitiesJson; }
    public String getFaqsJson() { return faqsJson; }
    public void setFaqsJson(String faqsJson) { this.faqsJson = faqsJson; }
    public String getStudentLifeJson() { return studentLifeJson; }
    public void setStudentLifeJson(String studentLifeJson) { this.studentLifeJson = studentLifeJson; }
    public String getProfessorEnhancementsJson() { return professorEnhancementsJson; }
    public void setProfessorEnhancementsJson(String professorEnhancementsJson) { this.professorEnhancementsJson = professorEnhancementsJson; }
    public String getRequirementsJson() { return requirementsJson; }
    public void setRequirementsJson(String requirementsJson) { this.requirementsJson = requirementsJson; }
    public Integer getOverviewNotices() { return overviewNotices; }
    public void setOverviewNotices(Integer overviewNotices) { this.overviewNotices = overviewNotices; }
    public Integer getOverviewSchedules() { return overviewSchedules; }
    public void setOverviewSchedules(Integer overviewSchedules) { this.overviewSchedules = overviewSchedules; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
