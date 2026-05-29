package com.example.demo.util;

import com.example.demo.entity.Department;
import com.example.demo.entity.DeptPageContent;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.DeptPageContentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(5)
public class DeptPageContentInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DeptPageContentRepository contentRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public DeptPageContentInitializer(DepartmentRepository departmentRepository,
                                       DeptPageContentRepository contentRepository) {
        this.departmentRepository = departmentRepository;
        this.contentRepository = contentRepository;
    }

    @Override
    public void run(String... args) {
        for (Department dept : departmentRepository.findAll()) {
            if (contentRepository.existsById(dept.getId())) continue;

            DeptPageContent c = new DeptPageContent();
            c.setDeptId(dept.getId());
            seedHero(c, dept.getName());
            c.setUpdatedAt(LocalDateTime.now());
            c.setUpdatedBy("system");
            contentRepository.save(c);
        }
    }

    private void seedHero(DeptPageContent c, String name) {
        String lower = name != null ? name.toLowerCase() : "";

        if (lower.contains("컴퓨터") || lower.contains("소프트웨어") || lower.contains("정보")) {
            c.setSlogan("코드와 데이터로 문제를 해결하는 실전형 소프트웨어 허브");
            c.setKeywordsJson(toJson(List.of("AI", "웹개발", "데이터", "정보보안", "클라우드")));
        } else if (lower.contains("전기") || lower.contains("전자") || lower.contains("전기전자")) {
            c.setSlogan("에너지와 신호로 세상을 연결하는 전기전자 허브");
            c.setKeywordsJson(toJson(List.of("회로설계", "임베디드", "신호처리", "전력시스템", "IoT")));
        } else if (lower.contains("기계") || lower.contains("메카트로닉스")) {
            c.setSlogan("설계와 제조로 미래를 만드는 기계공학 허브");
            c.setKeywordsJson(toJson(List.of("CAD/CAM", "열역학", "유체역학", "로보틱스", "스마트제조")));
        } else if (lower.contains("화학") || lower.contains("신소재") || lower.contains("재료")) {
            c.setSlogan("물질의 본질을 탐구하는 화학·신소재 허브");
            c.setKeywordsJson(toJson(List.of("유기화학", "고분자", "나노재료", "반도체", "에너지소재")));
        } else if (lower.contains("경영") || lower.contains("경제") || lower.contains("회계")) {
            c.setSlogan("데이터와 전략으로 비즈니스를 이끄는 경영 허브");
            c.setKeywordsJson(toJson(List.of("마케팅", "재무", "전략경영", "스타트업", "빅데이터")));
        } else if (lower.contains("디자인") || lower.contains("미술") || lower.contains("시각")) {
            c.setSlogan("창의와 기술이 만나는 디자인 허브");
            c.setKeywordsJson(toJson(List.of("UX/UI", "브랜딩", "영상", "그래픽", "인터랙션")));
        } else if (lower.contains("건축") || lower.contains("도시")) {
            c.setSlogan("공간을 설계하고 도시를 바꾸는 건축 허브");
            c.setKeywordsJson(toJson(List.of("설계", "구조", "도시계획", "BIM", "지속가능건축")));
        } else if (lower.contains("물리") || lower.contains("수학") || lower.contains("통계")) {
            c.setSlogan("수와 논리로 세상의 원리를 밝히는 기초과학 허브");
            c.setKeywordsJson(toJson(List.of("수리통계", "물리학", "데이터사이언스", "이론수학", "양자역학")));
        } else if (lower.contains("생명") || lower.contains("생물") || lower.contains("바이오")) {
            c.setSlogan("생명의 비밀을 탐구하는 바이오 허브");
            c.setKeywordsJson(toJson(List.of("유전공학", "바이오인포", "세포생물학", "의약", "분자생물")));
        } else if (lower.contains("간호") || lower.contains("의") || lower.contains("보건")) {
            c.setSlogan("사람을 살리는 의료·보건 허브");
            c.setKeywordsJson(toJson(List.of("임상간호", "보건행정", "의료정보", "공중보건", "지역사회")));
        } else if (lower.contains("어") || lower.contains("언어") || lower.contains("문학")) {
            c.setSlogan("언어와 문화로 세계를 잇는 인문 허브");
            c.setKeywordsJson(toJson(List.of("언어학", "문학", "글로벌커뮤니케이션", "번역", "문화콘텐츠")));
        } else {
            c.setSlogan(name + " - 전문성과 실무로 미래를 이끄는 허브");
            c.setKeywordsJson(toJson(List.of("전공심화", "실무역량", "취업·진로", "연구·개발")));
        }
    }

    private String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
}
