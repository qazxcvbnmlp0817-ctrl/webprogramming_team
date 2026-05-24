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
}
