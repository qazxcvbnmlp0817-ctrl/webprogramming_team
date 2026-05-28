package com.example.demo.service;

import com.example.demo.dto.ClassScheduleDto;
import com.example.demo.dto.ClassScheduleRequestDto;
import com.example.demo.entity.ClassSchedule;
import com.example.demo.entity.Enrollment;
import com.example.demo.entity.Professor;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProfessorScheduleService {

    private final UserRepository userRepository;
    private final ProfessorRepository professorRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final CurriculumItemRepository curriculumItemRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ProfessorScheduleService(UserRepository userRepository,
                                     ProfessorRepository professorRepository,
                                     ProfessorCourseAssignmentRepository assignmentRepository,
                                     CurriculumItemRepository curriculumItemRepository,
                                     ClassScheduleRepository classScheduleRepository,
                                     EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
        this.assignmentRepository = assignmentRepository;
        this.curriculumItemRepository = curriculumItemRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ── 교수 인증 헬퍼 ──────────────────────────────────────────────────────

    private Professor resolveProf(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보를 확인할 수 없습니다"));
        if (!"professor".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "교수 계정만 사용할 수 있습니다");
        }
        if (user.getProfessorEntityId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "교수 프로필이 연결되지 않았습니다");
        }
        return professorRepository.findById(user.getProfessorEntityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "교수 정보를 찾을 수 없습니다"));
    }

    // ── 교수 시간표 CRUD ────────────────────────────────────────────────────

    public List<ClassScheduleDto> getMySchedules(String username) {
        Professor prof = resolveProf(username);
        List<ClassSchedule> schedules = classScheduleRepository.findByProfessorId(prof.getId());
        return enrichAll(schedules);
    }

    public List<ClassScheduleDto> getMySchedulesBySemester(String username, String semester) {
        Professor prof = resolveProf(username);
        List<ClassSchedule> schedules = classScheduleRepository.findByProfessorIdAndSemester(prof.getId(), semester);
        return enrichAll(schedules);
    }

    @Transactional
    public ClassScheduleDto createSchedule(String username, ClassScheduleRequestDto req) {
        validateRequest(req);
        Professor prof = resolveProf(username);

        // 교수가 해당 강좌를 담당하는지 확인
        if (!assignmentRepository.existsByProfessorIdAndCourseId(prof.getId(), req.getCourseId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "배정받지 않은 강좌입니다");
        }

        ClassSchedule cs = new ClassSchedule();
        cs.setCourseId(req.getCourseId());
        cs.setProfessorId(prof.getId());
        cs.setDeptId(prof.getDeptId());
        cs.setDayOfWeek(req.getDayOfWeek());
        cs.setStartTime(req.getStartTime());
        cs.setEndTime(req.getEndTime());
        cs.setRoom(req.getRoom());
        cs.setSemester(req.getSemester());
        cs.setMemo(req.getMemo());
        cs.setCreatedAt(LocalDateTime.now());
        cs.setUpdatedAt(LocalDateTime.now());

        return enrich(classScheduleRepository.save(cs));
    }

    // 수정 시 수강생 시간표에 자동 반영됨 (Enrollment → ClassSchedule 쿼리 구조 덕분)
    @Transactional
    public ClassScheduleDto updateSchedule(String username, Long scheduleId, ClassScheduleRequestDto req) {
        validateRequest(req);
        Professor prof = resolveProf(username);

        ClassSchedule cs = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수업 시간표를 찾을 수 없습니다"));
        if (!cs.getProfessorId().equals(prof.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "자신의 수업만 수정할 수 있습니다");
        }

        cs.setDayOfWeek(req.getDayOfWeek());
        cs.setStartTime(req.getStartTime());
        cs.setEndTime(req.getEndTime());
        cs.setRoom(req.getRoom());
        cs.setSemester(req.getSemester());
        cs.setMemo(req.getMemo());
        cs.setUpdatedAt(LocalDateTime.now());

        return enrich(classScheduleRepository.save(cs));
    }

    // 삭제 시 수강생 시간표에서도 즉시 사라짐
    @Transactional
    public void deleteSchedule(String username, Long scheduleId) {
        Professor prof = resolveProf(username);

        ClassSchedule cs = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수업 시간표를 찾을 수 없습니다"));
        if (!cs.getProfessorId().equals(prof.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "자신의 수업만 삭제할 수 있습니다");
        }

        classScheduleRepository.delete(cs);
    }

    // ── 학생 시간표 조회 (수강신청 기반 자동 동기화) ─────────────────────────

    public List<ClassScheduleDto> getStudentSchedules(String studentUsername, String semester) {
        List<Enrollment> enrollments = enrollmentRepository
                .findByStudentUsernameAndSemester(studentUsername, semester);
        if (enrollments.isEmpty()) return List.of();

        List<Long> courseIds = enrollments.stream()
                .map(Enrollment::getCourseId)
                .collect(Collectors.toList());

        return enrichAll(classScheduleRepository.findByCourseIdInAndSemester(courseIds, semester));
    }

    // ── 수강신청 관리 ────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> enroll(String studentUsername, Long courseId, String semester) {
        if (enrollmentRepository.existsByStudentUsernameAndCourseIdAndSemester(studentUsername, courseId, semester)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 수강신청한 강좌입니다");
        }
        var course = curriculumItemRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "강좌를 찾을 수 없습니다"));

        Enrollment e = new Enrollment();
        e.setStudentUsername(studentUsername);
        e.setCourseId(courseId);
        e.setDeptId(course.getDeptId());
        e.setSemester(semester);
        e.setEnrolledAt(LocalDateTime.now());
        enrollmentRepository.save(e);

        return Map.of("message", "수강신청이 완료됐습니다", "courseId", courseId, "semester", semester);
    }

    @Transactional
    public void cancelEnrollment(String studentUsername, Long enrollmentId) {
        Enrollment e = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수강 내역을 찾을 수 없습니다"));
        if (!e.getStudentUsername().equals(studentUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "자신의 수강신청만 취소할 수 있습니다");
        }
        enrollmentRepository.delete(e);
    }

    // 학과의 수강 가능 과목 목록 조회
    public List<Map<String, Object>> getCoursesByDept(Long deptId) {
        return curriculumItemRepository.findByDeptId(deptId).stream()
                .map(c -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("courseId", c.getId());
                    row.put("courseName", c.getName());
                    row.put("year", c.getYear());
                    row.put("credits", c.getCredits());
                    row.put("required", c.isRequired());
                    row.put("deptId", c.getDeptId());
                    return row;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMyEnrollments(String studentUsername, String semester) {
        return enrollmentRepository.findByStudentUsernameAndSemester(studentUsername, semester).stream()
                .map(e -> {
                    String courseName = curriculumItemRepository.findById(e.getCourseId())
                            .map(c -> c.getName()).orElse("(삭제된 강좌)");
                    Map<String, Object> row = new HashMap<>();
                    row.put("enrollmentId", e.getId());
                    row.put("courseId", e.getCourseId());
                    row.put("courseName", courseName);
                    row.put("semester", e.getSemester());
                    row.put("enrolledAt", String.valueOf(e.getEnrolledAt()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    // ── 내부 헬퍼 ────────────────────────────────────────────────────────────

    private void validateRequest(ClassScheduleRequestDto req) {
        if (req.getCourseId() == null || req.getDayOfWeek() == null
                || req.getStartTime() == null || req.getEndTime() == null
                || req.getSemester() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "courseId, dayOfWeek, startTime, endTime, semester 는 필수입니다");
        }
    }

    private List<ClassScheduleDto> enrichAll(List<ClassSchedule> schedules) {
        if (schedules.isEmpty()) return List.of();

        // 배치 조회 (N+1 방지)
        List<Long> courseIds = schedules.stream().map(ClassSchedule::getCourseId).distinct().collect(Collectors.toList());
        List<Long> profIds   = schedules.stream().map(ClassSchedule::getProfessorId).distinct().collect(Collectors.toList());

        Map<Long, String> courseNames = curriculumItemRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c.getName()));
        Map<Long, String> profNames = professorRepository.findAllById(profIds).stream()
                .collect(Collectors.toMap(p -> p.getId(), p -> p.getName()));

        return schedules.stream().map(cs -> {
            ClassScheduleDto dto = toDto(cs);
            dto.setCourseName(courseNames.getOrDefault(cs.getCourseId(), ""));
            dto.setProfessorName(profNames.getOrDefault(cs.getProfessorId(), ""));
            return dto;
        }).collect(Collectors.toList());
    }

    private ClassScheduleDto enrich(ClassSchedule cs) {
        ClassScheduleDto dto = toDto(cs);
        curriculumItemRepository.findById(cs.getCourseId()).ifPresent(c -> dto.setCourseName(c.getName()));
        professorRepository.findById(cs.getProfessorId()).ifPresent(p -> dto.setProfessorName(p.getName()));
        return dto;
    }

    private ClassScheduleDto toDto(ClassSchedule cs) {
        ClassScheduleDto dto = new ClassScheduleDto();
        dto.setId(cs.getId());
        dto.setCourseId(cs.getCourseId());
        dto.setProfessorId(cs.getProfessorId());
        dto.setDeptId(cs.getDeptId());
        dto.setDayOfWeek(cs.getDayOfWeek());
        dto.setStartTime(cs.getStartTime());
        dto.setEndTime(cs.getEndTime());
        dto.setRoom(cs.getRoom());
        dto.setSemester(cs.getSemester());
        dto.setMemo(cs.getMemo());
        dto.setUpdatedAt(cs.getUpdatedAt());
        return dto;
    }
}
