package com.example.demo.util;

import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.Department;
import com.example.demo.repository.ClassScheduleRepository;
import com.example.demo.repository.CurriculumItemRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EnrollmentRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(6)
public class ComputerCurriculum2026Initializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final CurriculumItemRepository curriculumRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ComputerCurriculum2026Initializer(
            DepartmentRepository departmentRepository,
            CurriculumItemRepository curriculumRepository,
            ProfessorCourseAssignmentRepository assignmentRepository,
            ClassScheduleRepository classScheduleRepository,
            EnrollmentRepository enrollmentRepository) {
        this.departmentRepository = departmentRepository;
        this.curriculumRepository = curriculumRepository;
        this.assignmentRepository = assignmentRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        departmentRepository.findAll().stream()
                .filter(this::isTargetComputerEngineering)
                .forEach(this::replaceIfNeeded);
    }

    private boolean isTargetComputerEngineering(Department department) {
        String email = department.getEmail();
        String name = department.getName();
        String phone = department.getPhone();
        String address = department.getAddress();
        return "dept1@mokpo.ac.kr".equalsIgnoreCase(email)
                || (name != null && name.contains("컴퓨터공학")
                && ((phone != null && phone.startsWith("061-450"))
                || (address != null && (address.contains("목포") || address.contains("무안")))));
    }

    private void replaceIfNeeded(Department department) {
        List<CurriculumItem> current = curriculumRepository.findByDeptId(department.getId());
        boolean alreadyCurrent = current.size() == COURSES.size()
                && current.stream().anyMatch(item ->
                        "AI시스템프로젝트랩".equals(item.getName())
                                && "전체(1,2학기)".equals(item.getSemester()))
                && current.stream().anyMatch(item ->
                        "디지털문서와콘텐츠".equals(item.getName())
                                && "전체학년".equals(item.getYear()));
        if (alreadyCurrent) return;

        classScheduleRepository.deleteByDeptId(department.getId());
        enrollmentRepository.deleteByDeptId(department.getId());
        assignmentRepository.deleteByDeptId(department.getId());
        curriculumRepository.deleteByDeptId(department.getId());

        COURSES.forEach(course -> curriculumRepository.save(course.toEntity(department.getId())));
    }

    private record Course(String name, String year, String semester, String category, int credits) {
        CurriculumItem toEntity(Long deptId) {
            CurriculumItem item = new CurriculumItem();
            item.setName(name);
            item.setYear(year);
            item.setSemester(semester);
            item.setCategory(category);
            item.setRequired(category.contains("필수") || "공학기초".equals(category));
            item.setCredits(credits);
            item.setDeptId(deptId);
            return item;
        }
    }

    private static final List<Course> COURSES = List.of(
            new Course("디지털문서와콘텐츠", "전체학년", "전체(1,2학기)", "교양필수", 2),
            new Course("AI활용프로그래밍", "전체학년", "전체(1,2학기)", "교양필수", 2),
            new Course("컴퓨터와인터넷", "전체학년", "전체(1,2학기)", "교양선택", 3),
            new Course("컴퓨터적사고", "전체학년", "전체(1,2학기)", "교양선택", 3),
            new Course("프롬프트엔지니어링및AI활용", "전체학년", "1학기", "교양선택", 3),
            new Course("인공지능과예술창작", "전체학년", "2학기", "교양선택", 3),
            new Course("인공지능사회와인간", "전체학년", "2학기", "교양선택", 3),
            new Course("공학문서작성과의사소통", "1학년", "1학기", "전문교양", 3),

            new Course("일반수학", "1학년", "1학기", "공학기초", 3),
            new Course("일반물리", "1학년", "1학기", "공학기초", 3),
            new Course("C프로그래밍", "1학년", "1학기", "공학기초", 3),
            new Course("컴퓨터개론", "1학년", "1학기", "공학기초", 3),
            new Course("컴퓨터시스템실습", "1학년", "1학기", "공학기초", 3),
            new Course("이산수학", "1학년", "2학기", "공학기초", 3),
            new Course("파이썬프로그래밍", "1학년", "2학기", "공학기초", 3),
            new Course("공학설계입문", "1학년", "2학기", "공학기초", 3),
            new Course("리눅스시스템실습", "1학년", "2학기", "공학기초", 3),
            new Course("IoT기초", "1학년", "2학기", "공학기초", 3),

            new Course("선형대수학", "2학년", "1학기", "공학기초", 3),
            new Course("디지털이해와응용", "2학년", "1학기", "전공필수", 3),
            new Course("객체지향프로그래밍", "2학년", "1학기", "전공필수", 3),
            new Course("데이터구조", "2학년", "1학기", "전공필수", 3),
            new Course("리눅스시스템프로그래밍", "2학년", "1학기", "전공선택", 3),
            new Course("AIoT프로그래밍", "2학년", "2학기", "전공선택", 3),
            new Course("빅데이터분석", "2학년", "2학기", "전공필수", 3),
            new Course("인공지능활용실습", "2학년", "2학기", "전공선택", 3),
            new Course("확률및통계", "2학년", "2학기", "공학기초", 3),
            new Course("창의공학설계", "2학년", "2학기", "전공선택", 3),
            new Course("컴퓨터구조", "2학년", "2학기", "전공필수", 3),
            new Course("웹프로그래밍1", "2학년", "2학기", "전공선택", 3),
            new Course("프로젝트랩I", "2학년", "2학기", "전공선택", 3),

            new Course("소프트웨어공학", "3학년", "1학기", "전공필수", 3),
            new Course("데이터베이스", "3학년", "1학기", "전공필수", 3),
            new Course("운영체제", "3학년", "1학기", "전공필수", 3),
            new Course("임베디드시스템", "3학년", "1학기", "전공선택", 3),
            new Course("웹프로그래밍2", "3학년", "1학기", "전공선택", 3),
            new Course("알고리즘", "3학년", "1학기", "전공선택", 3),
            new Course("프로젝트랩II", "3학년", "1학기", "전공선택", 3),
            new Course("데이터통신", "3학년", "2학기", "전공필수", 3),
            new Course("딥러닝", "3학년", "2학기", "전공선택", 3),
            new Course("정보시스템구축및관리", "3학년", "2학기", "전공선택", 3),
            new Course("휴먼컴퓨터인터페이스", "3학년", "2학기", "전공선택", 3),
            new Course("데이터베이스응용", "3학년", "2학기", "전공선택", 3),
            new Course("영상처리", "3학년", "2학기", "전공선택", 3),

            new Course("AI시스템프로젝트랩", "4학년", "전체(1,2학기)", "전공선택", 3),
            new Course("캡스톤디자인", "4학년", "1학기", "전공필수", 3),
            new Course("임베디드시스템응용", "4학년", "1학기", "전공선택", 3),
            new Course("가상증강현실", "4학년", "1학기", "전공선택", 3),
            new Course("빅데이터분석및시각화", "4학년", "1학기", "전공선택", 3),
            new Course("AI시스템엔지니어링", "4학년", "1학기", "전공선택", 3),
            new Course("빅데이터서비스", "4학년", "2학기", "전공선택", 3),
            new Course("ICT미래기술특강", "4학년", "2학기", "전공선택", 3),
            new Course("모바일컴퓨팅및응용", "4학년", "2학기", "전공선택", 3)
    );
}
