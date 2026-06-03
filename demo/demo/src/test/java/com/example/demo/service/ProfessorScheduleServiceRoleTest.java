package com.example.demo.service;

import com.example.demo.dto.ClassScheduleRequestDto;
import com.example.demo.entity.ClassSchedule;
import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.Department;
import com.example.demo.entity.Enrollment;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.entity.LectureOffering;
import com.example.demo.entity.Professor;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProfessorScheduleServiceRoleTest {

    @Mock UserRepository userRepository;
    @Mock ProfessorRepository professorRepository;
    @Mock ProfessorCourseAssignmentRepository assignmentRepository;
    @Mock CurriculumItemRepository curriculumItemRepository;
    @Mock ClassScheduleRepository classScheduleRepository;
    @Mock EnrollmentRepository enrollmentRepository;
    @Mock StudentTimetableEntryRepository timetableEntryRepository;
    @Mock LectureOfferingRepository lectureOfferingRepository;
    @Mock DepartmentRepository departmentRepository;
    @Mock FacultyGroupRepository facultyGroupRepository;
    @Mock CollegeSchoolRepository collegeSchoolRepository;

    @InjectMocks ProfessorScheduleService service;

    @Test
    void professor_cannot_create_schedule_for_unassigned_course() {
        User user = user("prof_kim", "professor", null, 10L, "1", "Computer");
        Professor professor = professor(10L, 1L);
        when(userRepository.findByUsername("prof_kim")).thenReturn(Optional.of(user));
        when(professorRepository.findById(10L)).thenReturn(Optional.of(professor));
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 100L)).thenReturn(false);

        assertForbidden(() -> service.createSchedule("prof_kim", request(100L, null, null)));
    }

    @Test
    void professor_cannot_update_other_professors_schedule() {
        User user = user("prof_kim", "professor", null, 10L, "1", "Computer");
        when(userRepository.findByUsername("prof_kim")).thenReturn(Optional.of(user));
        when(professorRepository.findById(10L)).thenReturn(Optional.of(professor(10L, 1L)));
        when(classScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule(1L, 99L, 1L, 100L)));
        when(assignmentRepository.existsByProfessorIdAndCourseId(99L, 100L)).thenReturn(true);

        assertForbidden(() -> service.updateSchedule("prof_kim", 1L, request(100L, null, null)));
    }

    @Test
    void professor_cannot_delete_other_professors_schedule() {
        User user = user("prof_kim", "professor", null, 10L, "1", "Computer");
        when(userRepository.findByUsername("prof_kim")).thenReturn(Optional.of(user));
        when(professorRepository.findById(10L)).thenReturn(Optional.of(professor(10L, 1L)));
        when(classScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule(1L, 99L, 1L, 100L)));
        when(assignmentRepository.existsByProfessorIdAndCourseId(99L, 100L)).thenReturn(true);

        assertForbidden(() -> service.deleteSchedule("prof_kim", 1L));
    }

    @Test
    void dept_admin_cannot_create_schedule_outside_own_department() {
        User user = user("dept_admin", "professor", "DEPT_ADMIN", 10L, "1", "Computer");
        when(userRepository.findByUsername("dept_admin")).thenReturn(Optional.of(user));
        mockUniversityDepartments(1L, List.of(department(1L, "Computer")));

        assertForbidden(() -> service.createAdminSchedule("dept_admin", request(100L, 10L, 2L)));
    }

    @Test
    void school_admin_cannot_update_schedule_outside_own_university() {
        User user = user("school_admin", "admin", "SCHOOL_ADMIN", null, "1", null);
        when(userRepository.findByUsername("school_admin")).thenReturn(Optional.of(user));
        when(classScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule(1L, 99L, 2L, 100L)));
        when(assignmentRepository.existsByProfessorIdAndCourseId(99L, 100L)).thenReturn(true);
        mockUniversityDepartments(1L, List.of(department(1L, "Computer")));

        assertForbidden(() -> service.updateAdminSchedule("school_admin", 1L, request(100L, 99L, 2L)));
    }

    @Test
    void professor_schedule_api_links_profile_by_exact_name_and_department_when_missing() {
        User user = user("choi", "professor", null, null, "1", "Computer");
        user.setName("Choi");
        Professor professor = professor(10L, 1L);
        professor.setName("Choi");
        when(userRepository.findByUsername("choi")).thenReturn(Optional.of(user));
        mockUniversityDepartments(1L, List.of(department(1L, "Computer")));
        when(professorRepository.findByNameAndDeptId("Choi", 1L)).thenReturn(Optional.of(professor));
        when(assignmentRepository.findByProfessorId(10L)).thenReturn(List.of());

        var result = service.getProfessorAssignments("choi");

        assertThat(result).isEmpty();
        assertThat(user.getProfessorEntityId()).isEqualTo(10L);
        verify(userRepository).save(user);
    }

    @Test
    void professor_update_rejects_time_that_conflicts_with_enrolled_student_timetable() {
        User user = user("prof_kim", "professor", null, 10L, "1", "Computer");
        ClassSchedule existing = schedule(1L, 10L, 1L, 100L);
        ClassSchedule otherCourseSchedule = schedule(2L, 99L, 1L, 200L);
        otherCourseSchedule.setStartTime("09:30");
        otherCourseSchedule.setEndTime("10:30");
        when(userRepository.findByUsername("prof_kim")).thenReturn(Optional.of(user));
        when(professorRepository.findById(10L)).thenReturn(Optional.of(professor(10L, 1L)));
        when(classScheduleRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 100L)).thenReturn(true);
        when(classScheduleRepository.findByProfessorIdAndSemesterAndDayOfWeek(10L, "2026-1", "MON")).thenReturn(List.of(existing));
        when(enrollmentRepository.findByCourseIdAndSemester(100L, "2026-1")).thenReturn(List.of(enrollment("stu", 100L, 1L)));
        when(enrollmentRepository.findByStudentUsernameAndSemester("stu", "2026-1"))
                .thenReturn(List.of(enrollment("stu", 100L, 1L), enrollment("stu", 200L, 1L)));
        when(classScheduleRepository.findByCourseIdInAndSemester(List.of(200L), "2026-1")).thenReturn(List.of(otherCourseSchedule));

        assertStatus(HttpStatus.CONFLICT, () -> service.updateSchedule("prof_kim", 1L, request(100L, null, null)));
    }

    @Test
    void student_enrollment_rejects_course_that_conflicts_with_existing_timetable() {
        User student = user("stu", "student", null, null, "1", "Computer");
        ClassSchedule targetSchedule = schedule(1L, 10L, 1L, 100L);
        ClassSchedule otherSchedule = schedule(2L, 99L, 1L, 200L);
        otherSchedule.setStartTime("09:30");
        otherSchedule.setEndTime("10:30");
        when(userRepository.findByUsername("stu")).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByStudentUsernameAndCourseIdAndSemester("stu", 100L, "2026-1")).thenReturn(false);
        when(curriculumItemRepository.findById(100L)).thenReturn(Optional.of(course(100L, 1L)));
        when(classScheduleRepository.findByCourseIdInAndSemester(List.of(100L), "2026-1")).thenReturn(List.of(targetSchedule));
        when(enrollmentRepository.findByStudentUsernameAndSemester("stu", "2026-1")).thenReturn(List.of(enrollment("stu", 200L, 1L)));
        when(classScheduleRepository.findByCourseIdInAndSemester(List.of(200L), "2026-1")).thenReturn(List.of(otherSchedule));

        assertStatus(HttpStatus.CONFLICT, () -> service.enroll("stu", 100L, "2026-1"));
    }

    @Test
    void student_class_schedule_query_includes_saved_timetable_entries() {
        User student = user("stu", "student", null, null, "1", "Computer");
        Professor professor = professor(10L, 1L);
        professor.setName("Lee");
        CurriculumItem course = course(100L, 1L);
        course.setName("Project Lab");
        ClassSchedule schedule = schedule(1L, 10L, 1L, 100L);
        when(userRepository.findByUsername("stu")).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudentUsernameAndSemester("stu", "2026-1")).thenReturn(List.of());
        when(timetableEntryRepository.findByStudentUsernameAndSemester("stu", "2026-1"))
                .thenReturn(List.of(timetableEntry("stu", 77L)));
        when(lectureOfferingRepository.findById(77L))
                .thenReturn(Optional.of(offering(77L, "Project Lab", "Lee")));
        when(professorRepository.findByName("Lee")).thenReturn(List.of(professor));
        when(curriculumItemRepository.findByDeptId(1L)).thenReturn(List.of(course));
        when(classScheduleRepository.findByCourseIdInAndSemester(List.of(100L), "2026-1")).thenReturn(List.of(schedule));
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 100L)).thenReturn(true);
        when(curriculumItemRepository.findAllById(any())).thenReturn(List.of(course));
        when(professorRepository.findAllById(any())).thenReturn(List.of(professor));

        var result = service.getStudentSchedules("stu", "2026-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseId()).isEqualTo(100L);
    }

    @Test
    void professor_schedule_query_excludes_unassigned_schedules() {
        User user = user("prof_kim", "professor", null, 10L, "1", "Computer");
        ClassSchedule assigned = schedule(1L, 10L, 1L, 100L);
        ClassSchedule orphan = schedule(2L, 10L, 1L, 200L);
        when(userRepository.findByUsername("prof_kim")).thenReturn(Optional.of(user));
        when(professorRepository.findById(10L)).thenReturn(Optional.of(professor(10L, 1L)));
        when(classScheduleRepository.findByProfessorIdAndSemester(10L, "2026-1")).thenReturn(List.of(assigned, orphan));
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 100L)).thenReturn(true);
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 200L)).thenReturn(false);
        when(curriculumItemRepository.findAllById(any())).thenReturn(List.of(course(100L, 1L)));
        when(professorRepository.findAllById(any())).thenReturn(List.of(professor(10L, 1L)));

        var result = service.getMySchedulesBySemester("prof_kim", "2026-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseId()).isEqualTo(100L);
    }

    @Test
    void admin_schedule_query_excludes_unassigned_schedules() {
        User user = user("super", "admin", "SUPER_ADMIN", null, "1", null);
        ClassSchedule assigned = schedule(1L, 10L, 1L, 100L);
        ClassSchedule orphan = schedule(2L, 10L, 1L, 200L);
        when(userRepository.findByUsername("super")).thenReturn(Optional.of(user));
        when(classScheduleRepository.findBySemester("2026-1")).thenReturn(List.of(assigned, orphan));
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 100L)).thenReturn(true);
        when(assignmentRepository.existsByProfessorIdAndCourseId(10L, 200L)).thenReturn(false);
        when(curriculumItemRepository.findAllById(any())).thenReturn(List.of(course(100L, 1L)));
        when(professorRepository.findAllById(any())).thenReturn(List.of(professor(10L, 1L)));

        var result = service.getAdminSchedules("super", null, "2026-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseId()).isEqualTo(100L);
    }

    private void assertForbidden(ThrowingCall call) {
        assertStatus(HttpStatus.FORBIDDEN, call);
    }

    private void assertStatus(HttpStatus status, ThrowingCall call) {
        assertThatThrownBy(call::run)
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(status);
    }

    private ClassScheduleRequestDto request(Long courseId, Long professorId, Long deptId) {
        ClassScheduleRequestDto req = new ClassScheduleRequestDto();
        req.setCourseId(courseId);
        req.setProfessorId(professorId);
        req.setDeptId(deptId);
        req.setDayOfWeek("MON");
        req.setStartTime("09:00");
        req.setEndTime("10:15");
        req.setSemester("2026-1");
        req.setRoom("Room 101");
        return req;
    }

    private User user(String username, String memberType, String adminRole,
                      Long professorEntityId, String universityId, String department) {
        User user = new User();
        user.setUsername(username);
        user.setMemberType(memberType);
        user.setAdminRole(adminRole);
        user.setProfessorEntityId(professorEntityId);
        user.setUniversityId(universityId);
        user.setDepartment(department);
        return user;
    }

    private Professor professor(Long id, Long deptId) {
        Professor professor = new Professor();
        professor.setId(id);
        professor.setName("Professor " + id);
        professor.setDeptId(deptId);
        return professor;
    }

    private ClassSchedule schedule(Long id, Long professorId, Long deptId, Long courseId) {
        ClassSchedule schedule = new ClassSchedule();
        schedule.setId(id);
        schedule.setProfessorId(professorId);
        schedule.setDeptId(deptId);
        schedule.setCourseId(courseId);
        schedule.setDayOfWeek("MON");
        schedule.setStartTime("09:00");
        schedule.setEndTime("10:15");
        schedule.setSemester("2026-1");
        return schedule;
    }

    private CurriculumItem course(Long id, Long deptId) {
        CurriculumItem course = new CurriculumItem();
        course.setId(id);
        course.setName("Course " + id);
        course.setDeptId(deptId);
        return course;
    }

    private Enrollment enrollment(String studentUsername, Long courseId, Long deptId) {
        Enrollment enrollment = new Enrollment();
        enrollment.setStudentUsername(studentUsername);
        enrollment.setCourseId(courseId);
        enrollment.setDeptId(deptId);
        enrollment.setSemester("2026-1");
        return enrollment;
    }

    private StudentTimetableEntry timetableEntry(String studentUsername, Long offeringId) {
        StudentTimetableEntry entry = new StudentTimetableEntry();
        entry.setStudentUsername(studentUsername);
        entry.setOfferingId(offeringId);
        entry.setSemester("2026-1");
        return entry;
    }

    private LectureOffering offering(Long id, String courseName, String professorName) {
        LectureOffering offering = new LectureOffering();
        offering.setId(id);
        offering.setSemester("2026-1");
        offering.setDepartmentName("Computer");
        offering.setCourseCode("CSE001");
        offering.setCourseName(courseName);
        offering.setSection("00");
        offering.setProfessorName(professorName);
        offering.setLectureTime("월1,2");
        return offering;
    }

    private Department department(Long id, String name) {
        Department department = new Department();
        department.setId(id);
        department.setName(name);
        department.setFacultyId(20L);
        return department;
    }

    private void mockUniversityDepartments(Long universityId, List<Department> departments) {
        CollegeSchool school = new CollegeSchool();
        school.setId(10L);
        school.setName("Engineering");
        school.setUniversityId(universityId);

        FacultyGroup faculty = new FacultyGroup();
        faculty.setId(20L);
        faculty.setName("Software");
        faculty.setSchoolId(10L);

        when(collegeSchoolRepository.findByUniversityId(universityId)).thenReturn(List.of(school));
        when(facultyGroupRepository.findBySchoolId(10L)).thenReturn(List.of(faculty));
        when(departmentRepository.findByFacultyId(20L)).thenReturn(departments);
    }

    private interface ThrowingCall {
        void run();
    }
}
