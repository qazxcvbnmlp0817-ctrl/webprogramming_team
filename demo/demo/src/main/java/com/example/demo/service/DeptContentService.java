package com.example.demo.service;

import com.example.demo.dto.DeptPageContentDto;
import com.example.demo.entity.AdminLog;
import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.Department;
import com.example.demo.entity.DeptPageContent;
import com.example.demo.entity.Professor;
import com.example.demo.entity.User;
import com.example.demo.repository.AdminLogRepository;
import com.example.demo.repository.ClassScheduleRepository;
import com.example.demo.repository.CurriculumItemRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.DeptPageContentRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import com.example.demo.repository.ProfessorRepository;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DeptContentService {

    private final DepartmentRepository departmentRepository;
    private final DeptPageContentRepository contentRepository;
    private final AdminLogRepository adminLogRepository;
    private final ProfessorRepository professorRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final CurriculumItemRepository curriculumItemRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public DeptContentService(DepartmentRepository departmentRepository,
                              DeptPageContentRepository contentRepository,
                              AdminLogRepository adminLogRepository,
                              ProfessorRepository professorRepository,
                              ClassScheduleRepository classScheduleRepository,
                              ProfessorCourseAssignmentRepository assignmentRepository,
                              UserRepository userRepository,
                              CurriculumItemRepository curriculumItemRepository) {
        this.departmentRepository = departmentRepository;
        this.contentRepository = contentRepository;
        this.adminLogRepository = adminLogRepository;
        this.professorRepository = professorRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.curriculumItemRepository = curriculumItemRepository;
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
        if (dto.professors != null) saveProfessors(dept, content, dto.professors);
        if (dto.requirements != null) content.setRequirementsJson(toJson(dto.requirements));
        if (dto.curriculumItems != null) saveCurriculumItems(dept, content, dto.curriculumItems);
        if (dto.communityTopics != null) content.setCommunityTopicsJson(toJson(dto.communityTopics));
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
            case "professors" -> { if (dto.professors != null) saveProfessors(dept, content, dto.professors); }
            case "requirements" -> { if (dto.requirements != null) content.setRequirementsJson(toJson(dto.requirements)); }
            case "curriculumItems" -> { if (dto.curriculumItems != null) saveCurriculumItems(dept, content, dto.curriculumItems); }
            case "communityTopics" -> { if (dto.communityTopics != null) content.setCommunityTopicsJson(toJson(dto.communityTopics)); }
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
            dto.curriculumItems = withCurriculumIds(dept.getId(), fromJsonList(content.getCurriculumItemsJson(), DeptPageContentDto.CurriculumEditItem.class));
            dto.communityTopics = fromJsonList(content.getCommunityTopicsJson(), DeptPageContentDto.CommunityTopic.class);
            if (content.getOverviewNotices() != null || content.getOverviewSchedules() != null) {
                dto.overviewCounts = new DeptPageContentDto.OverviewCounts();
                dto.overviewCounts.notices = content.getOverviewNotices();
                dto.overviewCounts.schedules = content.getOverviewSchedules();
            }
        }
        return dto;
    }

    private List<DeptPageContentDto.CurriculumEditItem> withCurriculumIds(Long deptId, List<DeptPageContentDto.CurriculumEditItem> items) {
        if (items == null) return null;
        Map<Long, CurriculumItem> existingById = curriculumItemRepository.findByDeptId(deptId).stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(CurriculumItem::getId, item -> item, (a, b) -> a, LinkedHashMap::new));
        Set<Long> usedIds = new HashSet<>();
        List<DeptPageContentDto.CurriculumEditItem> result = new ArrayList<>();

        for (DeptPageContentDto.CurriculumEditItem item : items) {
            if (item == null) continue;
            CurriculumItem match = item.id != null ? existingById.get(item.id) : null;
            if (match == null) match = findMatchingCurriculum(existingById, usedIds, item);
            if (match != null) {
                item.id = match.getId();
                usedIds.add(match.getId());
            }
            result.add(item);
        }
        return result;
    }

    private void saveCurriculumItems(Department dept, DeptPageContent content, List<DeptPageContentDto.CurriculumEditItem> incoming) {
        Map<Long, CurriculumItem> existingById = curriculumItemRepository.findByDeptId(dept.getId()).stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(CurriculumItem::getId, item -> item, (a, b) -> a, LinkedHashMap::new));
        List<DeptPageContentDto.CurriculumEditItem> normalized = new ArrayList<>();
        Set<Long> usedIds = new HashSet<>();

        for (DeptPageContentDto.CurriculumEditItem item : incoming) {
            if (item == null || isBlank(item.name)) continue;
            CurriculumItem course = item.id != null ? existingById.get(item.id) : null;
            if (course == null) course = findMatchingCurriculum(existingById, usedIds, item);
            if (course == null) {
                course = new CurriculumItem();
                course.setDeptId(dept.getId());
            }

            course.setName(item.name.trim());
            course.setYear(blankToNull(item.year));
            course.setSemester(blankToNull(item.semester));
            course.setCategory(blankToNull(item.category));
            course.setRequired(Boolean.TRUE.equals(item.required));
            course.setCredits(item.credit != null ? item.credit : 0);
            course.setDeptId(dept.getId());

            CurriculumItem saved = curriculumItemRepository.save(course);
            usedIds.add(saved.getId());
            DeptPageContentDto.CurriculumEditItem normalizedItem = new DeptPageContentDto.CurriculumEditItem();
            normalizedItem.id = saved.getId();
            normalizedItem.name = saved.getName();
            normalizedItem.year = saved.getYear();
            normalizedItem.semester = saved.getSemester();
            normalizedItem.category = saved.getCategory();
            normalizedItem.required = saved.isRequired();
            normalizedItem.credit = saved.getCredits();
            normalized.add(normalizedItem);
        }

        content.setCurriculumItemsJson(toJson(normalized));
    }

    private CurriculumItem findMatchingCurriculum(
            Map<Long, CurriculumItem> existingById,
            Set<Long> usedIds,
            DeptPageContentDto.CurriculumEditItem item) {
        return existingById.values().stream()
                .filter(course -> !usedIds.contains(course.getId()))
                .filter(course -> sameText(course.getName(), item.name))
                .filter(course -> sameText(course.getYear(), item.year))
                .filter(course -> sameText(course.getSemester(), item.semester))
                .filter(course -> sameText(course.getCategory(), item.category))
                .filter(course -> course.isRequired() == Boolean.TRUE.equals(item.required))
                .filter(course -> course.getCredits() == (item.credit != null ? item.credit : 0))
                .findFirst()
                .orElse(null);
    }

    private void saveProfessors(Department dept, DeptPageContent content, List<DeptPageContentDto.ProfessorEditItem> incoming) {
        Map<Long, Professor> existingById = professorRepository.findByDeptId(dept.getId()).stream()
                .filter(prof -> prof.getId() != null)
                .collect(Collectors.toMap(Professor::getId, prof -> prof, (a, b) -> a, LinkedHashMap::new));
        Set<Long> keptIds = new HashSet<>();
        List<DeptPageContentDto.ProfessorEnhancement> enhancements = new java.util.ArrayList<>();

        for (DeptPageContentDto.ProfessorEditItem item : incoming) {
            if (item == null || isBlank(item.name)) continue;
            Professor professor = item.id != null ? existingById.get(item.id) : null;
            if (professor == null) {
                professor = new Professor();
                professor.setDeptId(dept.getId());
            }
            professor.setName(item.name.trim());
            professor.setSpecialty(blankToNull(item.specialty));
            professor.setEmail(blankToNull(item.email));
            professor.setDeptId(dept.getId());
            Professor saved = professorRepository.save(professor);
            keptIds.add(saved.getId());

            DeptPageContentDto.ProfessorEnhancement enhancement = new DeptPageContentDto.ProfessorEnhancement();
            enhancement.name = saved.getName();
            enhancement.lab = blankToNull(item.lab);
            enhancement.courses = item.courses == null
                    ? List.of()
                    : item.courses.stream()
                            .filter(course -> !isBlank(course))
                            .map(String::trim)
                            .toList();
            if (enhancement.lab != null || !enhancement.courses.isEmpty()) {
                enhancements.add(enhancement);
            }
        }

        for (Professor professor : existingById.values()) {
            if (keptIds.contains(professor.getId())) continue;
            userRepository.findByProfessorEntityId(professor.getId()).ifPresent(user -> unlinkProfessorUser(user));
            classScheduleRepository.deleteByProfessorId(professor.getId());
            assignmentRepository.deleteByProfessorId(professor.getId());
            professorRepository.delete(professor);
        }

        content.setProfessorEnhancementsJson(toJson(enhancements));
    }

    private void unlinkProfessorUser(User user) {
        user.setProfessorEntityId(null);
        userRepository.save(user);
    }

    private boolean sameText(String left, String right) {
        String a = blankToNull(left);
        String b = blankToNull(right);
        if (a == null) return b == null;
        return a.equals(b);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
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
