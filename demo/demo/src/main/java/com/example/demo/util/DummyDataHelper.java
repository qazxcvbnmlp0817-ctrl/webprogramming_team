package com.example.demo.util;

import com.example.demo.dto.*;
import java.util.List;

/**
 * 더미 데이터 저장소 (DB 연동 전 임시 사용)
 * 전환 시: 각 컨트롤러에서 이 클래스 대신 Service 주입으로 교체
 *
 * 계층: 대학교(UniversityDto) → 단과대학(SchoolDto) → 학부(FacultyDto) → 학과(DeptSelectionDto)
 */
public class DummyDataHelper {

    private static final List<UniversityDto> UNIVERSITIES = List.of(

        // ── 목포대학교 ─────────────────────────────────────────────────
        new UniversityDto(1L, "목포대학교", "서남권 중심 국립대학교", List.of(
            new SchoolDto(1L, "공과대학", "공학 분야 전문 인재 양성", List.of(
                new FacultyDto(1L, "정보통신공학부", 1L, List.of(
                    new DeptSelectionDto(1L,  "컴퓨터공학과",   1L),
                    new DeptSelectionDto(2L,  "전기전자공학과", 1L),
                    new DeptSelectionDto(3L,  "정보통신공학과", 1L)
                )),
                new FacultyDto(2L, "기계시스템공학부", 1L, List.of(
                    new DeptSelectionDto(4L,  "기계공학과",     2L),
                    new DeptSelectionDto(5L,  "토목환경공학과", 2L)
                ))
            )),
            new SchoolDto(2L, "인문대학", "인문학적 소양과 창의적 사고 함양", List.of(
                new FacultyDto(3L, "인문학부", 2L, List.of(
                    new DeptSelectionDto(6L,  "국어국문학과", 3L),
                    new DeptSelectionDto(7L,  "영어영문학과", 3L),
                    new DeptSelectionDto(8L,  "사학과",       3L)
                ))
            )),
            new SchoolDto(3L, "사회과학대학", "사회 현상 분석과 문제 해결 능력 배양", List.of(
                new FacultyDto(4L, "사회과학부", 3L, List.of(
                    new DeptSelectionDto(9L,  "행정학과", 4L),
                    new DeptSelectionDto(10L, "경제학과", 4L),
                    new DeptSelectionDto(11L, "사회학과", 4L)
                ))
            )),
            new SchoolDto(4L, "자연과학대학", "기초과학 연구와 응용과학 발전 선도", List.of(
                new FacultyDto(5L, "자연과학부", 4L, List.of(
                    new DeptSelectionDto(12L, "수학과",   5L),
                    new DeptSelectionDto(13L, "물리학과", 5L),
                    new DeptSelectionDto(14L, "화학과",   5L)
                ))
            )),
            new SchoolDto(5L, "사범대학", "미래 교육을 이끌 전문 교사 양성", List.of(
                new FacultyDto(6L, "사범학부", 5L, List.of(
                    new DeptSelectionDto(15L, "교육학과",   6L),
                    new DeptSelectionDto(16L, "수학교육과", 6L)
                ))
            )),
            new SchoolDto(6L, "해양수산대학", "해양 자원 개발과 수산 분야 전문 인재 육성", List.of(
                new FacultyDto(7L, "해양수산학부", 6L, List.of(
                    new DeptSelectionDto(17L, "해양시스템공학과", 7L),
                    new DeptSelectionDto(18L, "수산생명과학과",   7L)
                ))
            ))
        )),

        // ── 순천대학교 ─────────────────────────────────────────────────
        new UniversityDto(2L, "순천대학교", "남도 문화와 학문의 중심", List.of(
            new SchoolDto(7L, "인문사회과학대학", "인문·사회 통합 교육", List.of(
                new FacultyDto(8L, "인문사회학부", 7L, List.of(
                    new DeptSelectionDto(19L, "국어국문학과", 8L),
                    new DeptSelectionDto(20L, "행정학과",     8L)
                ))
            )),
            new SchoolDto(8L, "공과대학", "첨단 기술 연구와 산학협력 선도", List.of(
                new FacultyDto(9L, "공학부", 8L, List.of(
                    new DeptSelectionDto(21L, "컴퓨터공학과", 9L),
                    new DeptSelectionDto(22L, "전기공학과",   9L)
                ))
            ))
        ))
    );

    public static List<UniversityDto> getUniversities() {
        return UNIVERSITIES;
    }

    public static UniversityDto findUniversity(Long id) {
        return UNIVERSITIES.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    /** 전체 대학교를 탐색하여 단과대학 ID로 SchoolDto를 찾는다 */
    public static SchoolDto findSchool(Long id) {
        return UNIVERSITIES.stream()
                .flatMap(u -> u.getSchools().stream())
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}
