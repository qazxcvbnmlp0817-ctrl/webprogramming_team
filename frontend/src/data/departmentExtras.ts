export interface CareerItem {
  category: string
  jobs: string[]
  description: string
  preparation?: string[]
  courses?: string[]
  portfolio?: string
}

export interface FacilityItem {
  name: string
  location: string
  description: string
  activities?: string[]
}

export interface FaqItem {
  category?: string
  question: string
  answer: string
}

export interface StudentLifeItem {
  title: string
  description: string
  href: string
  external?: boolean
}

export interface ProfessorEnhancement {
  lab: string
  courses: string[]
}

export interface RequirementItem {
  id: string
  label: string
  description: string
  href: string
  kind: 'anchor' | 'route'
}

export interface GuideCard {
  title: string
  description: string
  action: string
  icon: string
}

export interface DepartmentExtra {
  deptId: number
  slogan: string
  keywords: string[]
  homepage?: string
  guideCards: GuideCard[]
  overviewCounts: {
    notices: number
    schedules: number
  }
  careers: CareerItem[]
  facilities: FacilityItem[]
  faqs: FaqItem[]
  studentLife: StudentLifeItem[]
  professorEnhancements: ProfessorEnhancement[]
  requirements: RequirementItem[]
}

type ExtraTemplate = Omit<DepartmentExtra, 'deptId'>

// ── 공통 기본값 ──────────────────────────────────────────────────────────────

const defaultStudentLife: StudentLifeItem[] = [
  { title: '학사일정', description: '수강신청, 시험, 휴보강 일정을 한 번에 확인합니다.', href: '/dept/schedule' },
  { title: '공지사항', description: '학과 공지와 장학, 행사 안내를 빠르게 확인합니다.', href: '/dept/notice' },
  { title: '자유게시판', description: '수업, 팀플, 학교생활 질문을 남길 수 있습니다.', href: '/dept/board' },
  { title: 'Q&A 준비', description: '자주 묻는 행정 질문을 모아둘 내부 메뉴입니다.', href: '/dept/board' },
]

const defaultGuideCards: GuideCard[] = [
  { title: '처음 보는 학과 정리', description: '학과 소개와 핵심 키워드로 내 전공 방향을 5분 안에 파악합니다.', action: '학과 소개 읽기', icon: 'fa-magnifying-glass' },
  { title: '수강 흐름 잡기', description: '학년별 과목 순서와 전공 분류를 필터로 빠르게 확인합니다.', action: '교육과정 필터 보기', icon: 'fa-route' },
  { title: '진로·자격증 탐색', description: '전공을 어떤 직무·자격증으로 연결할 수 있는지 카드로 확인합니다.', action: '진로 카드 보기', icon: 'fa-briefcase' },
  { title: '공지·상담 동선', description: '학과 공지, 사무실 연락처, 게시판으로 이어지는 이동 경로를 모았습니다.', action: '빠른 링크 이동', icon: 'fa-comments' },
]

const defaultRequirements: RequirementItem[] = [
  { id: 'curriculum', label: '교육과정 확인하기', description: '학년별 과목과 전공 분류를 먼저 확인합니다.', href: '#curriculum', kind: 'anchor' },
  { id: 'notice', label: '졸업 공지 확인하기', description: '졸업 기준과 제출 일정은 학과 공지에서 최종 확인합니다.', href: '/dept/notice', kind: 'route' },
  { id: 'contact', label: '상담/문의 확인하기', description: '학과 사무실 연락처와 문의 동선을 확인합니다.', href: '#contact', kind: 'anchor' },
  { id: 'careers', label: '진로·자격증 보기', description: '전공별 진로와 준비 항목을 학생용 가이드로 확인합니다.', href: '#careers', kind: 'anchor' },
  { id: 'board', label: '질문 남기기', description: '확실하지 않은 정보는 게시판에서 질문하거나 제보합니다.', href: '/dept/board', kind: 'route' },
]

// ── 카테고리 템플릿 ───────────────────────────────────────────────────────────

const computerTemplate: ExtraTemplate = {
  slogan: '코드와 데이터로 문제를 해결하는 실전형 소프트웨어 허브',
  keywords: ['AI', '웹개발', '데이터', '정보보안', '클라우드'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 12, schedules: 4 },
  careers: [
    {
      category: '개발',
      jobs: ['프론트엔드 개발자', '백엔드 개발자', '앱 개발자', '클라우드 엔지니어'],
      description: '웹, 모바일, 서버, 클라우드 환경에서 서비스를 설계하고 구현하는 진로입니다.',
      preparation: ['Git/GitHub 사용 습관', 'REST API와 DB 기초', '팀 프로젝트 경험'],
      courses: ['웹프로그래밍', '소프트웨어공학', '데이터베이스'],
      portfolio: '학과 커뮤니티, 예약 시스템, 게시판 같은 실제 사용자 흐름이 있는 웹서비스',
    },
    {
      category: '데이터/AI',
      jobs: ['데이터 엔지니어', 'AI 엔지니어', '머신러닝 개발자', '데이터 분석가'],
      description: '데이터 수집부터 모델링, 분석, 서비스 적용까지 연결하는 역량을 키웁니다.',
      preparation: ['파이썬 분석 노트북', '모델 성능 비교 기록', '데이터 전처리 경험'],
      courses: ['인공지능', '자료구조', '알고리즘'],
      portfolio: '공공데이터 분석 대시보드, 추천 모델, 이미지 분류 미니 프로젝트',
    },
    {
      category: '보안/인프라',
      jobs: ['보안전문가', '네트워크 엔지니어', '시스템 엔지니어', 'DevOps 엔지니어'],
      description: '서비스가 안정적으로 운영되도록 네트워크, 시스템, 보안을 다루는 분야입니다.',
      preparation: ['Linux 기본 명령', '네트워크 구조 이해', '취약점 분석 실습'],
      courses: ['정보보호', '컴퓨터네트워크', '운영체제'],
      portfolio: '로그 분석, 간단한 침해 대응 보고서, Docker 배포 자동화 기록',
    },
  ],
  facilities: [
    { name: 'AI 실습실', location: '공과대학 실습 공간', description: '인공지능, 데이터 분석, 모델 실험을 위한 프로젝트형 실습 공간입니다.', activities: ['모델 학습 실험', '데이터 분석 과제', 'AI 스터디'] },
    { name: 'SW 프로젝트실', location: '학과 공동 실습 공간', description: '팀 프로젝트, 캡스톤디자인, 스터디 활동에 어울리는 협업 공간입니다.', activities: ['캡스톤 회의', 'Git 협업', '서비스 시연 준비'] },
    { name: '네트워크 실습실', location: '전공 실습실', description: '서버, 네트워크, 보안 실습을 연결해 보는 장비 중심 공간입니다.', activities: ['패킷 분석', '서버 구축', '보안 실습'] },
  ],
  faqs: [
    { category: '수강', question: '프로그래밍을 처음 배워도 따라갈 수 있나요?', answer: '1학년 기초 과목부터 시작하도록 구성되어 있습니다. 입학 전에는 파이썬이나 웹 기초를 가볍게 익히면 도움이 됩니다.' },
    { category: '졸업', question: '졸업작품은 어떻게 준비하나요?', answer: '보통 팀 단위 프로젝트로 준비하며, 주제 선정부터 설계, 구현, 발표까지 단계적으로 진행합니다.' },
    { category: '학사', question: '전공필수 과목은 어디서 확인하나요?', answer: '학과 교육과정 표와 수강신청 안내를 함께 확인하는 것이 안전합니다. 이 페이지는 공식 기준을 확인할 위치로 이동하는 안내 허브입니다.' },
    { category: '진로', question: '취업 준비는 언제부터 시작하면 좋나요?', answer: '2학년부터 Git, 포트폴리오, 기본 프로젝트를 쌓고 3학년 이후 인턴과 캡스톤을 연결하는 흐름을 권장합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: 'AI·데이터 연구실', courses: ['인공지능', '데이터베이스'] },
    { lab: '웹서비스 연구실', courses: ['웹프로그래밍', '소프트웨어공학'] },
    { lab: '보안·네트워크 연구실', courses: ['정보보호', '컴퓨터네트워크'] },
  ],
  requirements: defaultRequirements,
}

const electricalTemplate: ExtraTemplate = {
  slogan: '전력·기계·에너지 기술로 지역 산업과 에너지 전환을 잇는 공학 허브',
  keywords: ['전력', '회로', '제어', '에너지', '설비'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 9, schedules: 3 },
  careers: [
    {
      category: '전력/에너지',
      jobs: ['전기기사', '전력 엔지니어', '에너지 기업', '발전 설비 담당'],
      description: '전력 생산, 송배전, 에너지 설비 운영과 유지보수를 다룹니다.',
      preparation: ['전기기사 자격증 준비', '실험 보고서 관리', '설비 도면 읽기'],
      courses: ['전력공학', '전기기기', '회로이론'],
    },
    {
      category: '자동화/제어',
      jobs: ['제어시스템 엔지니어', '설비 엔지니어', '공정 자동화 담당', '로봇 엔지니어'],
      description: '센서, 회로, 제어 시스템을 활용해 산업 현장의 자동화를 설계합니다.',
      preparation: ['PLC 프로그래밍 기초', 'CAD 사용 경험', '현장 인턴십'],
      courses: ['제어공학', '자동화실험', '전자회로'],
    },
    {
      category: '공공/공기업',
      jobs: ['공기업 기술직', '전기직 공무원', '안전관리자', '시설 관리 담당'],
      description: '전공 자격증과 실무 지식을 기반으로 공공 인프라 분야로 진출합니다.',
      preparation: ['전기기사 취득', 'NCS 기출 풀이', '공기업 직무기술서 분석'],
      courses: ['전기설비', '안전공학', '전력계통'],
    },
  ],
  facilities: [
    { name: '전력실험실', location: '공학계열 실험 공간', description: '전력 변환, 송배전, 전기 설비 실습을 수행하는 공간입니다.', activities: ['전력변환 실험', '설비 측정', '전기기사 실기 준비'] },
    { name: '회로실습실', location: '전공 실습실', description: '기초 회로와 계측 장비 사용법을 익히는 실습 공간입니다.', activities: ['회로 설계', '오실로스코프 측정', '납땜 실습'] },
    { name: '제어시스템실', location: '프로젝트 실습 공간', description: '제어, 자동화, 센서 응용 프로젝트를 진행하는 공간입니다.', activities: ['PLC 프로그래밍', '모터 제어', '자동화 캡스톤'] },
  ],
  faqs: [
    { question: '전기기사 준비는 언제 시작하면 좋나요?', answer: '회로, 전기기기, 전력공학 기초를 들은 뒤 2학년 말부터 준비하면 학과 공부와 연결하기 좋습니다.' },
    { question: '실험 수업 비중이 큰가요?', answer: '전공 특성상 회로, 계측, 제어 관련 실습이 중요합니다. 실습 기록과 보고서 관리가 필요합니다.' },
    { question: '공기업 진로 준비는 어떻게 하나요?', answer: '전공 기사 자격증, NCS, 전공 필기, 인턴 경험을 함께 준비하는 흐름이 일반적입니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '전력에너지 연구실', courses: ['전력공학', '전기기기'] },
    { lab: '회로시스템 연구실', courses: ['회로이론', '전자회로'] },
    { lab: '제어자동화 연구실', courses: ['제어공학', '자동화실험'] },
  ],
  requirements: defaultRequirements,
}

const scienceTemplate: ExtraTemplate = {
  slogan: '자연 현상의 원리를 탐구하고 첨단 기술 혁신의 기반을 만드는 기초과학 허브',
  keywords: ['기초과학', '이론', '실험', '연구', '응용'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 8, schedules: 3 },
  careers: [
    {
      category: '연구/학계',
      jobs: ['대학원 연구원', '국책연구소 연구원', '기업 R&D 연구원', '박사후연구원'],
      description: '기초 원리와 이론을 바탕으로 학계·산업계 연구 분야로 진출합니다.',
      preparation: ['논문 작성 경험', '학부 연구실 인턴십', '대학원 준비'],
      courses: ['전공 핵심 과목', '수리통계', '실험설계'],
      portfolio: '학부 연구 프로젝트 보고서, 학회 포스터 발표 자료',
    },
    {
      category: '산업체 R&D',
      jobs: ['반도체 소자 엔지니어', '재료 분석가', '화학 연구원', '바이오소재 개발자'],
      description: '과학적 탐구 역량을 바탕으로 산업 현장의 기술 개발에 참여합니다.',
      preparation: ['분석 장비 운용 경험', '데이터 분석 역량', '인턴십'],
      courses: ['전공실험', '계측분석', '소재과학'],
    },
    {
      category: '데이터/분석',
      jobs: ['데이터 분석가', '계량 모델러', '금융공학 연구원', 'AI 연구원'],
      description: '수리적 분석 능력을 활용해 다양한 분야의 데이터 기반 직무에 진출합니다.',
      preparation: ['파이썬·R 프로그래밍', '통계 기초 탄탄히', '데이터 프로젝트'],
      courses: ['확률통계', '수치해석', '프로그래밍'],
    },
  ],
  facilities: [
    { name: '전공 실험실', location: '자연과학대학 실험 공간', description: '전공별 실험·실습을 수행하는 핵심 공간입니다.', activities: ['정밀 측정 실험', '분석 기기 실습', '연구 프로젝트'] },
    { name: '계산과학실', location: '전공 컴퓨팅 공간', description: '수치해석, 시뮬레이션, 데이터 분석을 수행하는 공간입니다.', activities: ['시뮬레이션', '데이터 분석', '프로그래밍 실습'] },
    { name: '세미나실', location: '학과 공동 공간', description: '연구 발표, 스터디, 대학원 준비 모임에 활용되는 공간입니다.', activities: ['논문 세미나', '대학원 준비 스터디', '발표 연습'] },
  ],
  faqs: [
    { question: '대학원 진학 준비는 어떻게 하나요?', answer: '학부 성적, 연구실 인턴십, 지도교수 추천서가 핵심입니다. 학부 3학년부터 관심 분야의 연구실 문을 두드리는 것을 권장합니다.' },
    { question: '이론 중심인가요, 실험 중심인가요?', answer: '학과마다 비중이 다르지만 이론과 실험이 함께 운영됩니다. 교육과정을 통해 어떤 흐름으로 연결되는지 확인하세요.' },
    { question: '산업체 취업도 가능한가요?', answer: '반도체, 소재, 에너지, IT 기업의 R&D 직무로 진출하는 경우가 많습니다. 프로그래밍·분석 역량을 겸비하면 유리합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '이론·계산 연구실', courses: ['전공기초', '수리해석'] },
    { lab: '실험·분석 연구실', courses: ['전공실험', '계측분석'] },
    { lab: '응용·소재 연구실', courses: ['응용과학', '소재공학'] },
  ],
  requirements: defaultRequirements,
}

const bioMedTemplate: ExtraTemplate = {
  slogan: '생명과 건강을 지키는 전문 지식과 실무를 갖춘 바이오·의약 인재 허브',
  keywords: ['생명과학', '의약', '임상', '보건', '바이오'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 10, schedules: 4 },
  careers: [
    {
      category: '의료/임상',
      jobs: ['간호사', '약사', '임상병리사', '의료기관 행정'],
      description: '실무 중심의 교육과 국가고시 준비로 의료 현장으로 진출합니다.',
      preparation: ['국가고시 모의고사', '임상 실습 기록 관리', '의료 용어 숙지'],
      courses: ['임상실습', '해부생리학', '병리학'],
    },
    {
      category: '연구/개발',
      jobs: ['바이오기업 연구원', '제약 연구원', '식품 R&D', '신약 개발'],
      description: '생명과학의 원리를 산업 현장의 제품과 서비스로 연결합니다.',
      preparation: ['실험 역량 강화', '논문 읽기 습관', '대학원 진학'],
      courses: ['분자생물학', '생화학', '미생물학'],
      portfolio: '학부 연구 보고서, 실험 데이터 분석 결과물',
    },
    {
      category: '공공/보건',
      jobs: ['보건직 공무원', '보건소', '식약처', '연구소'],
      description: '공공 보건 정책과 행정 분야에서 전문 역량을 발휘합니다.',
      preparation: ['공무원 시험 준비', 'NCS 학습', '자격증 취득'],
      courses: ['공중보건학', '역학', '보건법규'],
    },
  ],
  facilities: [
    { name: '바이오 실험실', location: '생명·의과학대학 실험 공간', description: '세포, 분자, 미생물 등 생명과학 실험을 수행하는 공간입니다.', activities: ['세포배양', 'PCR 실험', '미생물 배양'] },
    { name: '실습 시뮬레이션실', location: '전공 실습 공간', description: '임상 절차, 약물 조제, 간호 처치 등 실무를 시뮬레이션하는 공간입니다.', activities: ['임상 시뮬레이션', '처치 실습', '기기 사용 교육'] },
    { name: '세미나실', location: '학과 공동 공간', description: '국가고시 스터디, 발표 준비, 팀 프로젝트에 활용되는 공간입니다.', activities: ['국가고시 스터디', '논문 발표', '케이스 스터디'] },
  ],
  faqs: [
    { question: '국가고시 준비는 어떻게 병행하나요?', answer: '전공 수업이 국가고시 범위와 연계되도록 설계되어 있습니다. 3~4학년부터 모의고사와 문제풀이 스터디를 시작하는 것을 권장합니다.' },
    { question: '실습 과목의 비중이 큰가요?', answer: '전공 특성상 실험·실습 비중이 높습니다. 출결과 보고서 관리가 성적에 중요합니다.' },
    { question: '대학원이나 취업 어느 쪽을 많이 선택하나요?', answer: '임상직은 취업 비율이 높고, 연구직은 대학원 진학 후 취업하는 경우가 많습니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '바이오의약 연구실', courses: ['분자생물학', '생화학'] },
    { lab: '임상·약리 연구실', courses: ['약리학', '임상실습'] },
    { lab: '공중보건 연구실', courses: ['공중보건학', '역학'] },
  ],
  requirements: defaultRequirements,
}

const architectureTemplate: ExtraTemplate = {
  slogan: '사람이 살아가는 공간과 인프라를 설계하고 건설하는 건설·환경 전문 허브',
  keywords: ['건축', '설계', '토목', '환경', '인프라'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 8, schedules: 3 },
  careers: [
    {
      category: '설계/계획',
      jobs: ['건축설계사', '도시계획가', '조경설계사', '환경컨설턴트'],
      description: '공간과 환경을 창의적으로 설계하는 분야로 진출합니다.',
      preparation: ['CAD·BIM 툴 숙달', '포트폴리오 작성', '설계 공모전 참가'],
      courses: ['건축설계', '구조역학', '재료역학'],
      portfolio: '설계 스튜디오 작품집, 공모전 출품작, 모형 제작 기록',
    },
    {
      category: '시공/엔지니어링',
      jobs: ['건설 엔지니어', '현장 감독', '구조 엔지니어', '토목 엔지니어'],
      description: '설계를 현실로 구현하는 시공·엔지니어링 분야에서 활동합니다.',
      preparation: ['기사 자격증 취득', '현장 실습 경험', '도면 해독 능력'],
      courses: ['시공학', '구조설계', '토질역학'],
    },
    {
      category: '공공/인프라',
      jobs: ['공무원 기술직', '공기업 건설부서', '환경부', '국토부'],
      description: '공공 인프라 계획과 관리 분야에서 전문성을 발휘합니다.',
      preparation: ['기사 자격증 취득', 'NCS 준비', '공공기관 인턴십'],
      courses: ['건설관리', '환경공학', '도시계획'],
    },
  ],
  facilities: [
    { name: '설계 스튜디오', location: '건축·토목 공학부 설계 공간', description: 'CAD, BIM, 모형 제작을 통한 설계 실습이 이루어지는 핵심 공간입니다.', activities: ['설계 크리틱', 'BIM 실습', '모형 제작'] },
    { name: '재료실험실', location: '전공 실험 공간', description: '콘크리트, 토양, 금속 등 건설 재료의 강도와 특성을 실험하는 공간입니다.', activities: ['압축강도 시험', '토질 분석', '재료 특성 측정'] },
    { name: '세미나실', location: '학과 공동 공간', description: '포트폴리오 발표, 크리틱, 설계 리뷰를 진행하는 공간입니다.', activities: ['설계 발표', '팀 프로젝트 회의', '자격증 스터디'] },
  ],
  faqs: [
    { question: '자격증은 어떤 것을 준비해야 하나요?', answer: '건축사(건축학), 토목기사, 환경기사, 조경기사 등 전공에 맞는 기사 자격증 취득을 목표로 합니다.' },
    { question: '포트폴리오는 어떻게 준비하나요?', answer: '설계 과목에서 수행한 작품을 정리하고 CAD, Revit, Photoshop 활용 능력을 키우는 것이 중요합니다.' },
    { question: '건축학과는 몇 년제인가요?', answer: '건축학과는 5년제입니다. 건축공학전공은 4년제로, 졸업 후 현장 또는 대학원으로 진출합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '건축설계 연구실', courses: ['건축설계', '건축계획'] },
    { lab: '구조·재료 연구실', courses: ['구조역학', '건축재료'] },
    { lab: '환경·도시 연구실', courses: ['환경공학', '도시계획'] },
  ],
  requirements: defaultRequirements,
}

const humanitiesTemplate: ExtraTemplate = {
  slogan: '언어, 문학, 교육과 콘텐츠를 연결하는 인문 기반 성장 허브',
  keywords: ['문학', '언어', '교육', '콘텐츠', '글쓰기'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 8, schedules: 3 },
  careers: [
    {
      category: '교육',
      jobs: ['교사', '교육콘텐츠 기획자', '독서지도사', '학원 강사'],
      description: '언어와 문학 이해를 바탕으로 교육 현장과 학습 콘텐츠 분야로 확장합니다.',
      preparation: ['교직 이수 확인', '교육봉사 경험', '교원임용 시험 준비'],
      courses: ['교육론', '교육실습', '교육과정'],
    },
    {
      category: '콘텐츠/출판',
      jobs: ['출판 편집자', '콘텐츠 기획자', '작가', '홍보 담당자'],
      description: '읽기와 쓰기 역량을 활용해 미디어, 출판, 홍보 분야에서 일합니다.',
      preparation: ['글쓰기 포트폴리오', 'SNS 콘텐츠 기획 실습', '출판사 인턴십'],
      courses: ['글쓰기', '문학비평', '미디어언어'],
      portfolio: '비평문, 기획안, 콘텐츠 원고를 과목별로 정리한 포트폴리오',
    },
    {
      category: '공공/연구',
      jobs: ['공공기관 행정직', '문화재단', '대학원', '연구원'],
      description: '자료 해석, 글쓰기, 발표 역량을 공공과 연구 분야로 연결합니다.',
      preparation: ['공무원 시험 준비', '공공기관 인턴십', '논문 작성 경험'],
      courses: ['조사방법론', '문화정책', '인문학연구'],
    },
  ],
  facilities: [
    { name: '세미나실', location: '학과 공동 공간', description: '토론, 발표, 독서 모임, 수업 외 스터디를 진행하는 공간입니다.', activities: ['독서 세미나', '발표 연습', '팀 토론'] },
    { name: '문헌자료실', location: '전공 자료 공간', description: '전공 도서와 참고 자료를 확인하며 과제와 연구를 준비하는 공간입니다.', activities: ['논문 검색', '자료 조사', '과제 준비'] },
    { name: '교육실습실', location: '수업 실습 공간', description: '수업 시연, 발표 연습, 교육 실습 준비에 활용되는 공간입니다.', activities: ['수업 시연', '교안 작성', '모의 강의'] },
  ],
  faqs: [
    { question: '교직 이수나 교육 실습 정보는 어디서 확인하나요?', answer: '학과 안내와 교직 관련 공지를 함께 확인해야 합니다. 선발 기준과 실습 일정은 학기마다 달라질 수 있습니다.' },
    { question: '글쓰기 포트폴리오는 어떻게 만들면 좋나요?', answer: '비평문, 기획안, 발표 자료, 콘텐츠 원고를 과목별로 정리해두면 진로 준비에 도움이 됩니다.' },
    { question: '복수전공과 연계하기 좋은 분야가 있나요?', answer: '교육, 미디어, 행정, 문화콘텐츠 계열과 함께 설계하면 진로 선택지가 넓어집니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '문학문화 세미나실', courses: ['현대문학', '문학비평'] },
    { lab: '언어교육 연구실', courses: ['국어학', '교육론'] },
    { lab: '콘텐츠 글쓰기실', courses: ['글쓰기', '콘텐츠기획'] },
  ],
  requirements: defaultRequirements,
}

const publicPolicyTemplate: ExtraTemplate = {
  slogan: '지역사회 문제를 정책과 데이터로 해석하는 공공 인재 플랫폼',
  keywords: ['공공정책', '지방행정', '조사분석', '공공기관', '사회문제'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 10, schedules: 4 },
  careers: [
    {
      category: '공공행정',
      jobs: ['공무원', '공기업 행정직', '공공기관 실무자'],
      description: '정책, 법, 예산, 조직 이해를 바탕으로 공공 영역에서 일합니다.',
      preparation: ['공무원 시험 준비', 'NCS 학습', '공공기관 인턴십'],
      courses: ['행정학', '법학개론', '정책학'],
    },
    {
      category: '조사/분석',
      jobs: ['정책연구원', '조사분석가', '리서치 담당자', '경영컨설턴트'],
      description: '사회 현상을 자료와 설문, 통계로 읽고 정책 제안으로 연결합니다.',
      preparation: ['통계 소프트웨어 학습', '보고서 작성 연습', '리서치 인턴십'],
      courses: ['조사방법론', '통계학', '정책분석'],
    },
    {
      category: '지역/복지',
      jobs: ['지자체 사업 담당', '사회적경제 기관', '복지 행정 담당', 'NGO 실무자'],
      description: '지역 문제 해결과 주민 서비스 개선에 필요한 실무 역량을 쌓습니다.',
      preparation: ['현장 봉사 경험', '지역사회 이해', '복지 기관 인턴십'],
      courses: ['지방자치론', '사회복지개론', '공공관리'],
    },
  ],
  facilities: [
    { name: '정책분석실', location: '사회과학계열 실습 공간', description: '정책 사례, 통계 자료, 지역 현안을 분석하는 프로젝트 공간입니다.', activities: ['정책 사례 분석', '통계 분석', '발표 준비'] },
    { name: '세미나실', location: '학과 공동 공간', description: '토론 수업, 발표, 공공기관 취업 스터디에 활용되는 공간입니다.', activities: ['모의 면접', '공무원 스터디', '발표 연습'] },
    { name: '자료열람 공간', location: '전공 자료 공간', description: '법령, 정책 보고서, 조사 자료를 정리해 보는 공간입니다.', activities: ['법령 조사', '정책 자료 수집', '논문 검색'] },
  ],
  faqs: [
    { question: '공무원 준비와 전공 공부를 같이 할 수 있나요?', answer: '행정, 법, 정책 과목이 시험 과목과 겹치는 부분이 있어 전공 기초를 탄탄히 잡는 것이 도움이 됩니다.' },
    { question: '조사분석 역량은 어떻게 키우나요?', answer: '통계, 조사방법론, 보고서 작성 과목을 연결하고 팀 프로젝트 결과물을 정리해두는 것이 좋습니다.' },
    { question: '공공기관 취업 준비는 무엇부터 하나요?', answer: 'NCS, 직무기술서 분석, 인턴 경험, 지역 공공기관 채용 공고 확인을 병행하는 흐름을 추천합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '지방행정 연구실', courses: ['행정학', '지방자치론'] },
    { lab: '정책분석 연구실', courses: ['정책학', '조사방법론'] },
    { lab: '공공관리 연구실', courses: ['조직론', '공공관리'] },
  ],
  requirements: defaultRequirements,
}

const designArtTemplate: ExtraTemplate = {
  slogan: '창의적 상상력과 디지털 기술로 시각 문화의 새로운 지평을 여는 디자인·예술 허브',
  keywords: ['디자인', '창작', '영상', '예술', '시각'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 7, schedules: 3 },
  careers: [
    {
      category: '디자인 실무',
      jobs: ['그래픽 디자이너', 'UI/UX 디자이너', '영상 편집자', '모션 그래픽'],
      description: '시각 커뮤니케이션과 디지털 미디어 분야에서 창의적 역량을 발휘합니다.',
      preparation: ['Adobe CC 숙달', '포트폴리오 누적', '디자인 공모전 참가'],
      courses: ['디자인기초', '타이포그래피', '영상편집'],
      portfolio: '브랜드 아이덴티티, 포스터, 영상 클립, UX 프로토타입 등 다양한 결과물 모음',
    },
    {
      category: '미디어/콘텐츠',
      jobs: ['방송 작가', '애니메이터', '게임 아트 디렉터', 'SNS 콘텐츠 크리에이터'],
      description: '영상, 애니메이션, 게임 등 미디어 콘텐츠 산업에서 활동합니다.',
      preparation: ['스토리보드 작성 연습', '3D 툴 학습', '인턴십'],
      courses: ['애니메이션', '영상제작', '스토리텔링'],
    },
    {
      category: '프리랜서/창업',
      jobs: ['프리랜서 디자이너', '웹툰 작가', '독립 영상 감독', '스튜디오 창업'],
      description: '독창적인 스타일과 포트폴리오를 바탕으로 자유로운 활동 영역을 만듭니다.',
      preparation: ['SNS 포트폴리오 운영', '클라이언트 소통 경험', '외주 프로젝트 참가'],
      courses: ['기획론', '브랜딩', '졸업작품'],
    },
  ],
  facilities: [
    { name: '디자인 스튜디오', location: '예술계열 실습 공간', description: '일러스트, 포토샵, 영상 편집 등 디지털 작업을 위한 전용 공간입니다.', activities: ['그래픽 작업', 'UI 프로토타이핑', '포트폴리오 제작'] },
    { name: '영상 편집실', location: '전공 실습 공간', description: '촬영, 편집, 음향 작업을 통합적으로 수행하는 미디어 제작 공간입니다.', activities: ['영상 편집', '사운드 작업', '촬영 실습'] },
    { name: '출력·전시실', location: '학과 갤러리 공간', description: '작품을 출력·전시하며 포트폴리오를 완성하는 공간입니다.', activities: ['졸업전시 준비', '대형 출력', '크리틱 발표'] },
  ],
  faqs: [
    { question: '포트폴리오는 언제부터 준비하나요?', answer: '1학년부터 작업물을 체계적으로 보관하고 2~3학년부터 포트폴리오로 정리하는 것을 권장합니다.' },
    { question: '주로 어떤 소프트웨어를 사용하나요?', answer: 'Adobe CC (Photoshop, Illustrator, Premiere), Maya, Blender, Figma 등을 전공에 따라 활용합니다.' },
    { question: '취업 시 포트폴리오와 학점 중 어느 것이 더 중요한가요?', answer: '창작 분야는 포트폴리오가 핵심 평가 요소입니다. 완성도 있는 프로젝트를 꾸준히 쌓는 것이 중요합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '시각디자인 연구실', courses: ['그래픽디자인', '타이포그래피'] },
    { lab: '영상·미디어 연구실', courses: ['영상제작', '애니메이션'] },
    { lab: '창작·기획 연구실', courses: ['스토리텔링', '졸업작품'] },
  ],
  requirements: defaultRequirements,
}

const agricultureTemplate: ExtraTemplate = {
  slogan: '자연과 생명 기술을 융합해 미래 식량과 환경을 설계하는 농생명 혁신 허브',
  keywords: ['농업', '생명', '식물', '생태', '바이오'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 7, schedules: 3 },
  careers: [
    {
      category: '농업/식품 산업',
      jobs: ['농업 기술 전문가', '식품 개발 연구원', '스마트팜 운영', '식품기업 QC'],
      description: '농업 기술과 생명과학을 접목해 식품과 농업 산업으로 진출합니다.',
      preparation: ['농업기사 자격증 준비', '스마트팜 실습 경험', '식품 관련 인턴십'],
      courses: ['재배학', '식물생리학', '식품가공학'],
    },
    {
      category: '공공/연구',
      jobs: ['농촌진흥청', '국립농업과학원', '식약처', '지자체 농업직'],
      description: '공공기관에서 농업 정책, 기술 보급, 안전 관리 업무를 담당합니다.',
      preparation: ['공무원 시험 준비', '자격증 취득', '공공기관 인턴십'],
      courses: ['농업정책', '작물학', '환경생태학'],
    },
    {
      category: '환경/생태',
      jobs: ['환경 컨설턴트', '생태 복원 전문가', '해양환경 관리', '산림 자원 관리원'],
      description: '생태계와 자연 자원을 보전하고 관리하는 분야로 진출합니다.',
      preparation: ['생태조사 현장 실습', '환경 관련 자격증', '연구소 인턴십'],
      courses: ['생태학', '환경과학', '해양학'],
    },
  ],
  facilities: [
    { name: '실험포장 / 온실', location: '학과 실습 포장', description: '작물 재배, 품종 실험, 스마트팜 운영 실습을 수행하는 야외 실습 공간입니다.', activities: ['작물 재배 실습', '품종 비교 실험', '스마트팜 운영'] },
    { name: '생명과학 실험실', location: '전공 실험 공간', description: '식물 조직 배양, 분자 분석, 생화학 실험을 수행하는 공간입니다.', activities: ['조직 배양', 'DNA 분석', '성분 분석'] },
    { name: '가공·분석실', location: '전공 실습 공간', description: '수확 후 관리, 식품 가공, 성분 분석 실험을 진행하는 공간입니다.', activities: ['식품 가공 실습', '품질 분석', '기능성 성분 측정'] },
  ],
  faqs: [
    { question: '농업 관련 자격증은 어떤 것이 있나요?', answer: '농업기사, 원예기사, 식품기사, 임업기사 등 분야에 따라 다양한 기사 자격증이 있습니다.' },
    { question: '스마트팜과 연결되는 진로가 있나요?', answer: '스마트팜 운영, 농업용 드론·IoT 기술 분야로 진출하는 경우가 늘고 있습니다. 프로그래밍·분석 역량을 겸비하면 유리합니다.' },
    { question: '현장 실습 기회가 많나요?', answer: '농업 관련 학과는 실습·실험 비중이 높습니다. 외부 농장, 연구소, 기업 인턴십 연계 기회도 있습니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '작물·재배 연구실', courses: ['재배학', '식물생리학'] },
    { lab: '생명공학 연구실', courses: ['분자생물학', '유전학'] },
    { lab: '환경·생태 연구실', courses: ['생태학', '환경과학'] },
  ],
  requirements: defaultRequirements,
}

const sportsWelfareTemplate: ExtraTemplate = {
  slogan: '몸과 마음의 건강을 돌보고 삶의 질을 높이는 스포츠·복지·상담 전문 인재 허브',
  keywords: ['스포츠', '건강', '복지', '상담', '심리'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 7, schedules: 3 },
  careers: [
    {
      category: '스포츠 지도',
      jobs: ['스포츠 강사', '퍼스널 트레이너', '코치', '스포츠 행정'],
      description: '체육 지도와 스포츠 과학 역량으로 스포츠 관련 현장에서 활동합니다.',
      preparation: ['생활스포츠지도사 자격', '지도 봉사 경험', '스포츠 산업 인턴십'],
      courses: ['운동생리학', '스포츠코칭', '트레이닝방법론'],
    },
    {
      category: '복지/상담',
      jobs: ['사회복지사', '심리상담사', '재활 전문가', '상담 교사'],
      description: '사회 취약 계층과 다양한 대상을 지원하는 복지·상담 현장에서 일합니다.',
      preparation: ['사회복지사 자격증 취득', '현장 실습 이수', '상담 기법 훈련'],
      courses: ['상담이론', '사회복지실천', '심리학개론'],
    },
    {
      category: '공공/기관',
      jobs: ['공무원 사회복지직', '공공체육시설 관리자', '상담센터 운영'],
      description: '공공기관과 사회 서비스 기관에서 전문 역량을 발휘합니다.',
      preparation: ['공무원 시험 준비', 'NCS 학습', '공공기관 인턴십'],
      courses: ['복지정책', '지역사회복지', '체육행정'],
    },
  ],
  facilities: [
    { name: '체육관·실습장', location: '체육·스포츠 실습 공간', description: '운동 기능 실습, 체력 측정, 코칭 실습을 수행하는 공간입니다.', activities: ['스포츠 실기', '체력 측정', '코칭 실습'] },
    { name: '상담 실습실', location: '복지·상담 실습 공간', description: '면담 기술, 상담 사례 실습, 그룹 상담을 연습하는 공간입니다.', activities: ['개인 상담 실습', '그룹 상담', '케이스 컨퍼런스'] },
    { name: '세미나실', location: '학과 공동 공간', description: '자격증 스터디, 발표, 팀 프로젝트 준비에 활용되는 공간입니다.', activities: ['자격증 스터디', '발표 준비', '팀 회의'] },
  ],
  faqs: [
    { question: '관련 자격증은 어떤 것이 있나요?', answer: '생활스포츠지도사, 사회복지사, 임상심리사, 상담심리사 등 분야에 따라 다양합니다. 2급 자격 취득 후 경력을 쌓는 것이 일반적입니다.' },
    { question: '현장 실습 비중이 큰가요?', answer: '복지·상담 분야는 현장 실습이 졸업 요건에 포함되는 경우가 많습니다. 실습 기관 선정과 사전 준비가 중요합니다.' },
    { question: '대학원 진학이 필요한가요?', answer: '심화 자격(1급 상담사, 임상심리사 등)은 대학원 졸업 후 취득하는 것이 일반적입니다. 분야에 따라 대학원 진학을 권장합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '스포츠과학 연구실', courses: ['운동생리학', '스포츠코칭'] },
    { lab: '사회복지 연구실', courses: ['사회복지실천', '복지정책'] },
    { lab: '상담심리 연구실', courses: ['상담이론', '심리학개론'] },
  ],
  requirements: defaultRequirements,
}

const defaultTemplate: ExtraTemplate = {
  slogan: '전공 공부, 진로 준비, 학과 생활을 한곳에서 확인하는 학생 중심 허브',
  keywords: ['전공기초', '진로탐색', '학과생활', '졸업준비', '학생지원'],
  guideCards: defaultGuideCards,
  overviewCounts: { notices: 7, schedules: 2 },
  careers: [
    { category: '전공 실무', jobs: ['전공 분야 실무자', '프로젝트 담당자', '현장 실습 연계 직무'], description: '전공 교과와 실습 경험을 바탕으로 관련 산업 분야로 진출합니다.' },
    { category: '공공/지역', jobs: ['공공기관', '지역 기업', '행정 지원 직무'], description: '지역사회와 산업 수요를 이해하고 공공 또는 지역 기반 직무로 확장합니다.' },
    { category: '심화/연구', jobs: ['대학원', '연구보조', '전문 자격 기반 직무'], description: '전공 심화 학습과 자격 준비를 통해 연구와 전문직 진로를 준비합니다.' },
  ],
  facilities: [
    { name: '전공 실습실', location: '학과 실습 공간', description: '전공 수업과 실습, 프로젝트 활동을 진행하는 공간입니다.' },
    { name: '학과 세미나실', location: '학과 공동 공간', description: '팀 회의, 발표 준비, 스터디에 활용할 수 있는 공간입니다.' },
    { name: '학생 자율공간', location: '학과 생활 공간', description: '학생회, 동아리, 학과 행사를 준비하는 커뮤니티 공간입니다.' },
  ],
  faqs: [
    { question: '학과 사무실에는 언제 문의하면 되나요?', answer: '운영시간 내 전화 또는 방문 문의가 가능합니다. 수강, 졸업, 행정 서류는 여유 있게 확인하는 것이 좋습니다.' },
    { question: '교수 상담은 어떻게 신청하나요?', answer: '지도교수 배정 여부와 학과 안내에 따라 신청합니다. 구체적인 신청 방식은 학과 공지나 학과 사무실 안내를 최종 확인하세요.' },
    { question: '졸업요건은 이 페이지 내용만 보면 되나요?', answer: '아니요. 이 페이지는 개인 점검용 허브이며, 최종 기준은 학과 공지와 학사 안내를 함께 확인해야 합니다.' },
  ],
  studentLife: defaultStudentLife,
  professorEnhancements: [
    { lab: '전공 연구실', courses: ['전공기초', '전공심화'] },
    { lab: '프로젝트 실습실', courses: ['전공실습', '캡스톤디자인'] },
    { lab: '진로상담실', courses: ['진로세미나', '현장실습'] },
  ],
  requirements: defaultRequirements,
}

// ── 최신본 학과 ID 기준 개별 슬로건·키워드 오버라이드 (DataInitializer 1~22) ─────────────────

type DeptOverride = { slogan: string; keywords: string[]; homepage?: string }

const deptOverrides: Record<number, DeptOverride> = {
  // 목포대학교
  1: { slogan: '소프트웨어와 데이터로 문제를 해결하는 컴퓨터공학 허브', keywords: ['소프트웨어', '웹개발', '데이터', '정보보안', 'AI'] },
  2: { slogan: '회로와 전력 기술로 미래 에너지 산업을 연결하는 전기전자 허브', keywords: ['전기', '전자', '회로', '제어', '에너지'] },
  3: { slogan: '네트워크와 통신 기술로 사람과 서비스를 잇는 정보통신 허브', keywords: ['네트워크', '통신', 'IoT', '보안', '클라우드'] },
  4: { slogan: '기계 시스템 설계와 자동화 기술을 다루는 실전 공학 허브', keywords: ['기계설계', '자동화', 'CAD', '제어', '제조'] },
  5: { slogan: '도시와 환경 인프라를 설계하는 토목환경 공학 허브', keywords: ['토목', '환경', '구조', '수자원', '도시인프라'] },
  6: { slogan: '언어와 문학으로 콘텐츠 시대의 이야기를 만드는 국어국문 허브', keywords: ['문학', '국어학', '글쓰기', '콘텐츠', '인문학'] },
  7: { slogan: '영어와 문화 이해로 글로벌 소통 역량을 키우는 영어영문 허브', keywords: ['영어', '영미문학', '번역', '글로벌', '문화'] },
  8: { slogan: '역사의 기록과 해석으로 현재를 읽는 역사 탐구 허브', keywords: ['역사', '기록', '문화유산', '지역사', '아카이브'] },
  9: { slogan: '정책과 행정으로 지역사회 문제를 해결하는 공공 인재 허브', keywords: ['행정', '공공정책', '지방자치', '공무원', '공공기관'] },
  10: { slogan: '시장과 데이터를 읽고 경제 현상을 분석하는 경제학 허브', keywords: ['경제', '금융', '시장분석', '데이터', '정책'] },
  11: { slogan: '사회 현상을 분석하고 공동체의 변화를 탐구하는 사회학 허브', keywords: ['사회조사', '공동체', '문화', '통계', '지역사회'] },
  12: { slogan: '수학적 사고로 문제를 모델링하고 해결하는 기초과학 허브', keywords: ['수학', '통계', '알고리즘', '모델링', '논리'] },
  13: { slogan: '물리 현상의 원리를 탐구하고 첨단 기술의 기반을 다지는 물리학 허브', keywords: ['물리', '역학', '전자기', '광학', '기초과학'] },
  14: { slogan: '분자와 반응을 이해해 소재와 환경 문제를 탐구하는 화학 허브', keywords: ['화학', '분석', '소재', '환경', '실험'] },
  15: { slogan: '교육 현장을 이해하고 학습자를 지원하는 교육 전문 허브', keywords: ['교육학', '상담', '교수법', '교육정책', '학습지원'] },
  16: { slogan: '수학적 사고와 교수법을 함께 키우는 수학교육 허브', keywords: ['수학교육', '교수법', '문제해결', '교육실습', '교사'] },
  17: { slogan: '해양 시스템과 공학 기술로 바다 산업을 설계하는 해양공학 허브', keywords: ['해양', '시스템', '선박', '해양공학', '인프라'] },
  18: { slogan: '수산 생명자원과 바이오 산업을 연결하는 해양생명 허브', keywords: ['수산', '생명과학', '바이오', '양식', '해양자원'] },

  // 순천대학교
  19: { slogan: '언어와 문학으로 지역과 세계를 잇는 국어국문 허브', keywords: ['국어', '문학', '글쓰기', '콘텐츠', '인문학'] },
  20: { slogan: '공공정책과 행정 실무를 연결하는 지역 행정 허브', keywords: ['행정', '정책', '공공기관', '지방자치', '조사분석'] },
  21: { slogan: '소프트웨어와 시스템 구현 역량을 키우는 컴퓨터공학 허브', keywords: ['프로그래밍', '웹개발', '데이터베이스', 'AI', '클라우드'] },
  22: { slogan: '전력과 제어 기술로 산업 현장을 움직이는 전기공학 허브', keywords: ['전기', '전력', '제어', '설비', '에너지'] },
}
// ── 템플릿 분류 ──────────────────────────────────────────────────────────────

function resolveTemplate(deptName: string): ExtraTemplate {
  // CS / SW / AI / 정보 계열
  if (/컴퓨터|소프트웨어|정보통신|정보보호|멀티미디어|인공지능/.test(deptName))
    return computerTemplate
  // 인문 / 언어 / 교육 계열 (과학보다 먼저 체크 — 물리교육·수학교육 등 올바르게 분류)
  if (/국어|국문|영어|영문|일어|일문|동아시아|문화|역사|문예|문화유산|교육|윤리/.test(deptName))
    return humanitiesTemplate
  // 순수과학 / 소재 계열
  if (/반도체응용물리|물리|화학(?!공학)|수학(?!교육)|생명과학|소재|부품/.test(deptName))
    return scienceTemplate
  // 전기 / 기계 / 에너지 / 반도체공학 계열
  if (/전기|전자|기계|제어|조선|에너지|반도체공학/.test(deptName))
    return electricalTemplate
  // 건축 / 토목 / 환경공학 / 조경 / 도시 계열
  if (/건축|토목|환경공학|조경|도시계획/.test(deptName))
    return architectureTemplate
  // 바이오 / 의약 / 간호 / 수산생명 / 식품공학 계열
  if (/약학|간호|수산생명|제약|식품공학/.test(deptName))
    return bioMedTemplate
  // 행정 / 법 / 사회 / 경영 / 경제 계열
  if (/행정|법|경찰|정치|언론|사회복지|경제|경영|무역|관광|지적|회계|세무|금융|보험/.test(deptName))
    return publicPolicyTemplate
  // 디자인 / 예술 / 영상 / 패션 계열
  if (/디자인|미술|애니메이션|영상|시각|패션|의류|뉴아트/.test(deptName))
    return designArtTemplate
  // 농업 / 원예 / 산림 / 해양수산 / 식품영양 계열
  if (/농업|원예|산림|식의약|수산자원|해양수산|스마트팜|식품영양|영양/.test(deptName))
    return agricultureTemplate
  // 체육 / 스포츠 / 복지 / 상담 / 아동 계열
  if (/체육|스포츠|레저|복지|상담|심리|차문화|아동/.test(deptName))
    return sportsWelfareTemplate
  return defaultTemplate
}

function withDeptContext(template: ExtraTemplate, deptId: number): DepartmentExtra {
  const override = deptOverrides[deptId]
  return {
    ...template,
    deptId,
    ...(override && {
      slogan: override.slogan,
      keywords: override.keywords,
      ...(override.homepage !== undefined && { homepage: override.homepage }),
    }),
  }
}

export function getDepartmentExtra(deptId: number, deptName: string): DepartmentExtra {
  return withDeptContext(resolveTemplate(deptName), deptId)
}
