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

    /** univId 기반 대학 전체 공지사항 */
    public static List<NoticeDto> getUniversityNotices(Long univId) {
        String univName = UNIVERSITIES.stream()
                .filter(u -> u.getId().equals(univId))
                .map(UniversityDto::getName)
                .findFirst().orElse("대학교");
        long base = univId * 1000;
        return List.of(
            new NoticeDto(base+1, "[공지] " + univName + " 2026년 1학기 학사 일정 안내",      "2026-05-11", univName + " 학사처",      "학사", 520, true,  List.of(1,2,3,4)),
            new NoticeDto(base+2, univName + " 2026년 하계 방학 기간 및 학사 운영 안내",       "2026-05-09", univName + " 학사처",      "학사", 380, false, List.of(1,2,3,4)),
            new NoticeDto(base+3, univName + " 장학생 선발 공고 (교내 성적 장학금)",           "2026-05-07", univName + " 장학처",      "장학", 295, false, List.of(1,2,3,4)),
            new NoticeDto(base+4, univName + " 2026 대학 축제 '목포제' 개최 안내",             "2026-05-05", univName + " 학생처",      "행사", 210, false, List.of(1,2,3,4)),
            new NoticeDto(base+5, univName + " 취업지원센터 채용설명회 일정 공지",             "2026-05-03", univName + " 취업지원센터", "취업", 175, false, List.of(3,4)),
            new NoticeDto(base+6, univName + " 도서관 이용 시간 변경 안내",                    "2026-05-01", univName + " 도서관",      "학사", 140, false, List.of(1,2,3,4)),
            new NoticeDto(base+7, univName + " 2026년 하계 계절학기 수강신청 안내",            "2026-04-29", univName + " 학사처",      "학사", 118, false, List.of(1,2,3,4)),
            new NoticeDto(base+8, univName + " 교내 창업경진대회 참가 모집",                   "2026-04-27", univName + " 창업지원단",  "행사",  93, false, List.of(2,3,4))
        );
    }

    /** univId 기반 대학 전체 게시글 */
    public static List<PostDto> getUniversityPosts(Long univId) {
        String univName = UNIVERSITIES.stream()
                .filter(u -> u.getId().equals(univId))
                .map(UniversityDto::getName)
                .findFirst().orElse("대학교");
        long base = univId * 1000;
        return List.of(
            new PostDto(base+2, univName + " 재학생이 추천하는 교양 과목 모음",    "재학생A",  88, "자유게시판", 620, "2026-05-10", true,  42, false, "https://picsum.photos/seed/univ1/200/150", List.of(1,2,3,4), "public"),
            new PostDto(base+3, univName + " 기숙사 생활 꿀팁 공유",              "기숙사生",  72, "자유게시판", 530, "2026-05-08", false, 35, false, null,                                         List.of(1,2,3,4), "public"),
            new PostDto(base+4, "삼성 SDS 2026 상반기 인턴 합격 후기",           "졸업생B",   65, "취업후기",   480, "2026-05-06", false, 28, false, "https://picsum.photos/seed/univ2/200/150", List.of(3,4),     "grade"),
            new PostDto(base+5, univName + " 도서관 스터디룸 예약 꿀팁",          "재학생C",   50, "자유게시판", 390, "2026-05-04", false, 21, false, null,                                         List.of(1,2,3,4), "public"),
            new PostDto(base+6, "전공 불문 스터디 모집 (TOEIC 900+ 목표)",        "재학생D",   43, "스터디",     310, "2026-05-02", false, 15, false, null,                                         List.of(1,2,3,4), "public"),
            new PostDto(base+7, univName + " 학식 메뉴 개선 건의합니다",          "재학생E",   38, "자유게시판", 260, "2026-04-30", false, 55, false, null,                                         List.of(1,2,3,4), "public"),
            new PostDto(base+8, "공모전 같이 나갈 팀원 구합니다 (디자인·개발)",   "재학생F",   30, "스터디",     200, "2026-04-28", false, 18, false, null,                                         List.of(2,3,4),   "grade"),
            new PostDto(base+9, "교수님 추천서 부탁드리는 방법 질문",             "재학생G",   22, "질문",       160, "2026-04-26", false, 12, false, null,                                         List.of(1,2,3,4), "public"),
            new PostDto(base+10,"대학원 진학 vs 취업 고민 중입니다",              "재학생H",   18, "자유게시판", 140, "2026-04-24", false, 30, false, null,                                         List.of(3,4),     "grade")
        );
    }

    /** univId 기반 대학 전체 일정 */
    public static List<ScheduleDto> getUniversitySchedules(Long univId) {
        long base = univId * 1000;
        return List.of(
            new ScheduleDto(base+1, "1학기 중간고사",          "2026-05-12",  1, "시험"),
            new ScheduleDto(base+2, "수강신청 정정기간",        "2026-05-19",  8, "학사"),
            new ScheduleDto(base+3, "대학 축제 목포제",         "2026-05-28", 17, "행사"),
            new ScheduleDto(base+4, "1학기 기말고사",           "2026-06-16", 36, "시험"),
            new ScheduleDto(base+5, "하계 방학 시작",           "2026-06-27", 47, "학사"),
            new ScheduleDto(base+6, "계절학기 수강신청",        "2026-07-01", 51, "학사"),
            new ScheduleDto(base+7, "졸업논문 최종 제출 마감",  "2026-07-10", 60, "학사"),
            new ScheduleDto(base+8, "2학기 수강신청 시작",      "2026-07-21", 71, "학사")
        );
    }

    /** 학부 ID로 학부명을 조회한다 */
    public static String findFacultyName(Long facultyId) {
        return UNIVERSITIES.stream()
                .flatMap(u -> u.getSchools().stream())
                .flatMap(s -> s.getFaculties().stream())
                .filter(f -> f.getId().equals(facultyId))
                .map(FacultyDto::getName)
                .findFirst()
                .orElse("학부");
    }

    /** facultyId 기반 공지사항 목록 생성 */
    public static List<NoticeDto> getNoticesByFaculty(Long facultyId) {
        String faculty = findFacultyName(facultyId);
        long base = facultyId * 400;
        return List.of(
            new NoticeDto(base+1, "[긴급] " + faculty + " 2026년 1학기 수강정정 기간 안내", "2026-05-11", faculty + " 사무실", "학사", (int)(300 + facultyId * 7), true,  List.of(1,2,3,4)),
            new NoticeDto(base+2, faculty + " 2026년 1학기 학부 행사 안내",                 "2026-05-08", faculty + " 사무실", "행사", (int)(200 + facultyId * 5), false, List.of(1,2,3,4)),
            new NoticeDto(base+3, faculty + " 졸업논문 심사 일정 안내",                     "2026-05-06", faculty + " 사무실", "학사", (int)(150 + facultyId * 3), false, List.of(4)),
            new NoticeDto(base+4, faculty + " 장학금 신청 안내 (5월 15일까지)",             "2026-05-04", "학생처",             "장학", (int)(100 + facultyId * 2), false, List.of(1,2,3,4)),
            new NoticeDto(base+5, faculty + " 실험실 안전교육 일정 공지",                   "2026-05-02", faculty + " 사무실", "학사",  (int)(80 + facultyId),     false, List.of(1,2,3,4)),
            new NoticeDto(base+6, faculty + " 산학협력 세미나 개최 안내",                   "2026-04-30", faculty + " 사무실", "행사",  (int)(60 + facultyId),     false, List.of(3,4)),
            new NoticeDto(base+7, faculty + " 졸업작품 심사 일정 공지",                     "2026-04-28", faculty + " 사무실", "학사",  (int)(40 + facultyId),     false, List.of(4)),
            new NoticeDto(base+8, faculty + " 교내 해커톤 참가 모집",                       "2026-04-25", "학생처",             "취업",  (int)(25 + facultyId),     false, List.of(2,3,4))
        );
    }

    /** facultyId 기반 일정 목록 생성 */
    public static List<ScheduleDto> getSchedulesByFaculty(Long facultyId) {
        String faculty = findFacultyName(facultyId);
        long base = facultyId * 500;
        return List.of(
            new ScheduleDto(base+1, faculty + " 중간고사 시작",      "2026-05-12",  1, "시험"),
            new ScheduleDto(base+2, faculty + " 학부 프로젝트 발표", "2026-05-20",  9, "학사"),
            new ScheduleDto(base+3, faculty + " 수강신청 변경기간",  "2026-05-25", 14, "학사"),
            new ScheduleDto(base+4, faculty + " 학부 연합 행사",     "2026-06-01", 21, "행사"),
            new ScheduleDto(base+5, faculty + " 기말고사 시작",      "2026-06-16", 36, "시험"),
            new ScheduleDto(base+6, faculty + " 기말고사 종료",      "2026-06-20", 40, "시험"),
            new ScheduleDto(base+7, faculty + " 여름 방학 시작",     "2026-06-27", 47, "학사"),
            new ScheduleDto(base+8, faculty + " 졸업논문 제출 마감", "2026-07-15", 65, "학사")
        );
    }

    /** facultyId 기반 게시글 목록 생성 */
    public static List<PostDto> getPostsByFaculty(Long facultyId) {
        String faculty = findFacultyName(facultyId);
        long base = facultyId * 300;
        return List.of(
            new PostDto(base+2,  faculty + " 학부 봄 행사 안내",                           "학부사무실", 55,                    "자유게시판", (int)(400+facultyId*5), "2026-05-08", true,  22, false, "https://picsum.photos/seed/fac" + facultyId + "a/200/150", List.of(1,2,3,4), "public"),
            new PostDto(base+3,  faculty + " 학부 연합 스터디 모집",                        "재학생A",    42,                    "스터디",     (int)(300+facultyId*4), "2026-05-06", false, 18, false, null,                                                           List.of(1,2,3,4), "public"),
            new PostDto(base+4,  faculty + " 관련 기업 인턴십 합격 후기",                  "졸업생",     35,                    "취업후기",   (int)(250+facultyId*3), "2026-05-04", false, 14, false, "https://picsum.photos/seed/fac" + facultyId + "b/200/150", List.of(3,4),     "grade"),
            new PostDto(base+5,  faculty + " 전공 기초 질문있어요",                         "1학년",      28,                    "질문",       (int)(180+facultyId*2), "2026-05-02", false, 10, false, null,                                                           List.of(1),       "grade"),
            new PostDto(base+6,  faculty + " 졸업논문 주제 추천 부탁드립니다",              "4학년",      22,                    "질문",       (int)(140+facultyId),   "2026-04-30", false,  8, false, null,                                                           List.of(4),       "grade"),
            new PostDto(base+7,  faculty + " 학부 MT 후기",                                "재학생B",    18,                    "자유게시판", (int)(110+facultyId),   "2026-04-28", false, 25, false, null,                                                           List.of(1,2,3,4), "public"),
            new PostDto(base+8,  faculty + " 관련 공모전 팀원 구합니다",                   "재학생C",    15,                    "스터디",      (int)(80+facultyId),   "2026-04-26", false,  6, false, null,                                                           List.of(2,3,4),   "grade"),
            new PostDto(base+9,  faculty + " 대학원 진학 상담 후기",                       "졸업생B",    12,                    "취업후기",    (int)(60+facultyId),   "2026-04-24", false,  9, false, null,                                                           List.of(3,4),     "grade"),
            new PostDto(base+10, faculty + " 학부 추천 도서 목록",                         "선배",        8,                    "자유게시판",  (int)(40+facultyId),   "2026-04-22", false,  3, false, null,                                                           List.of(1,2,3,4), "public")
        );
    }

    /** 학과 ID로 학과명을 조회한다 */
    public static String findDeptName(Long deptId) {
        return UNIVERSITIES.stream()
                .flatMap(u -> u.getSchools().stream())
                .flatMap(s -> s.getFaculties().stream())
                .flatMap(f -> f.getDepts().stream())
                .filter(d -> d.getId().equals(deptId))
                .map(DeptSelectionDto::getName)
                .findFirst()
                .orElse("학과");
    }

    /** deptId 기반 공지사항 목록 생성 */
    public static List<NoticeDto> getNoticesByDept(Long deptId) {
        String dept = findDeptName(deptId);
        long base = deptId * 100;
        return List.of(
            new NoticeDto(base+1, "[긴급] " + dept + " 2026년 1학기 수강정정 기간 안내", "2026-05-11", dept + " 사무실", "학사", (int)(200 + deptId * 7), true,  List.of(1,2,3,4)),
            new NoticeDto(base+2, dept + " 2026년 1학기 수강신청 일정 안내",              "2026-05-08", dept + " 사무실", "학사", (int)(100 + deptId * 5), false, List.of(1,2,3,4)),
            new NoticeDto(base+3, dept + " 졸업논문 제출 마감 안내",                      "2026-05-06", dept + " 사무실", "학사",  (int)(80 + deptId * 3), false, List.of(4)),
            new NoticeDto(base+4, dept + " 장학금 신청 안내 (5월 15일까지)",              "2026-05-04", "학생처",         "장학",  (int)(60 + deptId * 2), false, List.of(1,2,3,4)),
            new NoticeDto(base+5, dept + " 실험실 안전교육 일정 공지",                    "2026-05-02", dept + " 사무실", "학사",  (int)(40 + deptId),     false, List.of(1,2,3,4)),
            new NoticeDto(base+6, dept + " 산학협력 세미나 개최 안내",                    "2026-04-30", dept + " 사무실", "행사",  (int)(30 + deptId),     false, List.of(3,4)),
            new NoticeDto(base+7, dept + " 졸업작품 심사 일정 공지",                      "2026-04-28", dept + " 사무실", "학사",  (int)(25 + deptId),     false, List.of(4)),
            new NoticeDto(base+8, dept + " 교내 해커톤 참가 모집",                        "2026-04-25", "학생처",         "행사",  (int)(15 + deptId),     false, List.of(2,3,4))
        );
    }

    /** deptId 기반 게시글 목록 생성 */
    public static List<PostDto> getPostsByDept(Long deptId) {
        String dept = findDeptName(deptId);
        long base = deptId * 100;
        return List.of(
            new PostDto(base+2,  dept + " 중간고사 족보 공유합니다",              "익명",       (int)(40+deptId*2), "자유게시판", (int)(300+deptId*5), "2026-05-01", true,  18, false, "https://picsum.photos/seed/" + deptId + "a/200/150", List.of(1,2,3,4), "public"),
            new PostDto(base+3,  dept + " 관련 기업 인턴십 합격 후기",           "졸업생",     (int)(30+deptId),   "취업후기",  (int)(250+deptId*4), "2026-04-28", false, 25, false, null,                                                    List.of(3,4),     "grade"),
            new PostDto(base+4,  dept + " 스터디 같이 할 분 모집",               "재학생",     (int)(20+deptId),   "스터디",    (int)(140+deptId*3), "2026-04-25", false,  7, false, "https://picsum.photos/seed/" + deptId + "b/200/150", List.of(1,2,3,4), "public"),
            new PostDto(base+5,  dept + " 졸업프로젝트 팀원 구합니다",           "4학년",      (int)(15+deptId),   "자유게시판",  (int)(90+deptId*2), "2026-04-20", false, 33, false, null,                                                    List.of(4),       "grade"),
            new PostDto(base+6,  dept + " 교수님 연구실 인턴 모집",              "교수",       (int)(10+deptId),   "취업후기",    (int)(70+deptId),   "2026-04-18", false,  3, false, null,                                                    List.of(1,2,3,4), "public"),
            new PostDto(base+7,  dept + " 전공 과목 질문있어요",                 "1학년",       (int)(8+deptId),   "질문",        (int)(40+deptId),   "2026-04-15", false,  6, false, null,                                                    List.of(1),       "grade"),
            new PostDto(base+8,  dept + " 전공 스터디원 모집",                   "2학년",       (int)(6+deptId),   "스터디",      (int)(30+deptId),   "2026-04-12", false,  4, false, null,                                                    List.of(2),       "grade"),
            new PostDto(base+9,  dept + " 취업 준비 팁 공유",                    "3학년",       (int)(4+deptId),   "취업후기",    (int)(25+deptId),   "2026-04-10", false,  9, false, null,                                                    List.of(3,4),     "grade"),
            new PostDto(base+10, dept + " 1학년 수강신청 추천 조합",             "선배",        (int)(3+deptId),   "자유게시판",  (int)(15+deptId),   "2026-04-08", false,  2, false, null,                                                    List.of(1),       "grade")
        );
    }

    /** deptId 기반 일정 목록 생성 */
    public static List<ScheduleDto> getSchedulesByDept(Long deptId) {
        String dept = findDeptName(deptId);
        long base = deptId * 100;
        return List.of(
            new ScheduleDto(base+1, dept + " 중간고사 시작",      "2026-05-12",  1, "시험"),
            new ScheduleDto(base+2, dept + " 프로젝트 발표",      "2026-05-20",  9, "학사"),
            new ScheduleDto(base+3, dept + " 수강신청 변경기간",   "2026-05-25", 14, "학사"),
            new ScheduleDto(base+4, dept + " 학과 축제",          "2026-06-01", 21, "행사"),
            new ScheduleDto(base+5, dept + " 기말고사 시작",      "2026-06-16", 36, "시험"),
            new ScheduleDto(base+6, dept + " 기말고사 종료",      "2026-06-20", 40, "시험"),
            new ScheduleDto(base+7, dept + " 여름 방학 시작",     "2026-06-27", 47, "학사"),
            new ScheduleDto(base+8, dept + " 졸업논문 제출 마감", "2026-07-15", 65, "학사")
        );
    }

    /** 학과 ID로 DepartmentDetailDto를 반환한다 (더미 데이터) */
    public static DepartmentDetailDto findDepartmentDetail(Long id) {
        String deptName = UNIVERSITIES.stream()
                .flatMap(u -> u.getSchools().stream())
                .flatMap(s -> s.getFaculties().stream())
                .flatMap(f -> f.getDepts().stream())
                .filter(d -> d.getId().equals(id))
                .map(DeptSelectionDto::getName)
                .findFirst()
                .orElse(null);

        if (deptName == null) return null;

        List<ProfessorDto> professors = List.of(
            new ProfessorDto(id * 10 + 1, "김○○ 교수", deptName + " / 이론 및 기초", "prof1_" + id + "@mokpo.ac.kr"),
            new ProfessorDto(id * 10 + 2, "이○○ 교수", deptName + " / 응용 및 실무", "prof2_" + id + "@mokpo.ac.kr"),
            new ProfessorDto(id * 10 + 3, "박○○ 교수", deptName + " / 연구 및 개발", "prof3_" + id + "@mokpo.ac.kr")
        );

        List<CurriculumItemDto> curriculum = List.of(
            new CurriculumItemDto(deptName + " 개론",  "1학년", true,  3),
            new CurriculumItemDto("전공기초 실습",      "1학년", true,  2),
            new CurriculumItemDto("심화 이론",          "2학년", true,  3),
            new CurriculumItemDto("응용 프로젝트",      "2학년", false, 3),
            new CurriculumItemDto("산학협력 세미나",    "3학년", false, 2),
            new CurriculumItemDto("캡스톤 디자인",      "4학년", true,  4)
        );

        return new DepartmentDetailDto(
            id, deptName,
            deptName + "는 이론과 실무를 균형 있게 교육하여 해당 분야의 전문 인재를 양성합니다. " +
            "다양한 교과 과정과 산학협력 프로그램을 통해 학생들의 실전 역량을 강화합니다.",
            professors, curriculum,
            "전남 목포시 영산로 1666 국립목포대학교 " + deptName + " 사무실",
            "061-450-" + String.format("%04d", id * 100 % 10000),
            "dept" + id + "@mokpo.ac.kr",
            "평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)",
            null
        );
    }
}
