package com.example.demo.service;

import com.example.demo.dto.ScheduleCreateRequest;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.entity.Schedule;
import com.example.demo.entity.User;
import com.example.demo.repository.EnrollmentRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import com.example.demo.repository.ScheduleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final AdminService adminService;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           UserRepository userRepository,
                           EnrollmentRepository enrollmentRepository,
                           ProfessorCourseAssignmentRepository assignmentRepository,
                           AdminService adminService) {
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.adminService = adminService;
    }

    // ── 일정 생성 ─────────────────────────────────────────────────────────────────

    @Transactional
    public ScheduleDto createSchedule(String username, ScheduleCreateRequest req) {
        User user = getUser(username);
        String memberType = user.getMemberType();
        String scheduleType = req.getScheduleType();

        validateCreatePermission(memberType, scheduleType);

        Schedule s = new Schedule();
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목을 입력해주세요.");
        }
        if (req.getStartDate() == null || req.getStartDate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시작일을 입력해주세요.");
        }
        s.setTitle(req.getTitle().trim());
        s.setContent(req.getContent() != null && !req.getContent().isBlank() ? req.getContent() : null);
        s.setScheduleType(scheduleType);
        s.setCategory(req.getCategory() != null && !req.getCategory().isBlank() ? req.getCategory() : "other");
        LocalDate parsedStart = LocalDate.parse(req.getStartDate());
        s.setStartDate(parsedStart);
        // 구 스키마 NOT NULL 컬럼 기본값 설정
        s.setEventDate(parsedStart);
        s.setScopeType("personal");
        s.setScopeId(0L);
        s.setEndDate(req.getEndDate() != null && !req.getEndDate().isBlank()
                ? LocalDate.parse(req.getEndDate()) : null);
        // 빈 문자열은 null로 저장 (Oracle은 ''을 NULL로 처리)
        s.setStartTime(req.getStartTime() != null && !req.getStartTime().isBlank() ? req.getStartTime() : null);
        s.setEndTime(req.getEndTime()   != null && !req.getEndTime().isBlank()   ? req.getEndTime()   : null);
        s.setCreatedBy(username);
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        s.setCompleted(false);

        // universityId 항상 저장 (대학 간 노출 방지)
        s.setUniversityId(user.getUniversityId());

        switch (scheduleType) {
            case "PERSONAL" -> s.setOwnerId(user.getId());
            case "COURSE" -> {
                if (req.getCourseId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "과목 ID가 필요합니다.");
                }
                s.setCourseId(req.getCourseId());
            }
            case "GRADE_NOTICE" -> {
                java.util.List<Integer> grades = req.getTargetGrades();
                if ((grades == null || grades.isEmpty()) && req.getTargetGrade() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "대상 학년이 필요합니다.");
                }
                if (grades != null && !grades.isEmpty()) {
                    s.setTargetGradesJson(grades.stream()
                            .map(String::valueOf).collect(java.util.stream.Collectors.joining(",")));
                    s.setIsAllGrades(Boolean.TRUE.equals(req.getIsAllGrades()));
                    s.setTargetGrade(grades.get(0));
                } else {
                    s.setTargetGrade(req.getTargetGrade());
                    s.setTargetGradesJson(String.valueOf(req.getTargetGrade()));
                }
                s.setDepartmentId(resolveDeptId(user));
            }
            // 학과 공지 — DEPT_NOTICE 표준, DEPARTMENT 구형 호환
            case "DEPT_NOTICE", "DEPARTMENT" -> {
                s.setScheduleType("DEPT_NOTICE");
                s.setDepartmentId(resolveDeptId(user));
            }
            // 학교 공지 (같은 university_id 내 전체) — SCHOOL_NOTICE 표준, SCHOOL 구형 호환
            case "SCHOOL_NOTICE", "SCHOOL" -> s.setScheduleType("SCHOOL_NOTICE");
            // 전체 공지 — 교수·조교: 자신의 학과 범위로 제한, 관리자만 진짜 전체
            case "GLOBAL_NOTICE", "GLOBAL" -> {
                String mt = user.getMemberType();
                if ("professor".equals(mt) || "assistant".equals(mt)) {
                    // 교수/조교의 전체 안내 → 소속 학과 학생에게만 보임
                    s.setScheduleType("DEPT_NOTICE");
                    s.setDepartmentId(resolveDeptId(user));
                } else {
                    s.setScheduleType("GLOBAL_NOTICE");
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "알 수 없는 일정 유형입니다: " + scheduleType);
        }

        return toDto(scheduleRepository.save(s));
    }

    // ── 내 일정 전체 조회 ──────────────────────────────────────────────────────────

    public List<ScheduleDto> getMySchedules(String username) {
        User user = getUser(username);
        String memberType = user.getMemberType();

        Set<Long> seen = new LinkedHashSet<>();
        List<Schedule> result = new ArrayList<>();

        String univId = user.getUniversityId();

        // 1. 본인 PERSONAL (owner_id 엄격 필터)
        scheduleRepository.findByOwnerIdAndScheduleType(user.getId(), "PERSONAL")
                .forEach(s -> { if (seen.add(s.getId())) result.add(s); });

        // 2. GLOBAL_NOTICE — departmentId 기반 필터링
        //    교수/조교 작성: 해당 학과만 조회 가능
        //    관리자 작성(departmentId=null): 같은 대학 전체
        final Long myDeptId = resolveDeptIdSafe(user);
        scheduleRepository.findByScheduleTypeIn(List.of("GLOBAL_NOTICE", "GLOBAL")).stream()
                .filter(s -> {
                    // universityId 불일치 → 제외
                    if (univId != null && s.getUniversityId() != null
                            && !univId.equals(s.getUniversityId())) return false;
                    // departmentId가 설정된 레코드: 학과 일치 여부만 확인
                    if (s.getDepartmentId() != null) {
                        return myDeptId != null && myDeptId.equals(s.getDepartmentId());
                    }
                    // departmentId가 null인 레코드: 작성자 역할로 판단
                    if (s.getCreatedBy() != null) {
                        Optional<User> creatorOpt = userRepository.findByUsername(s.getCreatedBy());
                        if (creatorOpt.isPresent()) {
                            User creator = creatorOpt.get();
                            if ("admin".equals(creator.getMemberType())) return true; // 관리자 = 전교 공지
                            // 교수/조교: 작성자 학과 == 로그인 사용자 학과
                            Long creatorDeptId = resolveDeptIdSafe(creator);
                            return myDeptId != null && myDeptId.equals(creatorDeptId);
                        }
                        return false; // 작성자 계정 없으면 숨김
                    }
                    return "admin".equals(memberType); // createdBy 없으면 관리자만 조회
                })
                .forEach(s -> { if (seen.add(s.getId())) result.add(s); });

        // 3. SCHOOL_NOTICE — 같은 university_id (SCHOOL 구형 포함)
        if (univId != null) {
            scheduleRepository.findByScheduleTypeIn(List.of("SCHOOL_NOTICE", "SCHOOL")).stream()
                    .filter(s -> univId.equals(s.getUniversityId()))
                    .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
        }

        if ("student".equals(memberType)) {
            // 수강과목 COURSE
            String semester = currentSemester();
            List<Long> courseIds = enrollmentRepository
                    .findByStudentUsernameAndSemester(username, semester)
                    .stream().map(e -> e.getCourseId()).collect(Collectors.toList());
            if (!courseIds.isEmpty()) {
                scheduleRepository.findByCourseIdInAndScheduleTypeIn(courseIds, List.of("COURSE"))
                        .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
            }

            // DEPT_NOTICE (DEPARTMENT 구형 포함) — 같은 학과
            Long deptId = resolveDeptIdSafe(user);
            if (deptId != null) {
                scheduleRepository.findByScheduleTypeInAndDepartmentId(
                        List.of("DEPT_NOTICE", "DEPARTMENT"), deptId)
                        .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
            }

            // GRADE_NOTICE — 같은 학과 + 학년 필터
            if (user.getGrade() != null) {
                Long studentDeptId = resolveDeptIdSafe(user);
                String gradeStr = String.valueOf(user.getGrade());
                scheduleRepository.findByScheduleType("GRADE_NOTICE").stream()
                        .filter(s -> {
                            if (studentDeptId != null && !studentDeptId.equals(s.getDepartmentId())) return false;
                            if (univId != null && s.getUniversityId() != null && !univId.equals(s.getUniversityId())) return false;
                            if (s.getTargetGradesJson() != null && !s.getTargetGradesJson().isBlank()) {
                                for (String g : s.getTargetGradesJson().split(",")) {
                                    if (g.trim().equals(gradeStr)) return true;
                                }
                                return false;
                            }
                            return user.getGrade().equals(s.getTargetGrade());
                        })
                        .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
            }

        } else if ("professor".equals(memberType) || "assistant".equals(memberType)) {
            Long deptId = resolveDeptIdSafe(user);
            if (deptId != null) {
                // DEPT_NOTICE (DEPARTMENT 구형 포함) 학과 공지
                scheduleRepository.findByScheduleTypeInAndDepartmentId(
                        List.of("DEPT_NOTICE", "DEPARTMENT"), deptId)
                        .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
                // GRADE_NOTICE (학과 기반)
                scheduleRepository.findByScheduleType("GRADE_NOTICE").stream()
                        .filter(s -> deptId.equals(s.getDepartmentId()))
                        .filter(s -> univId == null || univId.equals(s.getUniversityId()) || s.getUniversityId() == null)
                        .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
            }
            // 교수: 담당 과목 COURSE
            if ("professor".equals(memberType) && user.getProfessorEntityId() != null) {
                List<Long> profCourseIds = assignmentRepository
                        .findByProfessorId(user.getProfessorEntityId())
                        .stream().map(a -> a.getCourseId()).collect(Collectors.toList());
                if (!profCourseIds.isEmpty()) {
                    scheduleRepository.findByCourseIdInAndScheduleTypeIn(profCourseIds, List.of("COURSE"))
                            .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
                }
            }

        } else if ("admin".equals(memberType)) {
            scheduleRepository.findAll()
                    .forEach(s -> { if (seen.add(s.getId())) result.add(s); });
        }

        return result.stream()
                .map(this::toDto)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ── 일정 수정 ──────────────────────────────────────────────────────────────────

    @Transactional
    public ScheduleDto updateSchedule(String username, Long scheduleId, ScheduleCreateRequest req) {
        User user = getUser(username);
        Schedule s = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다."));

        // 작성자 또는 소유자만 수정 가능
        boolean isCreator = username.equals(s.getCreatedBy()) || user.getId().equals(s.getOwnerId());
        boolean isAdmin   = "admin".equals(user.getMemberType());
        if (!isCreator && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "수정 권한이 없습니다.");
        }

        // 수정 가능한 필드만 업데이트
        if (req.getTitle()     != null) s.setTitle(req.getTitle());
        if (req.getContent()   != null) s.setContent(req.getContent());
        if (req.getCategory()  != null) s.setCategory(req.getCategory());
        if (req.getStartDate() != null) {
            LocalDate updStart = LocalDate.parse(req.getStartDate());
            s.setStartDate(updStart);
            s.setEventDate(updStart);
        }
        if (req.getEndDate()   != null && !req.getEndDate().isBlank())
            s.setEndDate(LocalDate.parse(req.getEndDate()));
        if (req.getStartTime() != null) s.setStartTime(req.getStartTime());
        if (req.getEndTime()   != null) s.setEndTime(req.getEndTime());
        if (req.getCourseId()    != null) s.setCourseId(req.getCourseId());
        if (req.getTargetGrade() != null) s.setTargetGrade(req.getTargetGrade());
        s.setUpdatedAt(LocalDateTime.now());

        return toDto(scheduleRepository.save(s));
    }

    // ── 완료 토글 ──────────────────────────────────────────────────────────────────

    @Transactional
    public ScheduleDto toggleComplete(String username, Long scheduleId) {
        User user = getUser(username);
        Schedule s = scheduleRepository.findByIdAndOwnerId(scheduleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "본인의 개인 일정만 완료 처리할 수 있습니다."));
        s.setCompleted(!s.isCompleted());
        s.setUpdatedAt(LocalDateTime.now());
        return toDto(scheduleRepository.save(s));
    }

    // ── 삭제 ──────────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteSchedule(String username, Long scheduleId) {
        User user = getUser(username);
        Schedule s = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다."));

        String memberType = user.getMemberType();
        boolean isOwner = user.getId().equals(s.getOwnerId())
                || username.equals(s.getCreatedBy());
        boolean isAdmin = "admin".equals(memberType);

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "삭제 권한이 없습니다.");
        }
        scheduleRepository.delete(s);
    }

    // ── 레거시 조회 메서드 (기존 /api/schedules/dept 엔드포인트용) ──────────────────

    public List<ScheduleDto> getSchedulesByDept(Long deptId) {
        Set<Long> seen = new LinkedHashSet<>();
        List<Schedule> res = new ArrayList<>();
        scheduleRepository.findByScheduleTypeInAndDepartmentId(
                List.of("DEPT_NOTICE", "DEPARTMENT"), deptId)
                .forEach(s -> { if (seen.add(s.getId())) res.add(s); });
        return res.stream().map(this::toDto).collect(Collectors.toList());
    }

    // 하위 호환 스텁 — 학부/대학 단위 일정은 새 스키마에서 GLOBAL_NOTICE로 대체
    public List<ScheduleDto> getSchedulesByFaculty(Long facultyId) { return List.of(); }
    public List<ScheduleDto> getSchedulesByUniv(Long univId) { return List.of(); }

    // ── 내부 헬퍼 ─────────────────────────────────────────────────────────────────

    // 학생 허용 타입: PERSONAL, DEPT_NOTICE, SCHOOL_NOTICE (COURSE·GLOBAL_NOTICE 불가)
    private static final java.util.Set<String> STUDENT_ALLOWED =
            java.util.Set.of("PERSONAL", "DEPT_NOTICE", "SCHOOL_NOTICE", "DEPARTMENT");

    private void validateCreatePermission(String memberType, String scheduleType) {
        switch (memberType) {
            case "student" -> {
                if (!STUDENT_ALLOWED.contains(scheduleType)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "학생은 개인·학과·학교 일정만 등록할 수 있습니다. (COURSE·GLOBAL_NOTICE 불가)");
                }
            }
            case "assistant", "professor", "admin" -> { /* 전체 허용 */ }
            default -> {
                if (!"PERSONAL".equals(scheduleType)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
                }
            }
        }
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "인증 정보를 확인할 수 없습니다."));
    }

    private Long resolveDeptId(User user) {
        Long deptId = resolveDeptIdSafe(user);
        if (deptId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "학과 정보를 확인할 수 없습니다.");
        }
        return deptId;
    }

    private Long resolveDeptIdSafe(User user) {
        if (user.getUniversityId() == null || user.getDepartment() == null) return null;
        try {
            long univId = Long.parseLong(user.getUniversityId());
            return adminService.resolveDeptIdByName(univId, user.getDepartment());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String currentSemester() {
        java.time.LocalDate now = java.time.LocalDate.now();
        int year = now.getYear();
        int semester = now.getMonthValue() <= 7 ? 1 : 2;
        return year + "-" + semester;
    }

    private ScheduleDto toDto(Schedule s) {
        ScheduleDto dto = new ScheduleDto();
        dto.setId(s.getId());
        dto.setTitle(s.getTitle());
        dto.setContent(s.getContent());
        dto.setScheduleType(s.getScheduleType());
        dto.setOwnerId(s.getOwnerId());
        dto.setCourseId(s.getCourseId());
        dto.setDepartmentId(s.getDepartmentId());
        dto.setTargetGrade(s.getTargetGrade());
        dto.setTargetGradesJson(s.getTargetGradesJson());
        dto.setIsAllGrades(s.getIsAllGrades());
        dto.setCategory(s.getCategory());
        dto.setCompleted(s.isCompleted());
        // startDate null 방어 (구 스키마 레코드 호환)
        if (s.getStartDate() == null) return null;
        dto.setStartDate(s.getStartDate().toString());
        dto.setEndDate(s.getEndDate() != null ? s.getEndDate().toString() : null);
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setCreatedBy(s.getCreatedBy());
        dto.setUniversityId(s.getUniversityId());
        return dto;
    }
}
