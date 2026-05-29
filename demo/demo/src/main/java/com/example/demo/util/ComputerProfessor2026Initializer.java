package com.example.demo.util;

import com.example.demo.entity.Department;
import com.example.demo.entity.Professor;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Component
@Order(7)
public class ComputerProfessor2026Initializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final ProfessorRepository professorRepository;

    public ComputerProfessor2026Initializer(
            DepartmentRepository departmentRepository,
            ProfessorRepository professorRepository) {
        this.departmentRepository = departmentRepository;
        this.professorRepository = professorRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        departmentRepository.findAll().stream()
                .filter(this::isMokpoComputerEngineering)
                .forEach(this::upsertProfessors);
    }

    private boolean isMokpoComputerEngineering(Department department) {
        String email = department.getEmail();
        String name = department.getName();
        String phone = department.getPhone();
        String address = department.getAddress();
        return "dept1@mokpo.ac.kr".equalsIgnoreCase(email)
                || (name != null && name.contains("컴퓨터공학")
                && ((phone != null && phone.startsWith("061-450"))
                || (address != null && (address.contains("목포") || address.contains("무안")))));
    }

    private void upsertProfessors(Department department) {
        List<Professor> existing = professorRepository.findByDeptId(department.getId()).stream()
                .sorted(Comparator.comparing(Professor::getId))
                .toList();

        for (int i = 0; i < PROFESSORS.size(); i++) {
            ProfessorSeed seed = PROFESSORS.get(i);
            Professor professor = findByName(existing, seed.name());
            if (professor == null && i < existing.size()) {
                professor = existing.get(i);
            }
            if (professor == null) {
                professor = new Professor();
                professor.setDeptId(department.getId());
            }
            professor.setName(seed.name());
            professor.setSpecialty(seed.specialty());
            professor.setEmail(seed.email());
            professor.setDeptId(department.getId());
            professorRepository.save(professor);
        }
    }

    private Professor findByName(List<Professor> professors, String name) {
        return professors.stream()
                .filter(professor -> name.equals(professor.getName()))
                .findFirst()
                .orElse(null);
    }

    private record ProfessorSeed(String name, String specialty, String email) {}

    private static final List<ProfessorSeed> PROFESSORS = List.of(
            new ProfessorSeed("최종명", "프로그래밍 언어 및 컴파일러", "jmchoi@mokpo.ac.kr"),
            new ProfessorSeed("정민아", "데이터처리", "majung@mokpo.ac.kr"),
            new ProfessorSeed("윤숙", "컴퓨터비전 및 기계학습", "syoon@mokpo.ac.kr"),
            new ProfessorSeed("이영호", "가상현실, 증강현실", "youngho@ce.mokpo.ac.kr"),
            new ProfessorSeed("신영학", "인공지능, 기계학습 및 딥러닝", "younghak@mnu.ac.kr"),
            new ProfessorSeed("손현승", "소프트웨어공학, 메타모델, 모델변환, 테스팅", "hson@mnu.ac.kr"),
            new ProfessorSeed("이현병", "빅데이터, 데이터베이스, AI 융합", "lhb@mnu.ac.kr"),
            new ProfessorSeed("조경원", "컴퓨터 비전, 의료·수산 AI 응용, 딥러닝 모델 설계", "kyung90@mnu.ac.kr")
    );
}
