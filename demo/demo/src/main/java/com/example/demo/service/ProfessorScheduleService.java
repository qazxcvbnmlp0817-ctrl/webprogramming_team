package com.example.demo.service;

import com.example.demo.dto.ClassScheduleDto;
import com.example.demo.dto.ClassScheduleRequestDto;
import com.example.demo.entity.ClassSchedule;
import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.Department;
import com.example.demo.entity.Enrollment;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.entity.LectureOffering;
import com.example.demo.entity.Professor;
import com.example.demo.entity.ProfessorCourseAssignment;
import com.example.demo.entity.StudentTimetableEntry;
import com.example.demo.entity.User;
import com.example.demo.repository.ClassScheduleRepository;
import com.example.demo.repository.CollegeSchoolRepository;
import com.example.demo.repository.CurriculumItemRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EnrollmentRepository;
import com.example.demo.repository.FacultyGroupRepository;
import com.example.demo.repository.LectureOfferingRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import com.example.demo.repository.ProfessorRepository;
import com.example.demo.repository.StudentTimetableEntryRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfessorScheduleService {

    private final UserRepository userRepository;
    private final ProfessorRepository professorRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final CurriculumItemRepository curriculumItemRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentTimetableEntryRepository timetableEntryRepository;
    private final LectureOfferingRepository lectureOfferingRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyGroupRepository facultyGroupRepository;
    private final CollegeSchoolRepository collegeSchoolRepository;

    public ProfessorScheduleService(UserRepository userRepository,
                                     ProfessorRepository professorRepository,
                                     ProfessorCourseAssignmentRepository assignmentRepository,
                                     CurriculumItemRepository curriculumItemRepository,
                                     ClassScheduleRepository classScheduleRepository,
                                     EnrollmentRepository enrollmentRepository,
                                     StudentTimetableEntryRepository timetableEntryRepository,
                                     LectureOfferingRepository lectureOfferingRepository,
                                     DepartmentRepository departmentRepository,
                                     FacultyGroupRepository facultyGroupRepository,
                                     CollegeSchoolRepository collegeSchoolRepository) {
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
        this.assignmentRepository = assignmentRepository;
        this.curriculumItemRepository = curriculumItemRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.lectureOfferingRepository = lectureOfferingRepository;
        this.departmentRepository = departmentRepository;
        this.facultyGroupRepository = facultyGroupRepository;
        this.collegeSchoolRepository = collegeSchoolRepository;
    }

    public List<ClassScheduleDto> getMySchedules(String username) {
        Professor prof = resolveProf(username);
        return enrichAll(assignedOnly(classScheduleRepository.findByProfessorId(prof.getId())));
    }

    public List<ClassScheduleDto> getMySchedulesBySemester(String username, String semester) {
        Professor prof = resolveProf(username);
        return enrichAll(assignedOnly(classScheduleRepository.findByProfessorIdAndSemester(prof.getId(), semester)));
    }

    public List<Map<String, Object>> getProfessorAssignments(String username) {
        Professor prof = resolveProf(username);
        return buildAssignmentDtos(assignmentRepository.findByProfessorId(prof.getId()));
    }

    @Transactional
    public ClassScheduleDto createSchedule(String username, ClassScheduleRequestDto req) {
        validateRequest(req);
        Professor prof = resolveProf(username);
        validateProfessorCourse(prof, req.getCourseId());
        assertNoOverlap(prof.getId(), req.getSemester(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), null);
        assertNoStudentEnrollmentConflict(req.getCourseId(), req.getSemester(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), null);

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

    @Transactional
    public ClassScheduleDto updateSchedule(String username, Long scheduleId, ClassScheduleRequestDto req) {
        validateRequest(req);
        Professor prof = resolveProf(username);

        ClassSchedule cs = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class schedule not found"));
        assertScheduleAssigned(cs);
        if (!cs.getProfessorId().equals(prof.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only your own class schedule can be edited");
        }
        if (!cs.getCourseId().equals(req.getCourseId())) {
            validateProfessorCourse(prof, req.getCourseId());
            cs.setCourseId(req.getCourseId());
        }
        assertNoOverlap(prof.getId(), req.getSemester(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), scheduleId);
        assertNoStudentEnrollmentConflict(req.getCourseId(), req.getSemester(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), scheduleId);

        cs.setDayOfWeek(req.getDayOfWeek());
        cs.setStartTime(req.getStartTime());
        cs.setEndTime(req.getEndTime());
        cs.setRoom(req.getRoom());
        cs.setSemester(req.getSemester());
        cs.setMemo(req.getMemo());
        cs.setUpdatedAt(LocalDateTime.now());
        return enrich(classScheduleRepository.save(cs));
    }

    @Transactional
    public void deleteSchedule(String username, Long scheduleId) {
        Professor prof = resolveProf(username);
        ClassSchedule cs = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class schedule not found"));
        assertScheduleAssigned(cs);
        if (!cs.getProfessorId().equals(prof.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only your own class schedule can be deleted");
        }
        classScheduleRepository.delete(cs);
    }

    public List<ClassScheduleDto> getStudentSchedules(String studentUsername, String semester) {
        assertMemberType(studentUsername, "student");
        List<Long> courseIds = getStudentCourseIds(studentUsername, semester);
        if (courseIds.isEmpty()) return List.of();
        return enrichAll(assignedOnly(classScheduleRepository.findByCourseIdInAndSemester(courseIds, semester)));
    }

    @Transactional
    public Map<String, Object> enroll(String studentUsername, Long courseId, String semester) {
        assertMemberType(studentUsername, "student");
        if (enrollmentRepository.existsByStudentUsernameAndCourseIdAndSemester(studentUsername, courseId, semester)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already enrolled in this course");
        }
        CurriculumItem course = curriculumItemRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        assertNoEnrollmentConflict(studentUsername, courseId, semester);

        Enrollment e = new Enrollment();
        e.setStudentUsername(studentUsername);
        e.setCourseId(courseId);
        e.setDeptId(course.getDeptId());
        e.setSemester(semester);
        e.setEnrolledAt(LocalDateTime.now());
        enrollmentRepository.save(e);
        return Map.of("message", "Enrollment completed", "courseId", courseId, "semester", semester);
    }

    @Transactional
    public void cancelEnrollment(String studentUsername, Long enrollmentId) {
        assertMemberType(studentUsername, "student");
        Enrollment e = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
        if (!e.getStudentUsername().equals(studentUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only your own enrollment can be cancelled");
        }
        enrollmentRepository.delete(e);
    }

    public List<Map<String, Object>> getMyEnrollments(String studentUsername, String semester) {
        assertMemberType(studentUsername, "student");
        return enrollmentRepository.findByStudentUsernameAndSemester(studentUsername, semester).stream()
                .map(e -> {
                    String courseName = curriculumItemRepository.findById(e.getCourseId())
                            .map(CurriculumItem::getName).orElse("(deleted course)");
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

    public List<ClassScheduleDto> getDeptSchedules(Long deptId, String semester) {
        return enrichAll(assignedOnly(classScheduleRepository.findByDeptIdAndSemester(deptId, semester)));
    }

    public List<ClassScheduleDto> getAdminSchedules(String username, Long deptId, String semester) {
        AdminScope scope = resolveAdminScope(username, deptId);
        if (scope.all()) {
            return enrichAll(assignedOnly(classScheduleRepository.findBySemester(semester)));
        }
        if (scope.deptIds().isEmpty()) return List.of();
        return enrichAll(assignedOnly(classScheduleRepository.findByDeptIdInAndSemester(scope.deptIds(), semester)));
    }

    @Transactional
    public ClassScheduleDto createAdminSchedule(String username, ClassScheduleRequestDto req) {
        validateRequest(req);
        if (req.getProfessorId() == null || req.getDeptId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "professorId and deptId are required");
        }
        AdminScope scope = resolveAdminScope(username, req.getDeptId());
        ensureScope(scope, req.getDeptId());
        validateAdminSchedule(req.getProfessorId(), req.getCourseId(), req.getDeptId());
        assertNoOverlap(req.getProfessorId(), req.getSemester(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), null);
        assertNoStudentEnrollmentConflict(req.getCourseId(), req.getSemester(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), null);

        ClassSchedule cs = new ClassSchedule();
        cs.setCourseId(req.getCourseId());
        cs.setProfessorId(req.getProfessorId());
        cs.setDeptId(req.getDeptId());
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

    @Transactional
    public ClassScheduleDto updateAdminSchedule(String username, Long scheduleId, ClassScheduleRequestDto req) {
        ClassSchedule cs = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class schedule not found"));
        assertScheduleAssigned(cs);
        AdminScope existingScope = resolveAdminScope(username, cs.getDeptId());
        ensureScope(existingScope, cs.getDeptId());

        Long nextCourseId = req.getCourseId() != null ? req.getCourseId() : cs.getCourseId();
        Long nextProfessorId = req.getProfessorId() != null ? req.getProfessorId() : cs.getProfessorId();
        Long nextDeptId = req.getDeptId() != null ? req.getDeptId() : cs.getDeptId();
        String nextDay = req.getDayOfWeek() != null ? req.getDayOfWeek() : cs.getDayOfWeek();
        String nextStart = req.getStartTime() != null ? req.getStartTime() : cs.getStartTime();
        String nextEnd = req.getEndTime() != null ? req.getEndTime() : cs.getEndTime();
        String nextSemester = req.getSemester() != null ? req.getSemester() : cs.getSemester();

        validateTimes(nextDay, nextStart, nextEnd, nextSemester);
        AdminScope nextScope = resolveAdminScope(username, nextDeptId);
        ensureScope(nextScope, nextDeptId);
        validateAdminSchedule(nextProfessorId, nextCourseId, nextDeptId);
        assertNoOverlap(nextProfessorId, nextSemester, nextDay, nextStart, nextEnd, scheduleId);
        assertNoStudentEnrollmentConflict(nextCourseId, nextSemester, nextDay, nextStart, nextEnd, scheduleId);

        cs.setCourseId(nextCourseId);
        cs.setProfessorId(nextProfessorId);
        cs.setDeptId(nextDeptId);
        cs.setDayOfWeek(nextDay);
        cs.setStartTime(nextStart);
        cs.setEndTime(nextEnd);
        cs.setRoom(req.getRoom());
        cs.setSemester(nextSemester);
        cs.setMemo(req.getMemo());
        cs.setUpdatedAt(LocalDateTime.now());
        return enrich(classScheduleRepository.save(cs));
    }

    @Transactional
    public void deleteAdminSchedule(String username, Long scheduleId) {
        ClassSchedule cs = classScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class schedule not found"));
        assertScheduleAssigned(cs);
        AdminScope scope = resolveAdminScope(username, cs.getDeptId());
        ensureScope(scope, cs.getDeptId());
        classScheduleRepository.delete(cs);
    }

    private Professor resolveProf(String username) {
        User user = requireUser(username);
        if (!"professor".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Professor account required");
        }
        if (user.getProfessorEntityId() == null) {
            Professor linked = linkProfessorProfileIfPossible(user);
            if (linked != null) return linked;
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Professor profile is not linked. Sign up with the exact professor name and department, or ask an admin to link it.");
        }
        return professorRepository.findById(user.getProfessorEntityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor not found"));
    }

    private Professor linkProfessorProfileIfPossible(User user) {
        if (user.getName() == null || user.getDepartment() == null || user.getUniversityId() == null) {
            return null;
        }
        try {
            Long deptId = resolveDeptIdByUser(user);
            // User signup does not carry a professor FK. This exact name + department
            // fallback is intentionally narrow because duplicate professor names are possible.
            Professor professor = professorRepository.findByNameAndDeptId(user.getName().trim(), deptId).orElse(null);
            if (professor == null) return null;
            user.setProfessorEntityId(professor.getId());
            userRepository.save(user);
            return professor;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private User requireUser(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing username");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void assertMemberType(String username, String memberType) {
        User user = requireUser(username);
        if (!memberType.equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, memberType + " account required");
        }
    }

    private List<ClassSchedule> assignedOnly(List<ClassSchedule> schedules) {
        if (schedules.isEmpty()) return List.of();
        return schedules.stream()
                .filter(this::isScheduleAssigned)
                .toList();
    }

    private boolean isScheduleAssigned(ClassSchedule schedule) {
        return assignmentRepository.existsByProfessorIdAndCourseId(
                schedule.getProfessorId(), schedule.getCourseId());
    }

    private void assertScheduleAssigned(ClassSchedule schedule) {
        if (!isScheduleAssigned(schedule)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Class schedule not found");
        }
    }

    private void validateRequest(ClassScheduleRequestDto req) {
        if (req.getCourseId() == null || req.getDayOfWeek() == null
                || req.getStartTime() == null || req.getEndTime() == null
                || req.getSemester() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "courseId, dayOfWeek, startTime, endTime, semester are required");
        }
        validateTimes(req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), req.getSemester());
    }

    private void validateTimes(String dayOfWeek, String startTime, String endTime, String semester) {
        if (dayOfWeek == null || startTime == null || endTime == null || semester == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "dayOfWeek, startTime, endTime, semester are required");
        }
        if (startTime.compareTo(endTime) >= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }
    }

    private List<Long> getStudentCourseIds(String studentUsername, String semester) {
        Set<Long> courseIds = new LinkedHashSet<>();
        enrollmentRepository.findByStudentUsernameAndSemester(studentUsername, semester).stream()
                .map(Enrollment::getCourseId)
                .forEach(courseIds::add);
        timetableEntryRepository.findByStudentUsernameAndSemester(studentUsername, semester).stream()
                .map(StudentTimetableEntry::getOfferingId)
                .map(this::resolveCourseIdFromOffering)
                .filter(Objects::nonNull)
                .forEach(courseIds::add);
        return new ArrayList<>(courseIds);
    }

    private List<String> getStudentUsernamesForCourse(Long courseId, String semester) {
        Set<String> usernames = new LinkedHashSet<>();
        enrollmentRepository.findByCourseIdAndSemester(courseId, semester).stream()
                .map(Enrollment::getStudentUsername)
                .forEach(usernames::add);
        timetableEntryRepository.findBySemester(semester).stream()
                .filter(entry -> courseId.equals(resolveCourseIdFromOffering(entry.getOfferingId())))
                .map(StudentTimetableEntry::getStudentUsername)
                .forEach(usernames::add);
        return new ArrayList<>(usernames);
    }

    private Long resolveCourseIdFromOffering(Long offeringId) {
        if (offeringId == null) return null;
        return lectureOfferingRepository.findById(offeringId)
                .map(this::resolveCourseFromOffering)
                .map(CurriculumItem::getId)
                .orElse(null);
    }

    private CurriculumItem resolveCourseFromOffering(LectureOffering offering) {
        for (String professorName : splitProfessorNames(offering.getProfessorName())) {
            List<Professor> professors = professorRepository.findByName(professorName);
            if (professors.size() != 1) continue;
            Professor professor = professors.get(0);
            // LectureOffering has no course/professor FK. Keep this fallback narrow:
            // exact professor name and exact course name in that professor's department.
            CurriculumItem course = curriculumItemRepository.findByDeptId(professor.getDeptId()).stream()
                    .filter(item -> normalize(item.getName()).equals(normalize(offering.getCourseName())))
                    .findFirst()
                    .orElse(null);
            if (course != null) return course;
        }
        return null;
    }

    private List<String> splitProfessorNames(String value) {
        if (value == null || value.isBlank()) return List.of();
        List<String> names = new ArrayList<>();
        for (String token : value.split("[,，/\\s]+")) {
            String name = token.trim();
            if (!name.isEmpty()) names.add(name);
        }
        return names;
    }

    private String normalize(String value) {
        return value == null ? "" : value.replaceAll("\\s+", "").trim();
    }

    private void validateProfessorCourse(Professor prof, Long courseId) {
        if (!assignmentRepository.existsByProfessorIdAndCourseId(prof.getId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Course is not assigned to this professor");
        }
        CurriculumItem course = curriculumItemRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        if (!course.getDeptId().equals(prof.getDeptId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Course is outside professor department");
        }
    }

    private void validateAdminSchedule(Long professorId, Long courseId, Long deptId) {
        if (!departmentRepository.existsById(deptId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found");
        }
        Professor prof = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor not found"));
        CurriculumItem course = curriculumItemRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        if (!prof.getDeptId().equals(deptId) || !course.getDeptId().equals(deptId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Professor and course must belong to the target department");
        }
        if (!assignmentRepository.existsByProfessorIdAndCourseId(professorId, courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Professor is not assigned to this course");
        }
    }

    private void assertNoOverlap(Long professorId, String semester, String dayOfWeek,
                                 String startTime, String endTime, Long ignoreScheduleId) {
        List<ClassSchedule> sameDay = classScheduleRepository
                .findByProfessorIdAndSemesterAndDayOfWeek(professorId, semester, dayOfWeek);
        boolean conflict = sameDay.stream()
                .filter(existing -> ignoreScheduleId == null || !existing.getId().equals(ignoreScheduleId))
                .anyMatch(existing -> overlaps(existing.getStartTime(), existing.getEndTime(), startTime, endTime));
        if (conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This professor already has a class at the selected time");
        }
    }

    private void assertNoStudentEnrollmentConflict(Long courseId, String semester, String dayOfWeek,
                                                   String startTime, String endTime, Long ignoreScheduleId) {
        List<String> studentUsernames = getStudentUsernamesForCourse(courseId, semester);
        for (String studentUsername : studentUsernames) {
            List<Long> otherCourseIds = getStudentCourseIds(studentUsername, semester).stream()
                    .filter(enrolledCourseId -> !courseId.equals(enrolledCourseId))
                    .distinct()
                    .toList();
            if (otherCourseIds.isEmpty()) continue;

            boolean conflict = classScheduleRepository.findByCourseIdInAndSemester(otherCourseIds, semester).stream()
                    .filter(schedule -> ignoreScheduleId == null || !schedule.getId().equals(ignoreScheduleId))
                    .filter(schedule -> dayOfWeek.equals(schedule.getDayOfWeek()))
                    .anyMatch(schedule -> overlaps(schedule.getStartTime(), schedule.getEndTime(), startTime, endTime));
            if (conflict) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Class time conflicts with an enrolled student's timetable: " + studentUsername);
            }
        }
    }

    private void assertNoEnrollmentConflict(String studentUsername, Long courseId, String semester) {
        List<ClassSchedule> targetSchedules = classScheduleRepository.findByCourseIdInAndSemester(List.of(courseId), semester);
        if (targetSchedules.isEmpty()) return;

        List<Long> otherCourseIds = getStudentCourseIds(studentUsername, semester).stream()
                .filter(enrolledCourseId -> !courseId.equals(enrolledCourseId))
                .distinct()
                .toList();
        if (otherCourseIds.isEmpty()) return;

        List<ClassSchedule> otherSchedules = classScheduleRepository.findByCourseIdInAndSemester(otherCourseIds, semester);
        boolean conflict = targetSchedules.stream().anyMatch(target ->
                otherSchedules.stream()
                        .filter(other -> target.getDayOfWeek().equals(other.getDayOfWeek()))
                        .anyMatch(other -> overlaps(other.getStartTime(), other.getEndTime(),
                                target.getStartTime(), target.getEndTime())));
        if (conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Selected course conflicts with your existing timetable");
        }
    }

    private boolean overlaps(String leftStart, String leftEnd, String rightStart, String rightEnd) {
        return leftStart.compareTo(rightEnd) < 0 && rightStart.compareTo(leftEnd) < 0;
    }

    private AdminScope resolveAdminScope(String username, Long deptIdParam) {
        User user = requireUser(username);
        String role = user.getAdminRole();
        if ("SUPER_ADMIN".equals(role)) {
            return deptIdParam == null ? new AdminScope(true, List.of()) : new AdminScope(false, List.of(deptIdParam));
        }
        if ("SCHOOL_ADMIN".equals(role)) {
            if (user.getUniversityId() == null || user.getUniversityId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "School admin has no university");
            }
            List<Long> allowed = getDeptIdsForUniv(Long.parseLong(user.getUniversityId()));
            if (deptIdParam != null) {
                if (!allowed.contains(deptIdParam)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Department is outside your university");
                }
                return new AdminScope(false, List.of(deptIdParam));
            }
            return new AdminScope(false, allowed);
        }
        if ("DEPT_ADMIN".equals(role)) {
            Long resolved = resolveDeptIdByUser(user);
            if (deptIdParam != null && !resolved.equals(deptIdParam)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only your department can be managed");
            }
            return new AdminScope(false, List.of(resolved));
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
    }

    private void ensureScope(AdminScope scope, Long deptId) {
        if (!scope.all() && !scope.deptIds().contains(deptId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Department is outside your scope");
        }
    }

    private Long resolveDeptIdByUser(User user) {
        if (user.getUniversityId() == null || user.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Department information missing");
        }
        Long univId = Long.parseLong(user.getUniversityId());
        return collegeSchoolRepository.findByUniversityId(univId).stream()
                .flatMap(school -> facultyGroupRepository.findBySchoolId(school.getId()).stream())
                .flatMap(faculty -> departmentRepository.findByFacultyId(faculty.getId()).stream())
                .filter(dept -> user.getDepartment().equals(dept.getName()))
                .map(Department::getId)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Department mapping failed"));
    }

    private List<Long> getDeptIdsForUniv(Long univId) {
        return collegeSchoolRepository.findByUniversityId(univId).stream()
                .map(CollegeSchool::getId)
                .flatMap(schoolId -> facultyGroupRepository.findBySchoolId(schoolId).stream())
                .map(FacultyGroup::getId)
                .flatMap(facultyId -> departmentRepository.findByFacultyId(facultyId).stream())
                .map(Department::getId)
                .toList();
    }

    private List<Map<String, Object>> buildAssignmentDtos(List<ProfessorCourseAssignment> assignments) {
        if (assignments.isEmpty()) return List.of();
        List<Long> courseIds = assignments.stream().map(ProfessorCourseAssignment::getCourseId).distinct().toList();
        Map<Long, String> courseNames = curriculumItemRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(CurriculumItem::getId, CurriculumItem::getName));
        return assignments.stream().map(a -> {
            Map<String, Object> row = new HashMap<>();
            row.put("id", a.getId());
            row.put("professorId", a.getProfessorId());
            row.put("courseId", a.getCourseId());
            row.put("deptId", a.getDeptId());
            row.put("courseName", courseNames.getOrDefault(a.getCourseId(), ""));
            return row;
        }).toList();
    }

    private List<ClassScheduleDto> enrichAll(List<ClassSchedule> schedules) {
        if (schedules.isEmpty()) return List.of();
        List<Long> courseIds = schedules.stream().map(ClassSchedule::getCourseId).distinct().collect(Collectors.toList());
        List<Long> profIds = schedules.stream().map(ClassSchedule::getProfessorId).distinct().collect(Collectors.toList());

        Map<Long, String> courseNames = curriculumItemRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(CurriculumItem::getId, CurriculumItem::getName));
        Map<Long, String> profNames = professorRepository.findAllById(profIds).stream()
                .collect(Collectors.toMap(Professor::getId, Professor::getName));

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

    private record AdminScope(boolean all, List<Long> deptIds) {}
}
