package com.example.demo.service;

import com.example.demo.dto.DeptPageContentDto;
import com.example.demo.entity.AdminLog;
import com.example.demo.entity.Department;
import com.example.demo.entity.DeptPageContent;
import com.example.demo.repository.AdminLogRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.DeptPageContentRepository;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeptContentService {

    private final DepartmentRepository departmentRepository;
    private final DeptPageContentRepository contentRepository;
    private final AdminLogRepository adminLogRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public DeptContentService(DepartmentRepository departmentRepository,
                              DeptPageContentRepository contentRepository,
                              AdminLogRepository adminLogRepository) {
        this.departmentRepository = departmentRepository;
        this.contentRepository = contentRepository;
        this.adminLogRepository = adminLogRepository;
    }

    public DeptPageContentDto getContent(Long deptId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학과 없음"));
        DeptPageContent content = contentRepository.findById(deptId).orElse(null);
        return buildDto(dept, content);
    }

    @Transactional
    public void saveContent(Long deptId, DeptPageContentDto dto, String actor) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학과 없음"));

        if (dto.name != null && !dto.name.isBlank()) dept.setName(dto.name);
        if (dto.description != null) dept.setDescription(dto.description);
        if (dto.address != null) dept.setAddress(dto.address);
        if (dto.phone != null) dept.setPhone(dto.phone);
        if (dto.email != null) dept.setEmail(dto.email);
        if (dto.hours != null) dept.setHours(dto.hours);
        departmentRepository.save(dept);

        DeptPageContent content = contentRepository.findById(deptId).orElseGet(() -> {
            DeptPageContent c = new DeptPageContent();
            c.setDeptId(deptId);
            return c;
        });

        if (dto.slogan != null) content.setSlogan(dto.slogan);
        if (dto.homepage != null) content.setHomepage(dto.homepage);
        if (dto.keywords != null) content.setKeywordsJson(toJson(dto.keywords));
        if (dto.guideCards != null) content.setGuideCardsJson(toJson(dto.guideCards));
        if (dto.introHighlights != null) content.setIntroHighlightsJson(toJson(dto.introHighlights));
        if (dto.careers != null) content.setCareersJson(toJson(dto.careers));
        if (dto.facilities != null) content.setFacilitiesJson(toJson(dto.facilities));
        if (dto.faqs != null) content.setFaqsJson(toJson(dto.faqs));
        if (dto.studentLife != null) content.setStudentLifeJson(toJson(dto.studentLife));
        if (dto.professorEnhancements != null) content.setProfessorEnhancementsJson(toJson(dto.professorEnhancements));
        if (dto.requirements != null) content.setRequirementsJson(toJson(dto.requirements));
        if (dto.overviewCounts != null) {
            if (dto.overviewCounts.notices != null) content.setOverviewNotices(dto.overviewCounts.notices);
            if (dto.overviewCounts.schedules != null) content.setOverviewSchedules(dto.overviewCounts.schedules);
        }
        content.setUpdatedAt(LocalDateTime.now());
        content.setUpdatedBy(actor);
        contentRepository.save(content);

        logAction(actor, deptId, "전체");
    }

    @Transactional
    public void saveSection(Long deptId, String section, DeptPageContentDto dto, String actor) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학과 없음"));

        DeptPageContent content = contentRepository.findById(deptId).orElseGet(() -> {
            DeptPageContent c = new DeptPageContent();
            c.setDeptId(deptId);
            return c;
        });

        switch (section) {
            case "contact" -> {
                if (dto.name != null && !dto.name.isBlank()) dept.setName(dto.name);
                if (dto.description != null) dept.setDescription(dto.description);
                if (dto.address != null) dept.setAddress(dto.address);
                if (dto.phone != null) dept.setPhone(dto.phone);
                if (dto.email != null) dept.setEmail(dto.email);
                if (dto.hours != null) dept.setHours(dto.hours);
                if (dto.homepage != null) content.setHomepage(dto.homepage);
                departmentRepository.save(dept);
            }
            case "hero" -> {
                if (dto.slogan != null) content.setSlogan(dto.slogan);
                if (dto.keywords != null) content.setKeywordsJson(toJson(dto.keywords));
            }
            case "overview" -> {
                if (dto.description != null) dept.setDescription(dto.description);
                departmentRepository.save(dept);
                if (dto.overviewCounts != null) {
                    if (dto.overviewCounts.notices != null) content.setOverviewNotices(dto.overviewCounts.notices);
                    if (dto.overviewCounts.schedules != null) content.setOverviewSchedules(dto.overviewCounts.schedules);
                }
            }
            case "guideCards" -> { if (dto.guideCards != null) content.setGuideCardsJson(toJson(dto.guideCards)); }
            case "intro" -> { if (dto.introHighlights != null) content.setIntroHighlightsJson(toJson(dto.introHighlights)); }
            case "careers" -> { if (dto.careers != null) content.setCareersJson(toJson(dto.careers)); }
            case "facilities" -> { if (dto.facilities != null) content.setFacilitiesJson(toJson(dto.facilities)); }
            case "faqs" -> { if (dto.faqs != null) content.setFaqsJson(toJson(dto.faqs)); }
            case "studentLife" -> { if (dto.studentLife != null) content.setStudentLifeJson(toJson(dto.studentLife)); }
            case "professorEnhancements" -> { if (dto.professorEnhancements != null) content.setProfessorEnhancementsJson(toJson(dto.professorEnhancements)); }
            case "requirements" -> { if (dto.requirements != null) content.setRequirementsJson(toJson(dto.requirements)); }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "알 수 없는 섹션: " + section);
        }

        content.setUpdatedAt(LocalDateTime.now());
        content.setUpdatedBy(actor);
        contentRepository.save(content);

        logAction(actor, deptId, section);
    }

    public DeptPageContentDto buildDto(Department dept, DeptPageContent content) {
        DeptPageContentDto dto = new DeptPageContentDto();
        dto.name = dept.getName();
        dto.description = dept.getDescription();
        dto.address = dept.getAddress();
        dto.phone = dept.getPhone();
        dto.email = dept.getEmail();
        dto.hours = dept.getHours();

        if (content != null) {
            dto.slogan = content.getSlogan();
            dto.homepage = content.getHomepage();
            dto.keywords = fromJsonList(content.getKeywordsJson(), String.class);
            dto.guideCards = fromJsonList(content.getGuideCardsJson(), DeptPageContentDto.GuideCard.class);
            dto.introHighlights = fromJsonList(content.getIntroHighlightsJson(), DeptPageContentDto.IntroHighlight.class);
            dto.careers = fromJsonList(content.getCareersJson(), DeptPageContentDto.CareerItem.class);
            dto.facilities = fromJsonList(content.getFacilitiesJson(), DeptPageContentDto.FacilityItem.class);
            dto.faqs = fromJsonList(content.getFaqsJson(), DeptPageContentDto.FaqItem.class);
            dto.studentLife = fromJsonList(content.getStudentLifeJson(), DeptPageContentDto.StudentLifeItem.class);
            dto.professorEnhancements = fromJsonList(content.getProfessorEnhancementsJson(), DeptPageContentDto.ProfessorEnhancement.class);
            dto.requirements = fromJsonList(content.getRequirementsJson(), DeptPageContentDto.RequirementItem.class);
            if (content.getOverviewNotices() != null || content.getOverviewSchedules() != null) {
                dto.overviewCounts = new DeptPageContentDto.OverviewCounts();
                dto.overviewCounts.notices = content.getOverviewNotices();
                dto.overviewCounts.schedules = content.getOverviewSchedules();
            }
        }
        return dto;
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

    private void logAction(String actor, Long deptId, String section) {
        try {
            AdminLog log = new AdminLog();
            log.setActorUsername(actor != null ? actor : "unknown");
            log.setActionType("DEPT_CONTENT_UPDATE");
            log.setDetail("section=" + section + ", deptId=" + deptId);
            log.setCreatedAt(LocalDateTime.now());
            adminLogRepository.save(log);
        } catch (Exception ignored) {
        }
    }
}
