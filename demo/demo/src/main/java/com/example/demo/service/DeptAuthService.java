package com.example.demo.service;

import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.Department;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.entity.User;
import com.example.demo.repository.CollegeSchoolRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.FacultyGroupRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DeptAuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyGroupRepository facultyGroupRepository;
    private final CollegeSchoolRepository collegeSchoolRepository;
    private final AdminService adminService;

    public DeptAuthService(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           FacultyGroupRepository facultyGroupRepository,
                           CollegeSchoolRepository collegeSchoolRepository,
                           AdminService adminService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.facultyGroupRepository = facultyGroupRepository;
        this.collegeSchoolRepository = collegeSchoolRepository;
        this.adminService = adminService;
    }

    /**
     * SUPER_ADMIN  → requires deptId param, returns it.
     * SCHOOL_ADMIN → requires deptId param AND dept must belong to user's university.
     * DEPT_ADMIN   → ignores deptId param, derives from (universityId, department name).
     */
    public Long resolveDeptId(String username, Long deptIdParam) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        String role = user.getAdminRole();

        if ("SUPER_ADMIN".equals(role)) {
            if (deptIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "deptId 파라미터 필요");
            return deptIdParam;
        }
        if ("SCHOOL_ADMIN".equals(role)) {
            if (deptIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "deptId 파라미터 필요");
            if (user.getUniversityId() == null || user.getUniversityId().isBlank())
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
            Department d = departmentRepository.findById(deptIdParam)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학과 없음"));
            FacultyGroup fg = facultyGroupRepository.findById(d.getFacultyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학부 없음"));
            CollegeSchool cs = collegeSchoolRepository.findById(fg.getSchoolId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "단과 없음"));
            if (!cs.getUniversityId().equals(Long.parseLong(user.getUniversityId())))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 학교의 학과만 접근 가능");
            return deptIdParam;
        }
        if ("DEPT_ADMIN".equals(role)) {
            if (user.getUniversityId() == null || user.getDepartment() == null)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학과 정보 없음");
            Long resolved = adminService.resolveDeptIdByName(
                    Long.parseLong(user.getUniversityId()), user.getDepartment());
            if (resolved == null)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학과 매칭 실패");
            return resolved;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
    }
}
