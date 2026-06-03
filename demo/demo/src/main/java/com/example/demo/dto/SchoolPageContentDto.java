package com.example.demo.dto;

import java.util.List;

public class SchoolPageContentDto {
    public String slogan;
    public String homepage;
    public String address;
    public String phone;
    public String email;
    public String hours;
    public List<String> keywords;
    public List<String> transitGuides;
    public List<GuideCard> campusGuides;
    public List<FacilityItem> facilities;
    public List<FaqItem> faqs;
    public List<QuickLink> quickLinks;

    public static class GuideCard {
        public String title;
        public String description;
        public String action;
        public String icon;
        public String href;
    }

    public static class FacilityItem {
        public String name;
        public String category;
        public String location;
        public String description;
        public String mapUrl;
        public String mapKeyword;
    }

    public static class FaqItem {
        public String category;
        public String question;
        public String answer;
    }

    public static class QuickLink {
        public String title;
        public String description;
        public String icon;
        public String href;
    }
}
