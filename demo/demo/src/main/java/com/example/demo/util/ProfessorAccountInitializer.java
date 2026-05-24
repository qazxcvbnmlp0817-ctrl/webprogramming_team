package com.example.demo.util;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 테스트용 교수/학생 Mock 계정 + 수강신청 + 수업 시간표 시딩
 *
 * Mock 교수 계정 (password: prof1234)
 * ─────────────────────────────────────────────────────
 *  ID          | 이름   | 학과
 *  prof_kim    | 김민준 | 컴퓨터공학과 (목포대)
 *  prof_lee    | 이서준 | 컴퓨터공학과 (목포대)
 *  prof_park   | 박지호 | 컴퓨터공학과 (목포대)
 *  prof_choi   | 최예준 | 전기전자공학과 (목포대)
 *  prof_jung   | 정시우 | 정보통신공학과 (목포대)
 *
 * Mock 학생 계정 (password: stu1234)
 * ─────────────────────────────────────────────────────
 *  ID          | 이름   | 학과            | 학년
 *  stu_kim1    | 김학생 | 컴퓨터공학과    | 1
 *  stu_lee2    | 이학생 | 컴퓨터공학과    | 2
 *  stu_park1   | 박학생 | 전기전자공학과  | 1
 */
@Component
@Order(5)
public class ProfessorAccountInitializer implements CommandLineRunner {

    private static final String SEMESTER = "2025-1";
    private static final String PROF_PW  = "prof1234";
    private static final String STU_PW   = "stu1234";

    private final UserRepository              userRepo;
    private final UniversityRepository        univRepo;
    private final CollegeSchoolRepository     schoolRepo;
    private final FacultyGroupRepository      facultyRepo;
    private final DepartmentRepository        deptRepo;
    private final ProfessorRepository         profRepo;
    private final CurriculumItemRepository    courseRepo;
    private final ProfessorCourseAssignmentRepository assignRepo;
    private final ClassScheduleRepository     scheduleRepo;
    private final EnrollmentRepository        enrollRepo;
    private final BCryptPasswordEncoder       encoder = new BCryptPasswordEncoder();

    public ProfessorAccountInitializer(
            UserRepository userRepo,
            UniversityRepository univRepo,
            CollegeSchoolRepository schoolRepo,
            FacultyGroupRepository facultyRepo,
            DepartmentRepository deptRepo,
            ProfessorRepository profRepo,
            CurriculumItemRepository courseRepo,
            ProfessorCourseAssignmentRepository assignRepo,
            ClassScheduleRepository scheduleRepo,
            EnrollmentRepository enrollRepo) {
        this.userRepo    = userRepo;
        this.univRepo    = univRepo;
        this.schoolRepo  = schoolRepo;
        this.facultyRepo = facultyRepo;
        this.deptRepo    = deptRepo;
        this.profRepo    = profRepo;
        this.courseRepo  = courseRepo;
        this.assignRepo  = assignRepo;
        this.scheduleRepo = scheduleRepo;
        this.enrollRepo  = enrollRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.existsByUsername("prof_kim")) return; // 이미 시딩됨

        // 목포대학교 찾기
        University mokpo = univRepo.findAll().stream()
                .filter(u -> u.getName().contains("목포"))
                .findFirst().orElse(null);
        if (mokpo == null) return; // DataInitializer 미실행

        String univId = String.valueOf(mokpo.getId());

        // ── 학과 ID 조회 ────────────────────────────────────────────────────
        Long csId  = resolveDeptId(mokpo.getId(), "컴퓨터공학과");
        Long eeId  = resolveDeptId(mokpo.getId(), "전기전자공학과");
        Long itId  = resolveDeptId(mokpo.getId(), "정보통신공학과");
        if (csId == null || eeId == null || itId == null) return;

        // ── 교수 엔티티 조회 ─────────────────────────────────────────────────
        Professor kimPE   = findProf(csId, "김민준");
        Professor leePE   = findProf(csId, "이서준");
        Professor parkPE  = findProf(csId, "박지호");
        Professor choiPE  = findProf(eeId, "최예준");
        Professor jungPE  = findProf(itId, "정시우");

        // ── 교수 로그인 계정 생성 ────────────────────────────────────────────
        createProfUser("prof_kim",  PROF_PW, "김민준", univId, "컴퓨터공학과",  kimPE);
        createProfUser("prof_lee",  PROF_PW, "이서준", univId, "컴퓨터공학과",  leePE);
        createProfUser("prof_park", PROF_PW, "박지호", univId, "컴퓨터공학과",  parkPE);
        createProfUser("prof_choi", PROF_PW, "최예준", univId, "전기전자공학과", choiPE);
        createProfUser("prof_jung", PROF_PW, "정시우", univId, "정보통신공학과", jungPE);

        // ── 학생 계정 생성 ───────────────────────────────────────────────────
        createStudentUser("stu_kim1",  STU_PW, "김학생", univId, "컴퓨터공학과",   1, "20250001");
        createStudentUser("stu_lee2",  STU_PW, "이학생", univId, "컴퓨터공학과",   2, "20240002");
        createStudentUser("stu_park1", STU_PW, "박학생", univId, "전기전자공학과", 1, "20250003");

        // ── 강좌 배정 (ProfessorCourseAssignment) ───────────────────────────
        // 컴퓨터공학과 강좌
        Long csGaelon    = resolveCourse(csId, "컴퓨터공학과 개론");
        Long csBasicLab  = resolveCourse(csId, "전공기초 실습");
        Long csDeepTheo  = resolveCourse(csId, "심화 이론");
        // 전기전자공학과 강좌
        Long eeGaelon    = resolveCourse(eeId, "전기전자공학과 개론");
        // 정보통신공학과 강좌
        Long itGaelon    = resolveCourse(itId, "정보통신공학과 개론");

        assignIfAbsent(kimPE,  csGaelon,   csId);
        assignIfAbsent(leePE,  csBasicLab, csId);
        assignIfAbsent(parkPE, csDeepTheo, csId);
        assignIfAbsent(choiPE, eeGaelon,   eeId);
        assignIfAbsent(jungPE, itGaelon,   itId);

        // ── 수강신청 ─────────────────────────────────────────────────────────
        enrollIfAbsent("stu_kim1",  csGaelon,   csId);
        enrollIfAbsent("stu_kim1",  csBasicLab, csId);
        enrollIfAbsent("stu_lee2",  csDeepTheo, csId);
        enrollIfAbsent("stu_park1", eeGaelon,   eeId);

        // ── 수업 시간표 등록 (교수별 시간표) ──────────────────────────────────
        if (kimPE != null && csGaelon != null) {
            saveSchedule(kimPE.getId(), csGaelon, csId, "월", "09:00", "10:30", "공학관 101호");
            saveSchedule(kimPE.getId(), csGaelon, csId, "수", "09:00", "10:30", "공학관 101호");
        }
        if (leePE != null && csBasicLab != null) {
            saveSchedule(leePE.getId(), csBasicLab, csId, "화", "13:00", "15:00", "실습실 201호");
            saveSchedule(leePE.getId(), csBasicLab, csId, "목", "13:00", "15:00", "실습실 201호");
        }
        if (parkPE != null && csDeepTheo != null) {
            saveSchedule(parkPE.getId(), csDeepTheo, csId, "월", "14:00", "15:30", "공학관 202호");
            saveSchedule(parkPE.getId(), csDeepTheo, csId, "수", "14:00", "15:30", "공학관 202호");
        }
        if (choiPE != null && eeGaelon != null) {
            saveSchedule(choiPE.getId(), eeGaelon, eeId, "화", "09:00", "10:30", "전자관 101호");
            saveSchedule(choiPE.getId(), eeGaelon, eeId, "목", "09:00", "10:30", "전자관 101호");
        }
        if (jungPE != null && itGaelon != null) {
            saveSchedule(jungPE.getId(), itGaelon, itId, "수", "11:00", "12:30", "정보관 301호");
            saveSchedule(jungPE.getId(), itGaelon, itId, "금", "11:00", "12:30", "정보관 301호");
        }
    }

    // ── 헬퍼 ──────────────────────────────────────────────────────────────

    private Long resolveDeptId(Long univId, String deptName) {
        return schoolRepo.findByUniversityId(univId).stream()
                .flatMap(s -> facultyRepo.findBySchoolId(s.getId()).stream())
                .flatMap(f -> deptRepo.findByFacultyId(f.getId()).stream())
                .filter(d -> deptName.equals(d.getName()))
                .map(Department::getId)
                .findFirst().orElse(null);
    }

    private Professor findProf(Long deptId, String name) {
        return profRepo.findByDeptId(deptId).stream()
                .filter(p -> name.equals(p.getName()))
                .findFirst().orElse(null);
    }

    private Long resolveCourse(Long deptId, String courseName) {
        return courseRepo.findByDeptId(deptId).stream()
                .filter(c -> courseName.equals(c.getName()))
                .map(CurriculumItem::getId)
                .findFirst().orElse(null);
    }

    private void createProfUser(String username, String rawPw, String name,
                                 String univId, String dept, Professor profEntity) {
        if (userRepo.existsByUsername(username)) return;
        User u = new User();
        u.setUsername(username);
        u.setPassword(encoder.encode(rawPw));
        u.setName(name);
        u.setMemberType("professor");
        u.setStatus("ACTIVE");
        u.setUniversityId(univId);
        u.setDepartment(dept);
        u.setCreatedDate(LocalDateTime.now());
        if (profEntity != null) u.setProfessorEntityId(profEntity.getId());
        userRepo.save(u);
    }

    private void createStudentUser(String username, String rawPw, String name,
                                    String univId, String dept, int grade, String studentId) {
        if (userRepo.existsByUsername(username)) return;
        User u = new User();
        u.setUsername(username);
        u.setPassword(encoder.encode(rawPw));
        u.setName(name);
        u.setMemberType("student");
        u.setStatus("ACTIVE");
        u.setUniversityId(univId);
        u.setDepartment(dept);
        u.setGrade(grade);
        u.setStudentId(studentId);
        u.setCreatedDate(LocalDateTime.now());
        userRepo.save(u);
    }

    private void assignIfAbsent(Professor prof, Long courseId, Long deptId) {
        if (prof == null || courseId == null) return;
        if (assignRepo.existsByProfessorIdAndCourseId(prof.getId(), courseId)) return;
        ProfessorCourseAssignment a = new ProfessorCourseAssignment();
        a.setProfessorId(prof.getId());
        a.setCourseId(courseId);
        a.setDeptId(deptId);
        assignRepo.save(a);
    }

    private void enrollIfAbsent(String studentUsername, Long courseId, Long deptId) {
        if (courseId == null) return;
        if (enrollRepo.existsByStudentUsernameAndCourseIdAndSemester(studentUsername, courseId, SEMESTER)) return;
        Enrollment e = new Enrollment();
        e.setStudentUsername(studentUsername);
        e.setCourseId(courseId);
        e.setDeptId(deptId);
        e.setSemester(SEMESTER);
        e.setEnrolledAt(LocalDateTime.now());
        enrollRepo.save(e);
    }

    private void saveSchedule(Long profId, Long courseId, Long deptId,
                               String day, String start, String end, String room) {
        ClassSchedule cs = new ClassSchedule();
        cs.setProfessorId(profId);
        cs.setCourseId(courseId);
        cs.setDeptId(deptId);
        cs.setDayOfWeek(day);
        cs.setStartTime(start);
        cs.setEndTime(end);
        cs.setRoom(room);
        cs.setSemester(SEMESTER);
        cs.setCreatedAt(LocalDateTime.now());
        cs.setUpdatedAt(LocalDateTime.now());
        scheduleRepo.save(cs);
    }
}
