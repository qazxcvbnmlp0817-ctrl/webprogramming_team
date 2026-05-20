package com.example.demo.util;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UniversityRepository universityRepo;
    private final CollegeSchoolRepository schoolRepo;
    private final FacultyGroupRepository facultyRepo;
    private final DepartmentRepository deptRepo;
    private final ProfessorRepository professorRepo;
    private final CurriculumItemRepository curriculumRepo;

    public DataInitializer(UniversityRepository universityRepo,
                           CollegeSchoolRepository schoolRepo,
                           FacultyGroupRepository facultyRepo,
                           DepartmentRepository deptRepo,
                           ProfessorRepository professorRepo,
                           CurriculumItemRepository curriculumRepo) {
        this.universityRepo = universityRepo;
        this.schoolRepo     = schoolRepo;
        this.facultyRepo    = facultyRepo;
        this.deptRepo       = deptRepo;
        this.professorRepo  = professorRepo;
        this.curriculumRepo = curriculumRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (universityRepo.count() > 0) return; // 이미 씨드된 경우 스킵

        // ── 목포대학교 ───────────────────────────────────────────────────────
        University mokpo = saveUniv("목포대학교", "서남권 중심 국립대학교");

        CollegeSchool eng = saveSchool("공과대학", "공학 분야 전문 인재 양성", mokpo.getId());
        FacultyGroup ict  = saveFaculty("정보통신공학부", eng.getId());
        saveDept("컴퓨터공학과",   ict.getId(), "컴퓨터공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2400", "dept1@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("전기전자공학과", ict.getId(), "전기전자공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2401", "dept2@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("정보통신공학과", ict.getId(), "정보통신공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2402", "dept3@mokpo.ac.kr", "평일 09:00~18:00");

        FacultyGroup mech = saveFaculty("기계시스템공학부", eng.getId());
        saveDept("기계공학과",     mech.getId(), "기계공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2410", "dept4@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("토목환경공학과", mech.getId(), "토목환경공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2411", "dept5@mokpo.ac.kr", "평일 09:00~18:00");

        CollegeSchool hum = saveSchool("인문대학", "인문학적 소양과 창의적 사고 함양", mokpo.getId());
        FacultyGroup humFac = saveFaculty("인문학부", hum.getId());
        saveDept("국어국문학과", humFac.getId(), "국어국문학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2420", "dept6@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("영어영문학과", humFac.getId(), "영어영문학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2421", "dept7@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("사학과",       humFac.getId(), "사학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2422", "dept8@mokpo.ac.kr", "평일 09:00~18:00");

        CollegeSchool soc = saveSchool("사회과학대학", "사회 현상 분석과 문제 해결 능력 배양", mokpo.getId());
        FacultyGroup socFac = saveFaculty("사회과학부", soc.getId());
        saveDept("행정학과", socFac.getId(), "행정학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2430", "dept9@mokpo.ac.kr",  "평일 09:00~18:00");
        saveDept("경제학과", socFac.getId(), "경제학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2431", "dept10@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("사회학과", socFac.getId(), "사회학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2432", "dept11@mokpo.ac.kr", "평일 09:00~18:00");

        CollegeSchool nat = saveSchool("자연과학대학", "기초과학 연구와 응용과학 발전 선도", mokpo.getId());
        FacultyGroup natFac = saveFaculty("자연과학부", nat.getId());
        saveDept("수학과",   natFac.getId(), "수학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2440", "dept12@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("물리학과", natFac.getId(), "물리학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2441", "dept13@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("화학과",   natFac.getId(), "화학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2442", "dept14@mokpo.ac.kr", "평일 09:00~18:00");

        CollegeSchool edu = saveSchool("사범대학", "미래 교육을 이끌 전문 교사 양성", mokpo.getId());
        FacultyGroup eduFac = saveFaculty("사범학부", edu.getId());
        saveDept("교육학과",   eduFac.getId(), "교육학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2450", "dept15@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("수학교육과", eduFac.getId(), "수학교육과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2451", "dept16@mokpo.ac.kr", "평일 09:00~18:00");

        CollegeSchool mar = saveSchool("해양수산대학", "해양 자원 개발과 수산 분야 전문 인재 육성", mokpo.getId());
        FacultyGroup marFac = saveFaculty("해양수산학부", mar.getId());
        saveDept("해양시스템공학과", marFac.getId(), "해양시스템공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2460", "dept17@mokpo.ac.kr", "평일 09:00~18:00");
        saveDept("수산생명과학과",   marFac.getId(), "수산생명과학과는 이론과 실무를 균형 있게 교육합니다.", "전남 목포시 영산로 1666", "061-450-2461", "dept18@mokpo.ac.kr", "평일 09:00~18:00");

        // ── 순천대학교 ───────────────────────────────────────────────────────
        University suncheon = saveUniv("순천대학교", "남도 문화와 학문의 중심");

        CollegeSchool humSoc = saveSchool("인문사회과학대학", "인문·사회 통합 교육", suncheon.getId());
        FacultyGroup humSocFac = saveFaculty("인문사회학부", humSoc.getId());
        saveDept("국어국문학과", humSocFac.getId(), "국어국문학과는 이론과 실무를 균형 있게 교육합니다.", "전남 순천시 중앙로 255", "061-750-3400", "dept19@sunchon.ac.kr", "평일 09:00~18:00");
        saveDept("행정학과",     humSocFac.getId(), "행정학과는 이론과 실무를 균형 있게 교육합니다.", "전남 순천시 중앙로 255", "061-750-3401", "dept20@sunchon.ac.kr", "평일 09:00~18:00");

        CollegeSchool engSun = saveSchool("공과대학", "첨단 기술 연구와 산학협력 선도", suncheon.getId());
        FacultyGroup engSunFac = saveFaculty("공학부", engSun.getId());
        saveDept("컴퓨터공학과", engSunFac.getId(), "컴퓨터공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 순천시 중앙로 255", "061-750-3410", "dept21@sunchon.ac.kr", "평일 09:00~18:00");
        saveDept("전기공학과",   engSunFac.getId(), "전기공학과는 이론과 실무를 균형 있게 교육합니다.", "전남 순천시 중앙로 255", "061-750-3411", "dept22@sunchon.ac.kr", "평일 09:00~18:00");

        // ── 교수 및 교육과정 씨드 (전체 학과에 기본 데이터) ─────────────────
        deptRepo.findAll().forEach(dept -> {
            professorRepo.save(makeProfessor(dept.getName() + " / 이론 및 기초", "prof1@mokpo.ac.kr", dept.getId()));
            professorRepo.save(makeProfessor(dept.getName() + " / 응용 및 실무", "prof2@mokpo.ac.kr", dept.getId()));
            professorRepo.save(makeProfessor(dept.getName() + " / 연구 및 개발", "prof3@mokpo.ac.kr", dept.getId()));

            curriculumRepo.save(makeCurriculum(dept.getName() + " 개론", "1학년", true,  3, dept.getId()));
            curriculumRepo.save(makeCurriculum("전공기초 실습",              "1학년", true,  2, dept.getId()));
            curriculumRepo.save(makeCurriculum("심화 이론",                  "2학년", true,  3, dept.getId()));
            curriculumRepo.save(makeCurriculum("응용 프로젝트",              "2학년", false, 3, dept.getId()));
            curriculumRepo.save(makeCurriculum("산학협력 세미나",            "3학년", false, 2, dept.getId()));
            curriculumRepo.save(makeCurriculum("캡스톤 디자인",              "4학년", true,  4, dept.getId()));
        });
    }

    private University saveUniv(String name, String desc) {
        University u = new University();
        u.setName(name);
        u.setDescription(desc);
        return universityRepo.save(u);
    }

    private CollegeSchool saveSchool(String name, String desc, Long univId) {
        CollegeSchool s = new CollegeSchool();
        s.setName(name);
        s.setDescription(desc);
        s.setUniversityId(univId);
        return schoolRepo.save(s);
    }

    private FacultyGroup saveFaculty(String name, Long schoolId) {
        FacultyGroup f = new FacultyGroup();
        f.setName(name);
        f.setSchoolId(schoolId);
        return facultyRepo.save(f);
    }

    private Department saveDept(String name, Long facultyId, String desc, String addr, String phone, String email, String hours) {
        Department d = new Department();
        d.setName(name);
        d.setFacultyId(facultyId);
        d.setDescription(desc);
        d.setAddress(addr);
        d.setPhone(phone);
        d.setEmail(email);
        d.setHours(hours);
        return deptRepo.save(d);
    }

    private Professor makeProfessor(String specialty, String email, Long deptId) {
        Professor p = new Professor();
        p.setName("교수");
        p.setSpecialty(specialty);
        p.setEmail(email);
        p.setDeptId(deptId);
        return p;
    }

    private CurriculumItem makeCurriculum(String name, String year, boolean required, int credits, Long deptId) {
        CurriculumItem c = new CurriculumItem();
        c.setName(name);
        c.setYear(year);
        c.setRequired(required);
        c.setCredits(credits);
        c.setDeptId(deptId);
        return c;
    }
}
