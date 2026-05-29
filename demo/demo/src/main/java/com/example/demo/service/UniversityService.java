package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UniversityService {

    private final UniversityRepository universityRepo;
    private final CollegeSchoolRepository schoolRepo;
    private final FacultyGroupRepository facultyRepo;
    private final DepartmentRepository deptRepo;
    private final ProfessorRepository professorRepo;
    private final CurriculumItemRepository curriculumRepo;
    private final DeptPageContentRepository contentRepo;
    private final DeptContentService deptContentService;

    public UniversityService(UniversityRepository universityRepo,
                             CollegeSchoolRepository schoolRepo,
                             FacultyGroupRepository facultyRepo,
                             DepartmentRepository deptRepo,
                             ProfessorRepository professorRepo,
                             CurriculumItemRepository curriculumRepo,
                             DeptPageContentRepository contentRepo,
                             DeptContentService deptContentService) {
        this.universityRepo = universityRepo;
        this.schoolRepo     = schoolRepo;
        this.facultyRepo    = facultyRepo;
        this.deptRepo       = deptRepo;
        this.professorRepo  = professorRepo;
        this.curriculumRepo = curriculumRepo;
        this.contentRepo    = contentRepo;
        this.deptContentService = deptContentService;
    }

    public List<UniversityDto> getAllUniversities() {
        return universityRepo.findAll().stream()
                .map(this::toUniversityDto)
                .collect(Collectors.toList());
    }

    public Optional<UniversityDto> findById(Long id) {
        return universityRepo.findById(id).map(this::toUniversityDto);
    }

    public Optional<DepartmentDetailDto> getDepartmentDetail(Long deptId) {
        return deptRepo.findById(deptId).map(dept -> {
            List<ProfessorDto> professors = professorRepo.findByDeptId(deptId).stream()
                    .map(p -> new ProfessorDto(p.getId(), p.getName(), p.getSpecialty(), p.getEmail()))
                    .collect(Collectors.toList());
            List<CurriculumItemDto> curriculum = curriculumRepo.findByDeptId(deptId).stream()
                    .map(c -> new CurriculumItemDto(
                            c.getName(), c.getYear(), c.getSemester(), c.getCategory(),
                            c.isRequired(), c.getCredits()))
                    .collect(Collectors.toList());
            DeptPageContent pageContentEntity = contentRepo.findById(deptId).orElse(null);
            DeptPageContentDto pageContent = deptContentService.buildDto(dept, pageContentEntity);
            return new DepartmentDetailDto(
                    dept.getId(), dept.getName(), dept.getDescription(),
                    professors, curriculum,
                    dept.getAddress(), dept.getPhone(), dept.getEmail(), dept.getHours(),
                    pageContent
            );
        });
    }

    public String findDeptName(Long deptId) {
        return deptRepo.findById(deptId).map(Department::getName).orElse("학과");
    }

    public String findFacultyName(Long facultyId) {
        return facultyRepo.findById(facultyId).map(FacultyGroup::getName).orElse("학부");
    }

    // ── private ──────────────────────────────────────────────────────────────

    private UniversityDto toUniversityDto(University u) {
        List<SchoolDto> schools = schoolRepo.findByUniversityIdOrderByIdAsc(u.getId()).stream()
                .map(this::toSchoolDto)
                .collect(Collectors.toList());
        return new UniversityDto(u.getId(), u.getName(), u.getDescription(), schools);
    }

    private SchoolDto toSchoolDto(CollegeSchool s) {
        List<FacultyDto> faculties = facultyRepo.findBySchoolIdOrderByIdAsc(s.getId()).stream()
                .map(this::toFacultyDto)
                .collect(Collectors.toList());
        return new SchoolDto(s.getId(), s.getName(), s.getDescription(), faculties);
    }

    private FacultyDto toFacultyDto(FacultyGroup f) {
        List<DeptSelectionDto> depts = deptRepo.findByFacultyIdOrderByIdAsc(f.getId()).stream()
                .map(d -> new DeptSelectionDto(d.getId(), d.getName(), f.getId()))
                .collect(Collectors.toList());
        return new FacultyDto(f.getId(), f.getName(), f.getSchoolId(), depts);
    }
}
