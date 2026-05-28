# School CRUD — Super Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** SuperAdminPage에 "학교 관리" 탭을 추가해 SUPER_ADMIN이 학교·단과대학·학부·학과 전체 계층을 생성·수정·삭제할 수 있도록 한다.

**Architecture:** 프론트엔드에서 중첩 JSON Draft state를 로컬 편집 후 최종 버튼 클릭 시 단일 API 호출로 전체 트리를 저장(all-or-nothing). 백엔드는 `@Transactional` 단일 트랜잭션으로 University → CollegeSchool → FacultyGroup → Department 순서로 저장/수정/삭제한다. Update는 "요청에 없는 기존 id = cascade 삭제" Merge 전략을 사용한다.

**Tech Stack:** Spring Boot 4 / JPA / Oracle 23ai Free, React 18 + TypeScript, Tailwind CSS

---

## 파일 구조

### 신규 생성
| 파일 | 역할 |
|------|------|
| `demo/.../dto/SchoolTreeDto.java` | 요청/응답 중첩 DTO (College, Faculty, Dept 내부 클래스 포함) |
| `demo/.../service/SchoolCrudService.java` | getTree / createSchool / updateSchool / deleteSchool 트랜잭션 로직 |
| `frontend/src/types/schoolDraft.ts` | TypeScript 중첩 타입 + emptyDraft 상수 |
| `frontend/src/utils/schoolDraftHelpers.ts` | 불변 중첩 state 업데이트 순수 함수 |
| `frontend/src/pages/admin/SchoolTreeEditor.tsx` | 계층 트리 편집 UI 컴포넌트 |
| `frontend/src/pages/admin/SchoolManagementTab.tsx` | list/create/edit 뷰 관리 + API 연동 |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `demo/.../repository/ClassScheduleRepository.java` | `findByDeptId(Long)` 추가 |
| `demo/.../repository/EnrollmentRepository.java` | `findByDeptId(Long)` 추가 |
| `demo/.../controller/SuperAdminController.java` | SchoolCrudService 주입 + 4개 엔드포인트 추가 |
| `frontend/src/api/adminSuper.ts` | fetchSchoolTree / createSchool / updateSchool / deleteSchool 추가 |
| `frontend/src/pages/admin/SuperAdminPage.tsx` | 탭 구조 도입 + SchoolManagementTab 렌더 |

---

## Task 1: Backend — SchoolTreeDto

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/dto/SchoolTreeDto.java`

`FacultyGroup` 엔티티에는 `description` 필드가 없으므로 `FacultyDto`에도 넣지 않는다.

- [x] **Step 1: SchoolTreeDto 파일 생성**

```java
package com.example.demo.dto;

import java.util.List;

public class SchoolTreeDto {

    private String name;
    private String description;
    private List<CollegeDto> colleges;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<CollegeDto> getColleges() { return colleges; }
    public void setColleges(List<CollegeDto> colleges) { this.colleges = colleges; }

    public static class CollegeDto {
        private Long id;
        private String name;
        private String description;
        private List<FacultyDto> faculties;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<FacultyDto> getFaculties() { return faculties; }
        public void setFaculties(List<FacultyDto> faculties) { this.faculties = faculties; }
    }

    public static class FacultyDto {
        private Long id;
        private String name;
        private List<DeptDto> departments;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<DeptDto> getDepartments() { return departments; }
        public void setDepartments(List<DeptDto> departments) { this.departments = departments; }
    }

    public static class DeptDto {
        private Long id;
        private String name;
        private String description;
        private String phone;
        private String email;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
```

- [x] **Step 2: 컴파일 확인**

```powershell
cd demo/demo
./mvnw clean compile -q
```

Expected: `BUILD SUCCESS`

- [x] **Step 3: 커밋**

```powershell
git add demo/demo/src/main/java/com/example/demo/dto/SchoolTreeDto.java
git commit -m "feat: add SchoolTreeDto for school CRUD hierarchy"
```

---

## Task 2: Backend — Repository 메서드 추가

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/repository/ClassScheduleRepository.java`
- Modify: `demo/demo/src/main/java/com/example/demo/repository/EnrollmentRepository.java`

cascade 삭제 시 학과(deptId) 기준으로 수업 시간표와 수강신청 전체를 조회해야 한다. 기존 `findByDeptIdAndSemester`는 학기 필터가 있어 cascade 삭제에 사용할 수 없으므로 새 메서드를 추가한다.

- [x] **Step 1: ClassScheduleRepository에 `findByDeptId` 추가**

`demo/demo/src/main/java/com/example/demo/repository/ClassScheduleRepository.java` 파일을 열어 아래 한 줄을 기존 메서드 목록 마지막에 추가:

```java
    List<ClassSchedule> findByDeptId(Long deptId);
```

완성된 파일:

```java
package com.example.demo.repository;

import com.example.demo.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {

    List<ClassSchedule> findByProfessorId(Long professorId);

    List<ClassSchedule> findByProfessorIdAndSemester(Long professorId, String semester);

    List<ClassSchedule> findByCourseIdInAndSemester(List<Long> courseIds, String semester);

    List<ClassSchedule> findByDeptIdAndSemester(Long deptId, String semester);

    List<ClassSchedule> findByDeptId(Long deptId);
}
```

- [x] **Step 2: EnrollmentRepository에 `findByDeptId` 추가**

`demo/demo/src/main/java/com/example/demo/repository/EnrollmentRepository.java` 파일 마지막 메서드 뒤에 추가:

```java
    List<Enrollment> findByDeptId(Long deptId);
```

완성된 파일:

```java
package com.example.demo.repository;

import com.example.demo.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudentUsernameAndSemester(String studentUsername, String semester);

    List<Enrollment> findByStudentUsername(String studentUsername);

    List<Enrollment> findByCourseIdAndSemester(Long courseId, String semester);

    boolean existsByStudentUsernameAndCourseIdAndSemester(String studentUsername, Long courseId, String semester);

    long countByStudentUsernameAndSemester(String studentUsername, String semester);

    List<Enrollment> findByDeptId(Long deptId);
}
```

- [x] **Step 3: 컴파일 확인**

```powershell
cd demo/demo
./mvnw clean compile -q
```

Expected: `BUILD SUCCESS`

- [x] **Step 4: 커밋**

```powershell
git add demo/demo/src/main/java/com/example/demo/repository/ClassScheduleRepository.java
git add demo/demo/src/main/java/com/example/demo/repository/EnrollmentRepository.java
git commit -m "feat: add findByDeptId to ClassScheduleRepository and EnrollmentRepository"
```

---

## Task 3: Backend — SchoolCrudService (getTree + createSchool)

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/service/SchoolCrudService.java`

이 서비스는 `AdminService`와 별개로 신규 파일로 만든다. `AdminService`는 이미 크므로 분리가 좋다.

- [x] **Step 1: SchoolCrudService 파일 생성 (getTree + createSchool)**

```java
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
        this.universityRepo    = universityRepo;
        this.collegeSchoolRepo = collegeSchoolRepo;
        this.facultyGroupRepo  = facultyGroupRepo;
        this.deptRepo          = deptRepo;
        this.professorRepo     = professorRepo;
        this.curriculumItemRepo = curriculumItemRepo;
        this.assignmentRepo    = assignmentRepo;
        this.classScheduleRepo = classScheduleRepo;
        this.enrollmentRepo    = enrollmentRepo;
        this.noticeRepo        = noticeRepo;
        this.postRepo          = postRepo;
        this.scheduleRepo      = scheduleRepo;
        this.userRepo          = userRepo;
    }

    // ── GET TREE ─────────────────────────────────────────────────────────────

    public SchoolTreeDto getTree(Long univId) {
        University univ = universityRepo.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교를 찾을 수 없습니다"));

        SchoolTreeDto dto = new SchoolTreeDto();
        dto.setName(univ.getName());
        dto.setDescription(univ.getDescription() != null ? univ.getDescription() : "");

        List<SchoolTreeDto.CollegeDto> collegeDtos = new ArrayList<>();
        for (CollegeSchool college : collegeSchoolRepo.findByUniversityIdOrderByIdAsc(univId)) {
            SchoolTreeDto.CollegeDto cd = new SchoolTreeDto.CollegeDto();
            cd.setId(college.getId());
            cd.setName(college.getName());
            cd.setDescription(college.getDescription() != null ? college.getDescription() : "");

            List<SchoolTreeDto.FacultyDto> facultyDtos = new ArrayList<>();
            for (FacultyGroup faculty : facultyGroupRepo.findBySchoolIdOrderByIdAsc(college.getId())) {
                SchoolTreeDto.FacultyDto fd = new SchoolTreeDto.FacultyDto();
                fd.setId(faculty.getId());
                fd.setName(faculty.getName());

                List<SchoolTreeDto.DeptDto> deptDtos = new ArrayList<>();
                for (Department dept : deptRepo.findByFacultyIdOrderByIdAsc(faculty.getId())) {
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
```

- [x] **Step 2: 컴파일 확인**

```powershell
cd demo/demo
./mvnw clean compile -q
```

Expected: `BUILD SUCCESS`

- [x] **Step 3: 커밋**

```powershell
git add demo/demo/src/main/java/com/example/demo/service/SchoolCrudService.java
git commit -m "feat: SchoolCrudService — getTree and createSchool"
```

---

## Task 4: Backend — SchoolCrudService (updateSchool Merge 전략)

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/SchoolCrudService.java`

Merge 전략: 요청에 `id`가 있으면 update, `id: null`이면 신규 생성, 기존 DB에 있지만 요청에 없는 id는 cascade 삭제.

- [x] **Step 1: `updateSchool`, `mergeFaculties`, `mergeDepts` 메서드를 `createSchool` 아래에 추가**

파일 끝의 닫는 `}` 바로 앞에 다음 메서드들을 삽입:

```java
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
```

- [x] **Step 2: 컴파일 확인**

```powershell
cd demo/demo
./mvnw clean compile -q
```

Expected: `BUILD SUCCESS`

- [x] **Step 3: 커밋**

```powershell
git add demo/demo/src/main/java/com/example/demo/service/SchoolCrudService.java
git commit -m "feat: SchoolCrudService — updateSchool with merge strategy"
```

---

## Task 5: Backend — SchoolCrudService (cascade 삭제)

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/SchoolCrudService.java`

cascade 삭제 순서: Department 하위 데이터 → Dept → Faculty 콘텐츠 → Faculty → College 콘텐츠 → College → 사용자 universityId null화 → University.

`"univ"` scope의 scopeId는 `CollegeSchool.id`임을 주의 (University.id가 아님).

- [x] **Step 1: `deleteSchool`, `deleteCollegeCascade`, `deleteFacultyCascade`, `deleteDeptCascade` 메서드를 `mergeDepts` 아래에 추가**

```java
    // ── DELETE (CASCADE) ──────────────────────────────────────────────────────

    @Transactional
    public void deleteSchool(Long univId) {
        universityRepo.findById(univId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학교를 찾을 수 없습니다"));

        for (CollegeSchool college : collegeSchoolRepo.findByUniversityId(univId)) {
            deleteCollegeCascade(college.getId());
        }

        // 소속 사용자 universityId null화 (계정 삭제 아님)
        userRepo.findByUniversityId(String.valueOf(univId)).forEach(u -> {
            u.setUniversityId(null);
            userRepo.save(u);
        });

        universityRepo.deleteById(univId);
    }

    private void deleteCollegeCascade(Long collegeId) {
        for (FacultyGroup faculty : facultyGroupRepo.findBySchoolId(collegeId)) {
            deleteFacultyCascade(faculty.getId());
        }
        noticeRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("univ", collegeId)
                  .forEach(noticeRepo::delete);
        postRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("univ", collegeId)
                .forEach(postRepo::delete);
        scheduleRepo.findByScopeTypeAndScopeIdOrderByEventDateAsc("univ", collegeId)
                    .forEach(scheduleRepo::delete);
        collegeSchoolRepo.deleteById(collegeId);
    }

    private void deleteFacultyCascade(Long facultyId) {
        for (Department dept : deptRepo.findByFacultyId(facultyId)) {
            deleteDeptCascade(dept.getId());
        }
        noticeRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("faculty", facultyId)
                  .forEach(noticeRepo::delete);
        postRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("faculty", facultyId)
                .forEach(postRepo::delete);
        scheduleRepo.findByScopeTypeAndScopeIdOrderByEventDateAsc("faculty", facultyId)
                    .forEach(scheduleRepo::delete);
        facultyGroupRepo.deleteById(facultyId);
    }

    private void deleteDeptCascade(Long deptId) {
        classScheduleRepo.findByDeptId(deptId).forEach(classScheduleRepo::delete);
        enrollmentRepo.findByDeptId(deptId).forEach(enrollmentRepo::delete);
        assignmentRepo.findByDeptId(deptId).forEach(assignmentRepo::delete);
        curriculumItemRepo.findByDeptId(deptId).forEach(curriculumItemRepo::delete);
        professorRepo.findByDeptId(deptId).forEach(professorRepo::delete);
        noticeRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("dept", deptId)
                  .forEach(noticeRepo::delete);
        postRepo.findByScopeTypeAndScopeIdOrderByCreatedDateDesc("dept", deptId)
                .forEach(postRepo::delete);
        scheduleRepo.findByScopeTypeAndScopeIdOrderByEventDateAsc("dept", deptId)
                    .forEach(scheduleRepo::delete);
        deptRepo.deleteById(deptId);
    }
```

- [x] **Step 2: 컴파일 확인**

```powershell
cd demo/demo
./mvnw clean compile -q
```

Expected: `BUILD SUCCESS`

- [x] **Step 3: 커밋**

```powershell
git add demo/demo/src/main/java/com/example/demo/service/SchoolCrudService.java
git commit -m "feat: SchoolCrudService — cascade delete school/college/faculty/dept"
```

---

## Task 6: Backend — SuperAdminController (4개 엔드포인트) + 수동 테스트

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/SuperAdminController.java`

기존 `SuperAdminController`에 `SchoolCrudService` 필드와 생성자 파라미터를 추가하고 4개 엔드포인트를 추가한다.

- [x] **Step 1: 파일 상단 import 추가**

`SuperAdminController.java`의 import 블록에 아래 두 줄 추가:

```java
import com.example.demo.dto.SchoolTreeDto;
import com.example.demo.service.SchoolCrudService;
```

- [x] **Step 2: 필드 및 생성자 수정**

기존 필드 선언 블록:
```java
    private final AdminService adminService;
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
```

아래로 변경:
```java
    private final AdminService adminService;
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final SchoolCrudService schoolCrudService;
```

기존 생성자:
```java
    public SuperAdminController(AdminService adminService,
                                 UserRepository userRepository,
                                 UniversityRepository universityRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
    }
```

아래로 변경:
```java
    public SuperAdminController(AdminService adminService,
                                 UserRepository userRepository,
                                 UniversityRepository universityRepository,
                                 SchoolCrudService schoolCrudService) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
        this.schoolCrudService = schoolCrudService;
    }
```

- [x] **Step 3: 4개 엔드포인트를 클래스 끝 닫는 `}` 앞에 추가**

```java
    // ── School CRUD ──────────────────────────────────────────────────────────

    @GetMapping("/schools/{id}/tree")
    public ResponseEntity<SchoolTreeDto> getSchoolTree(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id) {
        verifySuper(username);
        return ResponseEntity.ok(schoolCrudService.getTree(id));
    }

    @PostMapping("/schools")
    public ResponseEntity<Map<String, Object>> createSchool(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestBody SchoolTreeDto req) {
        verifySuper(username);
        Long id = schoolCrudService.createSchool(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
    }

    @PutMapping("/schools/{id}")
    public ResponseEntity<Void> updateSchool(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody SchoolTreeDto req) {
        verifySuper(username);
        schoolCrudService.updateSchool(id, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/schools/{id}")
    public ResponseEntity<Void> deleteSchool(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id) {
        verifySuper(username);
        schoolCrudService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }
```

- [x] **Step 4: 컴파일 확인**

```powershell
cd demo/demo
./mvnw clean compile -q
```

Expected: `BUILD SUCCESS`

- [x] **Step 5: Spring Boot 실행**

```powershell
cd demo/demo
./mvnw spring-boot:run
```

- [x] **Step 6: API 수동 테스트 (별도 터미널)**

먼저 로그인해서 super admin username을 확인한다 (기본 계정: `superadmin` / `super1234`).

```powershell
# 학교 생성 테스트
$body = '{"name":"테스트대학교","description":"테스트","colleges":[{"id":null,"name":"공학대학","description":"","faculties":[{"id":null,"name":"컴퓨터공학부","departments":[{"id":null,"name":"컴퓨터공학과","description":"","phone":"","email":""}]}]}]}'
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/super/schools" -Method POST -Headers @{"Content-Type"="application/json";"X-Username"="superadmin"} -Body $body
```

Expected: `{ "id": <새ID> }` (201 Created)

```powershell
# 트리 조회 테스트 (위에서 받은 id로)
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/super/schools/<새ID>/tree" -Headers @{"X-Username"="superadmin"}
```

Expected: 중첩 JSON 트리 반환

```powershell
# 삭제 테스트
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/super/schools/<새ID>" -Method DELETE -Headers @{"X-Username"="superadmin"}
```

Expected: 204 No Content

- [x] **Step 7: 커밋**

```powershell
git add demo/demo/src/main/java/com/example/demo/controller/SuperAdminController.java
git commit -m "feat: SuperAdminController — school CRUD endpoints (GET tree, POST, PUT, DELETE)"
```

---

## Task 7: Frontend — TypeScript 타입 정의

**Files:**
- Create: `frontend/src/types/schoolDraft.ts`

`FacultyGroup` 엔티티에 `description`이 없으므로 `FacultyDraft`에도 없다.

- [x] **Step 1: schoolDraft.ts 생성**

```typescript
export interface DeptDraft {
  id: number | null
  name: string
  description: string
  phone: string
  email: string
}

export interface FacultyDraft {
  id: number | null
  name: string
  departments: DeptDraft[]
}

export interface CollegeDraft {
  id: number | null
  name: string
  description: string
  faculties: FacultyDraft[]
}

export interface SchoolDraft {
  name: string
  description: string
  colleges: CollegeDraft[]
}

export const emptyDraft: SchoolDraft = {
  name: '',
  description: '',
  colleges: [],
}
```

- [x] **Step 2: 커밋**

```powershell
git add frontend/src/types/schoolDraft.ts
git commit -m "feat: add SchoolDraft TypeScript types"
```

---

## Task 8: Frontend — Helper 순수 함수

**Files:**
- Create: `frontend/src/utils/schoolDraftHelpers.ts`

중첩 state 불변 업데이트를 담당하는 순수 함수. 컴포넌트에서 직접 spread를 반복하지 않도록 분리. 각 함수는 `SchoolDraft`를 받아 새 `SchoolDraft`를 반환한다.

- [x] **Step 1: schoolDraftHelpers.ts 생성**

```typescript
import type { SchoolDraft, CollegeDraft, FacultyDraft, DeptDraft } from '../types/schoolDraft'

// ── College ──────────────────────────────────────────────────────────────────

export function addCollege(draft: SchoolDraft): SchoolDraft {
  const newCollege: CollegeDraft = { id: null, name: '', description: '', faculties: [] }
  return { ...draft, colleges: [...draft.colleges, newCollege] }
}

export function removeCollege(draft: SchoolDraft, ci: number): SchoolDraft {
  return { ...draft, colleges: draft.colleges.filter((_, i) => i !== ci) }
}

export function updateCollege(
  draft: SchoolDraft,
  ci: number,
  updated: CollegeDraft,
): SchoolDraft {
  return {
    ...draft,
    colleges: draft.colleges.map((c, i) => (i === ci ? updated : c)),
  }
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export function addFaculty(college: CollegeDraft): CollegeDraft {
  const newFaculty: FacultyDraft = { id: null, name: '', departments: [] }
  return { ...college, faculties: [...college.faculties, newFaculty] }
}

export function removeFaculty(college: CollegeDraft, fi: number): CollegeDraft {
  return { ...college, faculties: college.faculties.filter((_, i) => i !== fi) }
}

export function updateFaculty(
  college: CollegeDraft,
  fi: number,
  updated: FacultyDraft,
): CollegeDraft {
  return {
    ...college,
    faculties: college.faculties.map((f, i) => (i === fi ? updated : f)),
  }
}

// ── Department ────────────────────────────────────────────────────────────────

export function addDept(faculty: FacultyDraft): FacultyDraft {
  const newDept: DeptDraft = { id: null, name: '', description: '', phone: '', email: '' }
  return { ...faculty, departments: [...faculty.departments, newDept] }
}

export function removeDept(faculty: FacultyDraft, di: number): FacultyDraft {
  return { ...faculty, departments: faculty.departments.filter((_, i) => i !== di) }
}

export function updateDept(
  faculty: FacultyDraft,
  di: number,
  updated: DeptDraft,
): FacultyDraft {
  return {
    ...faculty,
    departments: faculty.departments.map((d, i) => (i === di ? updated : d)),
  }
}
```

- [x] **Step 2: 커밋**

```powershell
git add frontend/src/utils/schoolDraftHelpers.ts
git commit -m "feat: add schoolDraftHelpers — immutable nested state updaters"
```

---

## Task 9: Frontend — API 함수 추가

**Files:**
- Modify: `frontend/src/api/adminSuper.ts`

기존 파일 끝에 타입 import와 4개 API 함수를 추가한다. `headers()` 함수와 `handle403()` 헬퍼는 이미 파일에 있으므로 재사용.

- [x] **Step 1: 파일 첫 줄에 import 추가**

`frontend/src/api/adminSuper.ts` 맨 위에 추가:

```typescript
import type { SchoolDraft } from '../types/schoolDraft'
```

- [x] **Step 2: 파일 끝에 4개 함수 추가**

```typescript
export async function fetchSchoolTree(id: number): Promise<SchoolDraft> {
  const res = await fetch(`/api/admin/super/schools/${id}/tree`, { headers: headers() })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createSchool(draft: SchoolDraft): Promise<{ id: number }> {
  const res = await fetch('/api/admin/super/schools', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(draft),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateSchool(id: number, draft: SchoolDraft): Promise<void> {
  const res = await fetch(`/api/admin/super/schools/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(draft),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
}

export async function deleteSchool(id: number): Promise<void> {
  const res = await fetch(`/api/admin/super/schools/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
}
```

- [x] **Step 3: 타입 체크**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: 오류 없음

- [x] **Step 4: 커밋**

```powershell
git add frontend/src/api/adminSuper.ts
git commit -m "feat: adminSuper — fetchSchoolTree, createSchool, updateSchool, deleteSchool"
```

---

## Task 10: Frontend — SchoolTreeEditor 컴포넌트

**Files:**
- Create: `frontend/src/pages/admin/SchoolTreeEditor.tsx`

단과대학 → 학부 → 학과의 계층 편집 UI. `CollegeEditor`, `FacultyEditor`, `DeptRow`를 같은 파일에 내부 컴포넌트로 정의한다.

각 하위 컴포넌트는 자신의 slice(CollegeDraft/FacultyDraft/DeptDraft)를 받고 변경 시 `onChange(updated)` 콜백을 부른다. 상위 컴포넌트(`SchoolManagementTab`)가 helpers를 써서 전체 draft를 재조립한다.

- [x] **Step 1: SchoolTreeEditor.tsx 생성**

```tsx
import type { SchoolDraft, CollegeDraft, FacultyDraft, DeptDraft } from '../../types/schoolDraft'
import {
  addCollege, removeCollege, updateCollege,
  addFaculty, removeFaculty, updateFaculty,
  addDept, removeDept, updateDept,
} from '../../utils/schoolDraftHelpers'

interface TreeEditorProps {
  draft: SchoolDraft
  onChange: (draft: SchoolDraft) => void
}

export default function SchoolTreeEditor({ draft, onChange }: TreeEditorProps) {
  return (
    <div className="space-y-3">
      {draft.colleges.map((college, ci) => (
        <CollegeEditor
          key={ci}
          college={college}
          onChange={updated => onChange(updateCollege(draft, ci, updated))}
          onRemove={() => onChange(removeCollege(draft, ci))}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange(addCollege(draft))}
        className="w-full border-2 border-dashed border-gray-300 py-2.5 text-xs text-gray-400 hover:border-black hover:text-black transition"
      >
        + 단과대학 추가
      </button>
    </div>
  )
}

// ── CollegeEditor ─────────────────────────────────────────────────────────────

interface CollegeProps {
  college: CollegeDraft
  onChange: (college: CollegeDraft) => void
  onRemove: () => void
}

function CollegeEditor({ college, onChange, onRemove }: CollegeProps) {
  return (
    <div className="border-2 border-black p-4 space-y-3">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1.5">
          <input
            className="w-full border border-gray-400 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
            placeholder="단과대학 이름 *"
            value={college.name}
            onChange={e => onChange({ ...college, name: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 px-3 py-1 text-xs text-gray-500 focus:outline-none focus:border-black"
            placeholder="설명 (선택)"
            value={college.description}
            onChange={e => onChange({ ...college, description: e.target.value })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="border border-red-300 text-red-400 px-2 py-1.5 text-xs hover:bg-red-50 transition"
        >
          삭제
        </button>
      </div>

      <div className="pl-4 space-y-2 border-l-2 border-gray-200">
        {college.faculties.map((faculty, fi) => (
          <FacultyEditor
            key={fi}
            faculty={faculty}
            onChange={updated => onChange(updateFaculty(college, fi, updated))}
            onRemove={() => onChange(removeFaculty(college, fi))}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange(addFaculty(college))}
          className="w-full border border-dashed border-gray-300 py-1.5 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-600 transition"
        >
          + 학부 추가
        </button>
      </div>
    </div>
  )
}

// ── FacultyEditor ─────────────────────────────────────────────────────────────

interface FacultyProps {
  faculty: FacultyDraft
  onChange: (faculty: FacultyDraft) => void
  onRemove: () => void
}

function FacultyEditor({ faculty, onChange, onRemove }: FacultyProps) {
  return (
    <div className="border border-gray-300 p-3 space-y-2 bg-gray-50">
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-black bg-white"
          placeholder="학부 이름 *"
          value={faculty.name}
          onChange={e => onChange({ ...faculty, name: e.target.value })}
        />
        <button
          type="button"
          onClick={onRemove}
          className="border border-red-300 text-red-400 px-2 py-1 text-xs hover:bg-red-50 transition"
        >
          삭제
        </button>
      </div>

      <div className="pl-3 space-y-1.5 border-l border-gray-300">
        {faculty.departments.map((dept, di) => (
          <DeptRow
            key={di}
            dept={dept}
            onChange={updated => onChange(updateDept(faculty, di, updated))}
            onRemove={() => onChange(removeDept(faculty, di))}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange(addDept(faculty))}
          className="w-full border border-dashed border-gray-200 py-1 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-500 transition"
        >
          + 학과 추가
        </button>
      </div>
    </div>
  )
}

// ── DeptRow ───────────────────────────────────────────────────────────────────

interface DeptProps {
  dept: DeptDraft
  onChange: (dept: DeptDraft) => void
  onRemove: () => void
}

function DeptRow({ dept, onChange, onRemove }: DeptProps) {
  return (
    <div className="flex gap-2 items-center">
      <input
        className="flex-1 border border-gray-200 px-3 py-1 text-xs focus:outline-none focus:border-black bg-white"
        placeholder="학과 이름 *"
        value={dept.name}
        onChange={e => onChange({ ...dept, name: e.target.value })}
      />
      <button
        type="button"
        onClick={onRemove}
        className="border border-red-200 text-red-400 px-2 py-0.5 text-xs hover:bg-red-50 transition"
      >
        삭제
      </button>
    </div>
  )
}
```

- [x] **Step 2: 타입 체크**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: 오류 없음

- [x] **Step 3: 커밋**

```powershell
git add frontend/src/pages/admin/SchoolTreeEditor.tsx
git commit -m "feat: SchoolTreeEditor — hierarchical college/faculty/dept editor"
```

---

## Task 11: Frontend — SchoolManagementTab 컴포넌트

**Files:**
- Create: `frontend/src/pages/admin/SchoolManagementTab.tsx`

list / create / edit 세 가지 뷰를 `view` state 하나로 전환. 편집 시 `fetchSchoolTree`로 draft 초기화.

- [x] **Step 1: SchoolManagementTab.tsx 생성**

```tsx
import { useState, useEffect } from 'react'
import type { School } from '../../api/adminSuper'
import {
  fetchSuperSchools,
  fetchSchoolTree,
  createSchool,
  updateSchool,
  deleteSchool,
} from '../../api/adminSuper'
import type { SchoolDraft } from '../../types/schoolDraft'
import { emptyDraft } from '../../types/schoolDraft'
import SchoolTreeEditor from './SchoolTreeEditor'

type View = 'list' | 'create' | 'edit'

export default function SchoolManagementTab() {
  const [view, setView]           = useState<View>('list')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [schools, setSchools]     = useState<School[]>([])
  const [draft, setDraft]         = useState<SchoolDraft>(emptyDraft)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const loadSchools = () => fetchSuperSchools().then(setSchools)

  useEffect(() => { loadSchools() }, [])

  const handleCreate = () => {
    setDraft(emptyDraft)
    setEditingId(null)
    setError(null)
    setView('create')
  }

  const handleEdit = async (id: number) => {
    setError(null)
    const tree = await fetchSchoolTree(id)
    setDraft(tree)
    setEditingId(id)
    setView('edit')
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}"을(를) 정말 삭제하시겠습니까?`)) return
    if (!window.confirm(
      `이 작업은 되돌릴 수 없습니다.\n학교와 모든 하위 데이터(단과대학, 학부, 학과, 교수, 교육과정)가 영구 삭제됩니다.`
    )) return
    await deleteSchool(id)
    loadSchools()
  }

  const handleSubmit = async () => {
    if (!draft.name.trim()) { setError('학교 이름은 필수입니다.'); return }
    setSubmitting(true)
    setError(null)
    try {
      if (view === 'create') {
        await createSchool(draft)
      } else if (view === 'edit' && editingId !== null) {
        await updateSchool(editingId, draft)
      }
      await loadSchools()
      setView('list')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── List 뷰 ──────────────────────────────────────────────────────────────

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="border-2 border-black bg-black text-white px-4 py-2 text-xs hover:bg-gray-900 transition"
          >
            + 새 학교 생성
          </button>
        </div>

        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left px-4 py-3 w-16">ID</th>
                <th className="text-left px-4 py-3">이름</th>
                <th className="text-left px-4 py-3">설명</th>
                <th className="text-right px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">
                    등록된 학교가 없습니다.
                  </td>
                </tr>
              )}
              {schools.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-xs">
                    {s.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(s.id)}
                      className="text-xs border border-gray-400 px-3 py-1 hover:bg-gray-100 transition"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── Create / Edit 폼 뷰 ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <button
        onClick={() => setView('list')}
        className="text-xs text-gray-500 hover:text-black flex items-center gap-1.5 transition"
      >
        <i className="fas fa-arrow-left" />
        목록으로
      </button>

      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {view === 'create' ? '새 학교 생성' : '학교 정보 수정'}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">학교 이름 *</label>
          <input
            className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none"
            placeholder="예: 목포대학교"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">설명 (선택)</label>
          <input
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder="학교 소개"
            value={draft.description}
            onChange={e => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          단과대학 구조
        </p>
        <SchoolTreeEditor draft={draft} onChange={setDraft} />
      </div>

      {error && (
        <p className="text-sm text-red-500 border border-red-200 px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setView('list')}
          className="border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="border-2 border-black bg-black text-white px-5 py-2 text-sm hover:bg-gray-900 transition disabled:opacity-50"
        >
          {submitting ? '저장 중...' : view === 'create' ? '생성' : '저장'}
        </button>
      </div>
    </div>
  )
}
```

- [x] **Step 2: 타입 체크**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: 오류 없음

- [x] **Step 3: 커밋**

```powershell
git add frontend/src/pages/admin/SchoolManagementTab.tsx
git commit -m "feat: SchoolManagementTab — list/create/edit views with API integration"
```

---

## Task 12: Frontend — SuperAdminPage 탭 구조 전환 + 빌드 검증

**Files:**
- Modify: `frontend/src/pages/admin/SuperAdminPage.tsx`

기존 단일 스크롤 페이지를 "개요 | 학교 관리" 2탭으로 전환. `SchoolAdminPage`의 탭 패턴(`type Tab`, `const TABS`, `const [tab, setTab]`)을 그대로 따른다.

- [x] **Step 1: 파일 상단 import 추가**

기존 `import` 블록에 아래 줄 추가:

```typescript
import SchoolManagementTab from './SchoolManagementTab'
```

- [x] **Step 2: `SuperAdminPage` 함수 내 상태 추가**

`const [loading, setLoading] = useState(true)` 바로 위에 추가:

```typescript
type Tab = '개요' | '학교 관리'
```

`const [loading, setLoading] = useState(true)` 아래에 추가:

```typescript
const [tab, setTab] = useState<Tab>('개요')
```

- [x] **Step 3: 헤더 섹션 아래에 탭 헤더 UI 삽입**

`<main className="max-w-7xl mx-auto px-4 py-8 space-y-8">` 바로 앞에 삽입:

```tsx
      {/* 탭 헤더 */}
      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 flex">
          {(['개요', '학교 관리'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition border-b-2 -mb-[2px] ${
                tab === t
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
```

- [x] **Step 4: `<main>` 내용을 탭 조건부 렌더로 감싸기**

기존:
```tsx
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 통계 카드 */}
        ...
      </main>
```

아래로 변경:

```tsx
      {tab === '개요' && (
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* 기존 개요 섹션 내용 전체 — 변경 없음 */}
          {/* 통계 카드 */}
          ...
          {/* (기존 모든 섹션) */}
        </main>
      )}

      {tab === '학교 관리' && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          <SchoolManagementTab />
        </main>
      )}
```

> **주의:** `<main>` 안의 기존 내용(StatCard, 차트, 학교목록, 인프라, 승인 대기, 관리자 계정 섹션)은 그대로 `{tab === '개요' && ...}` 블록 안으로 이동. 내용 자체는 수정하지 않는다.

- [x] **Step 5: 타입 체크**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: 오류 없음

- [x] **Step 6: 프론트엔드 빌드**

```powershell
cd frontend
npm run build
```

Expected: `✓ built in ...` (오류 없음)

- [x] **Step 7: Spring Boot 실행 후 브라우저 검증**

```powershell
cd demo/demo
./mvnw spring-boot:run
```

브라우저에서 `http://localhost:8080` 접속 후 `superadmin` / `super1234`로 로그인.

검증 체크리스트:
- [x] SuperAdminPage에 "개요 | 학교 관리" 탭 헤더가 보인다
- [x] "개요" 탭: 기존 통계, 차트, 인프라, 승인 대기 등이 그대로 보인다
- [x] "학교 관리" 탭: 학교 목록 테이블과 "+ 새 학교 생성" 버튼이 보인다
- [x] "+ 새 학교 생성" 클릭 → 폼이 열리고 "단과대학 추가" 버튼이 보인다
- [x] 단과대학 추가 → 학부 추가 → 학과 추가 순서로 트리 편집이 가능하다
- [x] "생성" 클릭 → 목록으로 돌아오고 새 학교가 표시된다
- [x] "편집" 클릭 → 기존 트리가 폼에 로드된다
- [x] 삭제 클릭 → confirm 두 번 후 학교가 목록에서 사라진다

- [x] **Step 8: 커밋**

```powershell
git add frontend/src/pages/admin/SuperAdminPage.tsx
git commit -m "feat: SuperAdminPage — add 학교 관리 tab with SchoolManagementTab"
```

- [x] **Step 9: 빌드 결과물 커밋**

```powershell
cd frontend
npm run build
cd ..
git add demo/demo/src/main/resources/static/
git commit -m "build: 프론트엔드 빌드 갱신 (School CRUD 관리자 탭 반영)"
```
