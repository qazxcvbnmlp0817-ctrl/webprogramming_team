package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.FindIdRequestDto;
import com.example.demo.dto.FindPasswordRequestDto;
import com.example.demo.dto.LoginRequestDto;
import com.example.demo.dto.SignupRequestDto;
import com.example.demo.entity.Professor;
import com.example.demo.entity.User;
import com.example.demo.repository.ProfessorRepository;
import com.example.demo.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AdminService adminService;
    private final ProfessorRepository professorRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository,
                       AdminService adminService,
                       ProfessorRepository professorRepository) {
        this.userRepository = userRepository;
        this.adminService = adminService;
        this.professorRepository = professorRepository;
    }

    public Map<String, Object> login(LoginRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return response;
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return response;
        }

        if (!user.getMemberType().equals(request.getMemberType())) {
            response.put("success", false);
            response.put("message", "회원 유형이 일치하지 않습니다.");
            return response;
        }

        String status = user.getStatus() != null ? user.getStatus() : "ACTIVE";
        if ("PENDING_APPROVAL".equals(status)) {
            response.put("success", false);
            response.put("message", "관리자 승인 후 이용 가능합니다.");
            return response;
        }
        if ("SUSPENDED".equals(status)) {
            response.put("success", false);
            response.put("message", "계정이 정지되었습니다.");
            return response;
        }
        if ("DELETED".equals(status)) {
            response.put("success", false);
            response.put("message", "존재하지 않는 계정입니다.");
            return response;
        }

        linkProfessorProfileIfPossible(user);

        response.put("success", true);
        response.put("message", "로그인 성공");
        response.put("memberType", user.getMemberType());
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("grade", user.getGrade());
        response.put("adminRole", user.getAdminRole());
        response.put("universityId", user.getUniversityId());
        response.put("department", user.getDepartment());
        response.put("college", user.getCollege());
        response.put("enrollmentStatus", user.getEnrollmentStatus());
        response.put("professorEntityId", user.getProfessorEntityId());
        // 학번(학생) / 교번(교수·조교·직원) 반환
        if (user.getStudentId() != null && !user.getStudentId().isBlank()) {
            response.put("studentId", user.getStudentId());
        }

        // 모든 유저: deptId, facultyId 조회 (접근 권한 체크용)
        if (user.getUniversityId() != null && user.getDepartment() != null) {
            try {
                Long deptId = adminService.resolveDeptIdByName(
                        Long.parseLong(user.getUniversityId()), user.getDepartment());
                if (deptId != null) response.put("deptId", deptId);
            } catch (NumberFormatException ignored) {}
        }
        if (user.getUniversityId() != null && user.getCollege() != null) {
            try {
                Long facultyId = adminService.resolveFacultyIdByName(
                        Long.parseLong(user.getUniversityId()), user.getCollege());
                if (facultyId != null) response.put("facultyId", facultyId);
            } catch (NumberFormatException ignored) {}
        }
        return response;
    }

    public Map<String, Object> signup(SignupRequestDto request) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByUsername(request.getUsername())) {
            response.put("success", false);
            response.put("message", "이미 사용 중인 아이디입니다.");
            return response;
        }

        // 비밀번호 정책 검증 (8자 이상, 영문+숫자+특수문자 포함)
        String pw = request.getPassword();
        if (pw == null || pw.length() < 8
                || !pw.matches(".*[a-zA-Z].*")
                || !pw.matches(".*[0-9].*")
                || !pw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            response.put("success", false);
            response.put("message", "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.");
            return response;
        }

        // 학번/교번 중복 확인 (admin 제외, 같은 대학 + 같은 회원 유형 내에서만 중복 방지)
        String memberType = request.getMemberType();
        boolean skipDuplicateCheck = "admin".equals(memberType);
        if (!skipDuplicateCheck
                && request.getStudentId() != null && !request.getStudentId().isBlank()
                && request.getUniversityId() != null) {
            if (userRepository.existsByStudentIdAndUniversityIdAndMemberType(
                    request.getStudentId(), request.getUniversityId(), memberType)) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 학번/교번입니다.");
                return response;
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setMemberType(request.getMemberType());
        user.setUniversityId(request.getUniversityId());
        user.setCollege(request.getCollege());
        user.setDepartment(request.getDepartment());
        user.setStudentId(request.getStudentId());
        user.setPhone(request.getPhone());
        // 학생만 학년·재학상태 저장, 교수·조교·관리자·직원은 null
        if ("student".equals(request.getMemberType())) {
            user.setGrade(request.getGrade());
            user.setEnrollmentStatus(request.getEnrollmentStatus());
        } else {
            user.setGrade(null);
            user.setEnrollmentStatus(null);
        }
        user.setStatus("PENDING_APPROVAL");
        user.setCreatedDate(java.time.LocalDateTime.now());
        linkProfessorProfileIfPossible(user);

        userRepository.save(user);

        response.put("success", true);
        response.put("message", "회원가입이 완료되었습니다.");
        return response;
    }

    public Map<String, Object> checkId(String username) {
        Map<String, Object> response = new HashMap<>();
        boolean available = !userRepository.existsByUsername(username);
        response.put("available", available);
        response.put("message", available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
        return response;
    }

    private void linkProfessorProfileIfPossible(User user) {
        if (user == null || !"professor".equals(user.getMemberType()) || user.getProfessorEntityId() != null) {
            return;
        }
        if (user.getName() == null || user.getDepartment() == null || user.getUniversityId() == null) {
            return;
        }
        try {
            Long deptId = adminService.resolveDeptIdByName(Long.parseLong(user.getUniversityId()), user.getDepartment());
            if (deptId == null) return;
            // Signup has no professor FK field, so this uses name + department as a limited fallback.
            // If there are duplicate professor names, an admin should link/manage assignments directly.
            Optional<Professor> professor = professorRepository.findByNameAndDeptId(user.getName().trim(), deptId);
            professor.ifPresent(found -> {
                user.setProfessorEntityId(found.getId());
                userRepository.save(user);
            });
        } catch (RuntimeException ignored) {
            // Keep auth usable; professor timetable APIs will still return a clear link error.
        }
    }

    public Map<String, Object> findId(FindIdRequestDto request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt;
        if (request.getUniversityId() == null && request.getStudentId() == null) {
            // 관리자: 이름만으로 조회
            userOpt = userRepository.findByName(request.getName());
        } else if (request.getStudentId() != null) {
            // 1. department(학과) 기준 조회 — 드롭다운 선택값 있을 때 가장 정확
            if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
                userOpt = userRepository.findByNameAndStudentIdAndDepartment(
                        request.getName(), request.getStudentId(), request.getDepartment());
            } else if (request.getCollege() != null && !request.getCollege().isBlank()
                    && request.getUniversityId() != null) {
                // 2. college + universityId
                userOpt = userRepository.findByNameAndStudentIdAndCollegeAndUniversityId(
                        request.getName(), request.getStudentId(),
                        request.getCollege(), request.getUniversityId());
            } else {
                // 3. 이름 + 학번만
                userOpt = userRepository.findByNameAndStudentId(
                        request.getName(), request.getStudentId());
            }
            // 4. 최종 폴백
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByNameAndStudentId(
                        request.getName(), request.getStudentId());
            }
        } else {
            userOpt = Optional.empty();
        }

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "일치하는 회원 정보가 없습니다.");
            return response;
        }

        String username = userOpt.get().getUsername();
        String masked = username.substring(0, Math.min(3, username.length()))
                + "***"
                + (username.length() > 3 ? username.substring(username.length() - 3) : "");

        response.put("success", true);
        response.put("username", masked);
        response.put("message", "아이디를 찾았습니다.");
        return response;
    }

    public Map<String, Object> changeName(String username, String newName) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        user.setName(newName);
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "이름이 변경되었습니다.");
        return response;
    }

    public Map<String, Object> changePassword(String username, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        // 비밀번호 정책 검증 (8자 이상, 영문+숫자+특수문자)
        if (newPassword == null || newPassword.length() < 8
                || !newPassword.matches(".*[a-zA-Z].*")
                || !newPassword.matches(".*[0-9].*")
                || !newPassword.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            response.put("success", false);
            response.put("message", "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.");
            return response;
        }
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "비밀번호가 변경되었습니다.");
        return response;
    }

    public Map<String, Object> getNotificationSettings(String username) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        response.put("success", true);
        response.put("notiNotice",  user.getNotiNotice()  != null ? user.getNotiNotice()  : true);
        response.put("notiComment", user.getNotiComment() != null ? user.getNotiComment() : true);
        response.put("notiDday",    user.getNotiDday()    != null ? user.getNotiDday()    : true);
        return response;
    }

    public Map<String, Object> saveNotificationSettings(String username,
                                                         Boolean notiNotice,
                                                         Boolean notiComment,
                                                         Boolean notiDday) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        user.setNotiNotice(notiNotice);
        user.setNotiComment(notiComment);
        user.setNotiDday(notiDday);
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "알림 설정이 저장되었습니다.");
        return response;
    }

    public Map<String, Object> findPassword(FindPasswordRequestDto request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt;
        if (request.getUniversityId() == null && request.getStudentId() == null) {
            // 관리자: 아이디 + 이름만으로 조회
            userOpt = userRepository.findByUsernameAndName(request.getUsername(), request.getName());
        } else if (request.getStudentId() != null) {
            // 1. department 기준
            if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
                userOpt = userRepository.findByUsernameAndNameAndStudentIdAndDepartment(
                        request.getUsername(), request.getName(),
                        request.getStudentId(), request.getDepartment());
            } else if (request.getCollege() != null && !request.getCollege().isBlank()
                    && request.getUniversityId() != null) {
                // 2. college + universityId
                userOpt = userRepository.findByUsernameAndNameAndStudentIdAndCollegeAndUniversityId(
                        request.getUsername(), request.getName(),
                        request.getStudentId(), request.getCollege(), request.getUniversityId());
            } else {
                // 3. 아이디 + 이름 + 학번
                userOpt = userRepository.findByUsernameAndNameAndStudentId(
                        request.getUsername(), request.getName(), request.getStudentId());
            }
            // 4. 최종 폴백
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsernameAndNameAndStudentId(
                        request.getUsername(), request.getName(), request.getStudentId());
            }
        } else {
            userOpt = Optional.empty();
        }

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "일치하는 회원 정보가 없습니다.");
            return response;
        }

        response.put("success", true);
        response.put("message", "본인 확인이 완료되었습니다.");
        return response;
    }

    public Map<String, Object> getMyProfile(String username) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        response.put("success", true);
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("memberType", user.getMemberType());
        response.put("universityId", user.getUniversityId());
        response.put("college", user.getCollege());
        response.put("department", user.getDepartment());
        response.put("studentId", user.getStudentId());
        response.put("phone", user.getPhone());
        response.put("grade", user.getGrade());
        response.put("enrollmentStatus", user.getEnrollmentStatus());
        response.put("professorEntityId", user.getProfessorEntityId());
        return response;
    }
}
