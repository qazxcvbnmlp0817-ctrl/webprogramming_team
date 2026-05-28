package com.example.demo.service;

import com.example.demo.dto.CourseScheduleCreateDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.entity.Department;
import com.example.demo.entity.Enrollment;
import com.example.demo.entity.Professor;
import com.example.demo.entity.Schedule;
import com.example.demo.entity.User;
import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.repository.CurriculumItemRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EnrollmentRepository;
import com.example.demo.repository.FacultyGroupRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import com.example.demo.repository.ProfessorRepository;
import com.example.demo.repository.ScheduleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DummyDataHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ProfessorRepository professorRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DepartmentRepository departmentRepository;
    private final CurriculumItemRepository curriculumItemRepository;
    private final FacultyGroupRepository facultyGroupRepository;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           UserRepository userRepository,
                           ProfessorRepository professorRepository,
                           ProfessorCourseAssignmentRepository assignmentRepository,
                           EnrollmentRepository enrollmentRepository,
                           DepartmentRepository departmentRepository,
                           CurriculumItemRepository curriculumItemRepository,
                           FacultyGroupRepository facultyGroupRepository) {
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
        this.assignmentRepository = assignmentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.departmentRepository = departmentRepository;
        this.curriculumItemRepository = curriculumItemRepository;
        this.facultyGroupRepository = facultyGroupRepository;
    }

    public List<ScheduleDto> getSchedulesByDept(Long deptId) {
        List<Schedule> schedules = scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("dept", deptId);
        if (schedules.isEmpty()) return DummyDataHelper.getSchedulesByDept(deptId);
        return schedules.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ScheduleDto> getSchedulesByFaculty(Long facultyId) {
        List<Schedule> schedules = scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("faculty", facultyId);
        if (schedules.isEmpty()) return DummyDataHelper.getSchedulesByFaculty(facultyId);
        return schedules.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ScheduleDto> getSchedulesByUniv(Long univId) {
        List<Schedule> schedules = scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("univ", univId);
        if (schedules.isEmpty()) return DummyDataHelper.getUniversitySchedules(univId);
        return schedules.stream().map(this::toDto).collect(Collectors.toList());
    }

    // 교수가 담당 과목에 일정 등록
    @Transactional
    public ScheduleDto createCourseSchedule(String username, CourseScheduleCreateDto req) {
        if (req.getCourseId() == null || req.getTitle() == null || req.getEventDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courseId, title, eventDate 는 필수입니다");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다"));

        Professor prof = null;
        if ("professor".equals(user.getMemberType())) {
            if (user.getProfessorEntityId() == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "교수 프로필이 연결되지 않았습니다");
            }
            prof = professorRepository.findById(user.getProfessorEntityId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "교수 정보를 찾을 수 없습니다"));
            if (!assignmentRepository.existsByProfessorIdAndCourseId(prof.getId(), req.getCourseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "담당하지 않는 강좌입니다");
            }
        } else if (!"assistant".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "교수 또는 조교 계정만 사용할 수 있습니다");
        }

        Schedule s = new Schedule();
        s.setTitle(req.getTitle());
        s.setEventDate(LocalDate.parse(req.getEventDate()));
        s.setCategory(req.getCategory() != null ? req.getCategory() : "기타");
        s.setScopeType("course");
        s.setScopeId(req.getCourseId());

        return toDto(scheduleRepository.save(s));
    }

    // 학생의 수강과목에 등록된 교수 일정 조회
    public List<ScheduleDto> getStudentCourseEvents(String username, String semester) {
        List<Enrollment> enrollments = enrollmentRepository
                .findByStudentUsernameAndSemester(username, semester);
        if (enrollments.isEmpty()) return List.of();

        List<Long> courseIds = enrollments.stream()
                .map(Enrollment::getCourseId)
                .collect(Collectors.toList());

        return scheduleRepository
                .findByScopeTypeAndScopeIdInOrderByEventDateAsc("course", courseIds)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // 교수/조교: 학과 전체 공개 수업 일정 등록 (수강신청 무관, 학과 소속 학생 전체 공유)
    @Transactional
    public ScheduleDto createDeptCourseSchedule(String username, CourseScheduleCreateDto req) {
        if (req.getTitle() == null || req.getEventDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title, eventDate 는 필수입니다");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다"));

        if (!"professor".equals(user.getMemberType()) && !"assistant".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "교수 또는 조교 계정만 사용할 수 있습니다");
        }

        Long deptId = null;

        // 교수: PROFESSORS 테이블에서 deptId 조회
        if ("professor".equals(user.getMemberType()) && user.getProfessorEntityId() != null) {
            Professor prof = professorRepository.findById(user.getProfessorEntityId()).orElse(null);
            if (prof != null) deptId = prof.getDeptId();
        }

        // 폴백: user.department 이름으로 학과 조회
        if (deptId == null) {
            String deptName = user.getDepartment();
            if (deptName != null && !deptName.isBlank()) {
                List<Department> depts = departmentRepository.findByName(deptName);
                if (!depts.isEmpty()) deptId = depts.get(0).getId();
                if (deptId == null) {
                    List<Department> fuzzy = departmentRepository.findByNameContainingIgnoreCase(deptName);
                    if (!fuzzy.isEmpty()) deptId = fuzzy.get(0).getId();
                }
            }
        }

        if (deptId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학과 정보를 확인할 수 없습니다");
        }

        Schedule s = new Schedule();
        s.setTitle(req.getTitle());
        s.setEventDate(LocalDate.parse(req.getEventDate()));
        s.setCategory(req.getCategory() != null ? req.getCategory() : "기타");
        s.setCourseName(req.getCourseName());
        s.setScopeType("course_dept");
        s.setScopeId(deptId);

        return toDto(scheduleRepository.save(s));
    }

    // 학생: 소속 학과 교수 등록 일정 조회
    public List<ScheduleDto> getStudentDeptCourseEvents(Long deptId) {
        return scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("course_dept", deptId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // 조교: 소속 학과(또는 대학 전체) 과목 목록
    public List<Map<String, Object>> getAssistantCourses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다"));
        if (!"assistant".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "조교 계정만 사용할 수 있습니다");
        }

        // 1) 학과 이름 정확 매칭
        String deptName = user.getDepartment();
        if (deptName != null && !deptName.isBlank()) {
            List<Department> exactDepts = departmentRepository.findByName(deptName);
            if (!exactDepts.isEmpty()) {
                return toCourseList(curriculumItemRepository.findByDeptId(exactDepts.get(0).getId()));
            }

            // 2) 이름 일부 포함 매칭 (대소문자 무시)
            List<Department> fuzzyDepts = departmentRepository.findByNameContainingIgnoreCase(deptName);
            if (!fuzzyDepts.isEmpty()) {
                return toCourseList(curriculumItemRepository.findByDeptId(fuzzyDepts.get(0).getId()));
            }
        }

        // 3) 대학(universityId) 기반 전체 과목 폴백
        String univIdStr = user.getUniversityId();
        if (univIdStr != null && !univIdStr.isBlank()) {
            try {
                Long schoolId = Long.valueOf(univIdStr);
                List<Long> facultyIds = facultyGroupRepository.findBySchoolId(schoolId)
                        .stream().map(FacultyGroup::getId).collect(Collectors.toList());
                if (!facultyIds.isEmpty()) {
                    List<Long> deptIds = departmentRepository.findByFacultyIdIn(facultyIds)
                            .stream().map(Department::getId).collect(Collectors.toList());
                    if (!deptIds.isEmpty()) {
                        return toCourseList(curriculumItemRepository.findByDeptIdIn(deptIds));
                    }
                }
            } catch (NumberFormatException ignored) {}
        }

        return List.of();
    }

    private List<Map<String, Object>> toCourseList(List<CurriculumItem> items) {
        return items.stream().map(c -> {
            Map<String, Object> row = new HashMap<>();
            row.put("courseId", c.getId());
            row.put("courseName", c.getName());
            row.put("deptId", c.getDeptId());
            return row;
        }).collect(Collectors.toList());
    }

    public Schedule save(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    private ScheduleDto toDto(Schedule s) {
        int dday = (int) ChronoUnit.DAYS.between(LocalDate.now(), s.getEventDate());
        return new ScheduleDto(
                s.getId(),
                s.getTitle(),
                s.getEventDate().toString(),
                dday,
                s.getCategory(),
                s.getCourseName()
        );
    }
}
