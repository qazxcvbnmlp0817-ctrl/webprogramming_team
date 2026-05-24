package com.example.demo.service;

import com.example.demo.dto.SchoolTreeDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SchoolCrudService {

    private final UniversityRepository universityRepo;
    private final CollegeSchoolRepository collegeSchoolRepo;
    private final FacultyGroupRepository facultyGroupRepo;
    private final DepartmentRepository deptRepo;
    private final ProfessorRepository professorRepo;
    private final CurriculumItemRepository curriculumItemRepo;
    private final ProfessorCourseAssignmentRepository assignmentRepo;
    private final ClassScheduleRepository classScheduleRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final NoticeRepository noticeRepo;
    private final PostRepository postRepo;
    private final ScheduleRepository scheduleRepo;
    private final UserRepository userRepo;

    public SchoolCrudService(UniversityRepository universityRepo,
                              CollegeSchoolRepository collegeSchoolRepo,
                              FacultyGroupRepository facultyGroupRepo,
                              DepartmentRepository deptRepo,
                              ProfessorRepository professorRepo,
                              CurriculumItemRepository curriculumItemRepo,
                              ProfessorCourseAssignmentRepository assignmentRepo,
                              ClassScheduleRepository classScheduleRepo,
                              EnrollmentRepository enrollmentRepo,
                              NoticeRepository noticeRepo,
                              PostRepository postRepo,
                              ScheduleRepository scheduleRepo,
                              UserRepository userRepo) {
        this.universityRepo     = universityRepo;
        this.collegeSchoolRepo  = collegeSchoolRepo;
        this.facultyGroupRepo   = facultyGroupRepo;
        this.deptRepo           = deptRepo;
        this.professorRepo      = professorRepo;
        this.curriculumItemRepo = curriculumItemRepo;
        this.assignmentRepo     = assignmentRepo;
        this.classScheduleRepo  = classScheduleRepo;
        this.enrollmentRepo     = enrollmentRepo;
        this.noticeRepo         = noticeRepo;
        this.postRepo           = postRepo;
        this.scheduleRepo       = scheduleRepo;
        this.userRepo           = userRepo;
    }

    // ── GET TREE ─────────────────────────────────────────────────────────────

    public SchoolTreeDto getTree(Long univId) {
        University univ = universityRepo.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교를 찾을 수 없습니다"));

        SchoolTreeDto dto = new SchoolTreeDto();
        dto.setName(univ.getName());
        dto.setDescription(univ.getDescription() != null ? univ.getDescription() : "");

        List<SchoolTreeDto.CollegeDto> collegeDtos = new ArrayList<>();
        for (CollegeSchool college : collegeSchoolRepo.findByUniversityId(univId)) {
            SchoolTreeDto.CollegeDto cd = new SchoolTreeDto.CollegeDto();
            cd.setId(college.getId());
            cd.setName(college.getName());
            cd.setDescription(college.getDescription() != null ? college.getDescription() : "");

            List<SchoolTreeDto.FacultyDto> facultyDtos = new ArrayList<>();
            for (FacultyGroup faculty : facultyGroupRepo.findBySchoolId(college.getId())) {
                SchoolTreeDto.FacultyDto fd = new SchoolTreeDto.FacultyDto();
                fd.setId(faculty.getId());
                fd.setName(faculty.getName());

                List<SchoolTreeDto.DeptDto> deptDtos = new ArrayList<>();
                for (Department dept : deptRepo.findByFacultyId(faculty.getId())) {
                    SchoolTreeDto.DeptDto dd = new SchoolTreeDto.DeptDto();
                    dd.setId(dept.getId());
                    dd.setName(dept.getName());
                    dd.setDescription(dept.getDescription() != null ? dept.getDescription() : "");
                    dd.setPhone(dept.getPhone() != null ? dept.getPhone() : "");
                    dd.setEmail(dept.getEmail() != null ? dept.getEmail() : "");
                    deptDtos.add(dd);
                }
                fd.setDepartments(deptDtos);
                facultyDtos.add(fd);
            }
            cd.setFaculties(facultyDtos);
            collegeDtos.add(cd);
        }
        dto.setColleges(collegeDtos);
        return dto;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Transactional
    public Long createSchool(SchoolTreeDto req) {
        if (req.getName() == null || req.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "학교 이름은 필수입니다");

        University univ = new University();
        univ.setName(req.getName().trim());
        univ.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        univ = universityRepo.save(univ);

        if (req.getColleges() != null) {
            for (SchoolTreeDto.CollegeDto cd : req.getColleges()) {
                CollegeSchool college = new CollegeSchool();
                college.setName(cd.getName().trim());
                college.setDescription(cd.getDescription() != null ? cd.getDescription().trim() : "");
                college.setUniversityId(univ.getId());
                college = collegeSchoolRepo.save(college);

                if (cd.getFaculties() != null) {
                    for (SchoolTreeDto.FacultyDto fd : cd.getFaculties()) {
                        FacultyGroup faculty = new FacultyGroup();
                        faculty.setName(fd.getName().trim());
                        faculty.setSchoolId(college.getId());
                        faculty = facultyGroupRepo.save(faculty);

                        if (fd.getDepartments() != null) {
                            for (SchoolTreeDto.DeptDto dd : fd.getDepartments()) {
                                Department dept = new Department();
                                dept.setName(dd.getName().trim());
                                dept.setDescription(dd.getDescription() != null ? dd.getDescription().trim() : "");
                                dept.setPhone(dd.getPhone() != null ? dd.getPhone().trim() : "");
                                dept.setEmail(dd.getEmail() != null ? dd.getEmail().trim() : "");
                                dept.setFacultyId(faculty.getId());
                                deptRepo.save(dept);
                            }
                        }
                    }
                }
            }
        }
        return univ.getId();
    }

    // ── UPDATE (MERGE) ────────────────────────────────────────────────────────

    @Transactional
    public void updateSchool(Long univId, SchoolTreeDto req) {
        University univ = universityRepo.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교를 찾을 수 없습니다"));
        if (req.getName() == null || req.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "학교 이름은 필수입니다");

        univ.setName(req.getName().trim());
        univ.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        universityRepo.save(univ);

        List<SchoolTreeDto.CollegeDto> reqColleges =
                req.getColleges() != null ? req.getColleges() : List.of();
        Set<Long> keepCollegeIds = reqColleges.stream()
                .filter(c -> c.getId() != null)
                .map(SchoolTreeDto.CollegeDto::getId)
                .collect(Collectors.toSet());

        for (CollegeSchool existing : collegeSchoolRepo.findByUniversityId(univId)) {
            if (!keepCollegeIds.contains(existing.getId())) {
                deleteCollegeCascade(existing.getId());
            }
        }

        for (SchoolTreeDto.CollegeDto cd : reqColleges) {
            CollegeSchool college;
            if (cd.getId() == null) {
                college = new CollegeSchool();
                college.setUniversityId(univId);
            } else {
                college = collegeSchoolRepo.findById(cd.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "단과대학 없음"));
            }
            college.setName(cd.getName().trim());
            college.setDescription(cd.getDescription() != null ? cd.getDescription().trim() : "");
            college = collegeSchoolRepo.save(college);

            mergeFaculties(college.getId(), cd.getFaculties() != null ? cd.getFaculties() : List.of());
        }
    }

    private void mergeFaculties(Long collegeId, List<SchoolTreeDto.FacultyDto> reqFaculties) {
        Set<Long> keepIds = reqFaculties.stream()
                .filter(f -> f.getId() != null)
                .map(SchoolTreeDto.FacultyDto::getId)
                .collect(Collectors.toSet());

        for (FacultyGroup existing : facultyGroupRepo.findBySchoolId(collegeId)) {
            if (!keepIds.contains(existing.getId())) {
                deleteFacultyCascade(existing.getId());
            }
        }

        for (SchoolTreeDto.FacultyDto fd : reqFaculties) {
            FacultyGroup faculty;
            if (fd.getId() == null) {
                faculty = new FacultyGroup();
                faculty.setSchoolId(collegeId);
            } else {
                faculty = facultyGroupRepo.findById(fd.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학부 없음"));
            }
            faculty.setName(fd.getName().trim());
            faculty = facultyGroupRepo.save(faculty);

            mergeDepts(faculty.getId(), fd.getDepartments() != null ? fd.getDepartments() : List.of());
        }
    }

    private void mergeDepts(Long facultyId, List<SchoolTreeDto.DeptDto> reqDepts) {
        Set<Long> keepIds = reqDepts.stream()
                .filter(d -> d.getId() != null)
                .map(SchoolTreeDto.DeptDto::getId)
                .collect(Collectors.toSet());

        for (Department existing : deptRepo.findByFacultyId(facultyId)) {
            if (!keepIds.contains(existing.getId())) {
                deleteDeptCascade(existing.getId());
            }
        }

        for (SchoolTreeDto.DeptDto dd : reqDepts) {
            Department dept;
            if (dd.getId() == null) {
                dept = new Department();
                dept.setFacultyId(facultyId);
            } else {
                dept = deptRepo.findById(dd.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학과 없음"));
            }
            dept.setName(dd.getName().trim());
            dept.setDescription(dd.getDescription() != null ? dd.getDescription().trim() : "");
            dept.setPhone(dd.getPhone() != null ? dd.getPhone().trim() : "");
            dept.setEmail(dd.getEmail() != null ? dd.getEmail().trim() : "");
            deptRepo.save(dept);
        }
    }

    // ── DELETE (CASCADE) ──────────────────────────────────────────────────────

    @Transactional
    public void deleteSchool(Long univId) {
        universityRepo.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교를 찾을 수 없습니다"));

        for (CollegeSchool college : collegeSchoolRepo.findByUniversityId(univId)) {
            deleteCollegeCascade(college.getId());
        }

        // universityId null화 (계정 삭제 아님, 소속만 해제)
        String univIdStr = String.valueOf(univId);
        for (User user : userRepo.findByUniversityId(univIdStr)) {
            user.setUniversityId(null);
            userRepo.save(user);
        }

        universityRepo.deleteById(univId);
    }

    private void deleteCollegeCascade(Long collegeId) {
        for (FacultyGroup faculty : facultyGroupRepo.findBySchoolId(collegeId)) {
            deleteFacultyCascade(faculty.getId());
        }
        // "univ" 스코프 콘텐츠 삭제 (scopeType="univ", scopeId=CollegeSchool.id)
        noticeRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("univ", collegeId)
                .forEach(n -> noticeRepo.deleteById(n.getId()));
        postRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("univ", collegeId)
                .forEach(p -> postRepo.deleteById(p.getId()));
        scheduleRepo.findByScopeTypeAndScopeIdOrderByEventDateAsc("univ", collegeId)
                .forEach(s -> scheduleRepo.deleteById(s.getId()));
        collegeSchoolRepo.deleteById(collegeId);
    }

    private void deleteFacultyCascade(Long facultyId) {
        for (Department dept : deptRepo.findByFacultyId(facultyId)) {
            deleteDeptCascade(dept.getId());
        }
        // "faculty" 스코프 콘텐츠 삭제
        noticeRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("faculty", facultyId)
                .forEach(n -> noticeRepo.deleteById(n.getId()));
        postRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("faculty", facultyId)
                .forEach(p -> postRepo.deleteById(p.getId()));
        scheduleRepo.findByScopeTypeAndScopeIdOrderByEventDateAsc("faculty", facultyId)
                .forEach(s -> scheduleRepo.deleteById(s.getId()));
        facultyGroupRepo.deleteById(facultyId);
    }

    private void deleteDeptCascade(Long deptId) {
        // 삭제 순서: ClassSchedule → Enrollment → Assignment → CurriculumItem → Professor
        classScheduleRepo.findByDeptId(deptId).forEach(cs -> classScheduleRepo.deleteById(cs.getId()));
        enrollmentRepo.findByDeptId(deptId).forEach(e -> enrollmentRepo.deleteById(e.getId()));
        assignmentRepo.findByDeptId(deptId).forEach(a -> assignmentRepo.deleteById(a.getId()));
        curriculumItemRepo.findByDeptId(deptId).forEach(ci -> curriculumItemRepo.deleteById(ci.getId()));
        professorRepo.findByDeptId(deptId).forEach(pr -> professorRepo.deleteById(pr.getId()));
        // "dept" 스코프 콘텐츠 삭제
        noticeRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("dept", deptId)
                .forEach(n -> noticeRepo.deleteById(n.getId()));
        postRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("dept", deptId)
                .forEach(p -> postRepo.deleteById(p.getId()));
        scheduleRepo.findByScopeTypeAndScopeIdOrderByEventDateAsc("dept", deptId)
                .forEach(s -> scheduleRepo.deleteById(s.getId()));
        deptRepo.deleteById(deptId);
    }
}
