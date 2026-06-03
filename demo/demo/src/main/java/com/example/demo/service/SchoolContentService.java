package com.example.demo.service;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.dto.SchoolInfoDto;
import com.example.demo.dto.SchoolInfoSummaryDto;
import com.example.demo.dto.SchoolPageContentDto;
import com.example.demo.dto.UniversityDto;
import com.example.demo.entity.AdminLog;
import com.example.demo.entity.SchoolPageContent;
import com.example.demo.repository.AdminLogRepository;
import com.example.demo.repository.SchoolPageContentRepository;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SchoolContentService {
    private final SchoolPageContentRepository contentRepository;
    private final AdminLogRepository adminLogRepository;
    private final UniversityService universityService;
    private final NoticeService noticeService;
    private final ScheduleService scheduleService;
    private final ObjectMapper mapper = new ObjectMapper();

    public SchoolContentService(SchoolPageContentRepository contentRepository,
                                AdminLogRepository adminLogRepository,
                                UniversityService universityService,
                                NoticeService noticeService,
                                ScheduleService scheduleService) {
        this.contentRepository = contentRepository;
        this.adminLogRepository = adminLogRepository;
        this.universityService = universityService;
        this.noticeService = noticeService;
        this.scheduleService = scheduleService;
    }

    public SchoolInfoDto getSchoolInfo(Long univId) {
        UniversityDto university = universityService.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교 없음"));
        SchoolPageContentDto content = buildDto(contentRepository.findById(univId).orElse(null));
        List<NoticeDto> notices = noticeService.getNoticesByUniv(univId);
        List<ScheduleDto> schedules = scheduleService.getSchedulesByUniv(univId);
        int facultyCount = university.getSchools().stream()
                .mapToInt(school -> school.getFaculties().size())
                .sum();
        SchoolInfoSummaryDto summary = new SchoolInfoSummaryDto(
                university.getSchools().size(),
                facultyCount,
                university.getTotalDeptCount(),
                notices.size(),
                schedules.size()
        );
        return new SchoolInfoDto(
                university,
                content,
                summary,
                notices.stream().limit(3).toList(),
                schedules.stream().limit(3).toList()
        );
    }

    public SchoolPageContentDto getContent(Long univId) {
        universityService.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교 없음"));
        return buildDto(contentRepository.findById(univId).orElse(null));
    }

    @Transactional
    public void saveContent(Long univId, SchoolPageContentDto dto, String actor) {
        SchoolPageContent content = contentRepository.findById(univId).orElseGet(() -> {
            SchoolPageContent c = new SchoolPageContent();
            c.setUnivId(univId);
            return c;
        });
        applyAll(content, dto);
        finishSave(content, actor, "all");
    }

    @Transactional
    public void saveSection(Long univId, String section, SchoolPageContentDto dto, String actor) {
        SchoolPageContent content = contentRepository.findById(univId).orElseGet(() -> {
            SchoolPageContent c = new SchoolPageContent();
            c.setUnivId(univId);
            return c;
        });

        switch (section) {
            case "hero" -> {
                if (dto.slogan != null) content.setSlogan(dto.slogan);
                if (dto.homepage != null) content.setHomepage(dto.homepage);
                if (dto.keywords != null) content.setKeywordsJson(toJson(dto.keywords));
            }
            case "contact" -> {
                if (dto.address != null) content.setAddress(dto.address);
                if (dto.phone != null) content.setPhone(dto.phone);
                if (dto.email != null) content.setEmail(dto.email);
                if (dto.hours != null) content.setHours(dto.hours);
                if (dto.transitGuides != null) content.setTransitGuidesJson(toJson(dto.transitGuides));
            }
            case "campusGuides" -> {
                if (dto.campusGuides != null) content.setCampusGuidesJson(toJson(dto.campusGuides));
            }
            case "facilities" -> {
                if (dto.facilities != null) content.setFacilitiesJson(toJson(dto.facilities));
            }
            case "faqs" -> {
                if (dto.faqs != null) content.setFaqsJson(toJson(dto.faqs));
            }
            case "quickLinks" -> {
                if (dto.quickLinks != null) content.setQuickLinksJson(toJson(dto.quickLinks));
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "없는 섹션: " + section);
        }

        finishSave(content, actor, section);
    }

    public SchoolPageContentDto buildDto(SchoolPageContent content) {
        SchoolPageContentDto dto = new SchoolPageContentDto();
        if (content == null) return dto;
        dto.slogan = content.getSlogan();
        dto.homepage = content.getHomepage();
        dto.address = content.getAddress();
        dto.phone = content.getPhone();
        dto.email = content.getEmail();
        dto.hours = content.getHours();
        dto.keywords = fromJsonList(content.getKeywordsJson(), String.class);
        dto.transitGuides = fromJsonList(content.getTransitGuidesJson(), String.class);
        dto.campusGuides = fromJsonList(content.getCampusGuidesJson(), SchoolPageContentDto.GuideCard.class);
        dto.facilities = fromJsonList(content.getFacilitiesJson(), SchoolPageContentDto.FacilityItem.class);
        dto.faqs = fromJsonList(content.getFaqsJson(), SchoolPageContentDto.FaqItem.class);
        dto.quickLinks = fromJsonList(content.getQuickLinksJson(), SchoolPageContentDto.QuickLink.class);
        return dto;
    }

    private void applyAll(SchoolPageContent content, SchoolPageContentDto dto) {
        if (dto == null) return;
        if (dto.slogan != null) content.setSlogan(dto.slogan);
        if (dto.homepage != null) content.setHomepage(dto.homepage);
        if (dto.address != null) content.setAddress(dto.address);
        if (dto.phone != null) content.setPhone(dto.phone);
        if (dto.email != null) content.setEmail(dto.email);
        if (dto.hours != null) content.setHours(dto.hours);
        if (dto.keywords != null) content.setKeywordsJson(toJson(dto.keywords));
        if (dto.transitGuides != null) content.setTransitGuidesJson(toJson(dto.transitGuides));
        if (dto.campusGuides != null) content.setCampusGuidesJson(toJson(dto.campusGuides));
        if (dto.facilities != null) content.setFacilitiesJson(toJson(dto.facilities));
        if (dto.faqs != null) content.setFaqsJson(toJson(dto.faqs));
        if (dto.quickLinks != null) content.setQuickLinksJson(toJson(dto.quickLinks));
    }

    private void finishSave(SchoolPageContent content, String actor, String section) {
        content.setUpdatedAt(LocalDateTime.now());
        content.setUpdatedBy(actor);
        contentRepository.save(content);
        logAction(actor, content.getUnivId(), section);
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "JSON 직렬화 오류");
        }
    }

    private <T> List<T> fromJsonList(String json, Class<T> elementType) {
        if (json == null || json.isBlank()) return null;
        try {
            JavaType type = mapper.getTypeFactory().constructCollectionType(List.class, elementType);
            return mapper.readValue(json, type);
        } catch (Exception e) {
            return null;
        }
    }

    private void logAction(String actor, Long univId, String section) {
        try {
            AdminLog log = new AdminLog();
            log.setActorUsername(actor != null ? actor : "unknown");
            log.setActionType("SCHOOL_CONTENT_UPDATE");
            log.setDetail("section=" + section + ", univId=" + univId);
            log.setUniversityId(univId);
            log.setCreatedAt(LocalDateTime.now());
            adminLogRepository.save(log);
        } catch (Exception ignored) {
        }
    }
}
