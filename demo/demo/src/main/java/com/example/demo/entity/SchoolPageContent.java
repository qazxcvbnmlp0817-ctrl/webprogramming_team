package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "SCHOOL_PAGE_CONTENTS")
public class SchoolPageContent {
    @Id
    private Long univId;

    @Column(length = 500)
    private String slogan;

    @Column(length = 500)
    private String homepage;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 200)
    private String hours;

    @Lob private String keywordsJson;
    @Lob private String campusGuidesJson;
    @Lob private String facilitiesJson;
    @Lob private String faqsJson;
    @Lob private String quickLinksJson;
    @Lob private String transitGuidesJson;

    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String updatedBy;

    public Long getUnivId() { return univId; }
    public void setUnivId(Long univId) { this.univId = univId; }
    public String getSlogan() { return slogan; }
    public void setSlogan(String slogan) { this.slogan = slogan; }
    public String getHomepage() { return homepage; }
    public void setHomepage(String homepage) { this.homepage = homepage; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }
    public String getKeywordsJson() { return keywordsJson; }
    public void setKeywordsJson(String keywordsJson) { this.keywordsJson = keywordsJson; }
    public String getCampusGuidesJson() { return campusGuidesJson; }
    public void setCampusGuidesJson(String campusGuidesJson) { this.campusGuidesJson = campusGuidesJson; }
    public String getFacilitiesJson() { return facilitiesJson; }
    public void setFacilitiesJson(String facilitiesJson) { this.facilitiesJson = facilitiesJson; }
    public String getFaqsJson() { return faqsJson; }
    public void setFaqsJson(String faqsJson) { this.faqsJson = faqsJson; }
    public String getQuickLinksJson() { return quickLinksJson; }
    public void setQuickLinksJson(String quickLinksJson) { this.quickLinksJson = quickLinksJson; }
    public String getTransitGuidesJson() { return transitGuidesJson; }
    public void setTransitGuidesJson(String transitGuidesJson) { this.transitGuidesJson = transitGuidesJson; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
