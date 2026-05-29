package com.example.demo.dto;

import java.util.List;

public class DeptPageContentDto {

    // Department 필드
    public String name;
    public String description;
    public String address;
    public String phone;
    public String email;
    public String hours;

    // DeptPageContent 필드
    public String slogan;
    public String homepage;
    public List<String> keywords;
    public List<GuideCard> guideCards;
    public List<IntroHighlight> introHighlights;
    public List<CareerItem> careers;
    public List<FacilityItem> facilities;
    public List<FaqItem> faqs;
    public List<StudentLifeItem> studentLife;
    public List<ProfessorEnhancement> professorEnhancements;
    public List<RequirementItem> requirements;
    public OverviewCounts overviewCounts;

    public static class GuideCard {
        public String title;
        public String description;
        public String action;
        public String icon;
        public String href;
    }

    public static class IntroHighlight {
        public String title;
        public List<String> items;
    }

    public static class CareerCertificate {
        public String name;
        public String href;
    }

    public static class CareerItem {
        public String category;
        public List<String> jobs;
        public String description;
        public List<String> preparation;
        public List<String> courses;
        public String portfolio;
        public List<CareerCertificate> certificates;
    }

    public static class FacilityItem {
        public String name;
        public String location;
        public String description;
        public List<String> activities;
    }

    public static class FaqItem {
        public String category;
        public String question;
        public String answer;
    }

    public static class StudentLifeItem {
        public String title;
        public String description;
        public String href;
        public Boolean external;
    }

    public static class ProfessorEnhancement {
        public String name;
        public String lab;
        public List<String> courses;
    }

    public static class RequirementItem {
        public String id;
        public String label;
        public String description;
        public String href;
        public String kind;
    }

    public static class OverviewCounts {
        public Integer notices;
        public Integer schedules;
    }
}
