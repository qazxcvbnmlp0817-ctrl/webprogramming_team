export interface CampusGuideItem {
  title: string
  description: string
  action?: string
  href: string
  icon: string
}

export interface CampusFacilityItem {
  name: string
  category: string
  location: string
  description: string
  mapUrl?: string
  mapKeyword?: string
}

export interface SchoolQuickLinkItem {
  title: string
  description: string
  href: string
  icon: string
}

export interface CampusFaqItem {
  category: string
  question: string
  answer: string
}

export interface SchoolExtra {
  universityId: number
  slogan: string
  keywords: string[]
  address: string
  phone: string
  email: string
  hours: string
  homepage?: string
  transitGuide: string[]
  campusGuides: CampusGuideItem[]
  facilities: CampusFacilityItem[]
  faqs: CampusFaqItem[]
  quickLinks: SchoolQuickLinkItem[]
}

const defaultCampusGuides: CampusGuideItem[] = [
  {
    title: '학부·학과 선택',
    description: '단과대학과 학부를 따라 내 학과 커뮤니티로 이동합니다.',
    action: '학과 찾기',
    href: '/school/departments',
    icon: 'fa-sitemap',
  },
  {
    title: '학교 공지',
    description: '학사, 장학, 행사처럼 학교 단위로 보는 공지를 확인합니다.',
    action: '공지 보기',
    href: '/school/notice',
    icon: 'fa-bullhorn',
  },
  {
    title: '학교 일정',
    description: '시험, 수강신청, 축제 등 학교 전체 일정을 한 화면에서 봅니다.',
    action: '일정 보기',
    href: '/school/schedule',
    icon: 'fa-calendar-days',
  },
  {
    title: '학교 게시판',
    description: '학과를 넘어 학교 구성원이 함께 보는 글을 확인합니다.',
    action: '게시판 보기',
    href: '/school/board',
    icon: 'fa-comments',
  },
]

const defaultQuickLinks: SchoolQuickLinkItem[] = [
  { title: '학교 공지', description: '전체 학생 대상 안내 확인', href: '/school/notice', icon: 'fa-bullhorn' },
  { title: '학교 일정', description: '학사·행사 일정 확인', href: '/school/schedule', icon: 'fa-calendar-days' },
  { title: '학교 게시판', description: '학교 단위 소통 공간', href: '/school/board', icon: 'fa-comments' },
  { title: '학부·학과', description: '내 학과 커뮤니티 진입', href: '/school/departments', icon: 'fa-sitemap' },
]

const schoolExtras: Record<number, SchoolExtra> = {
  1: {
    universityId: 1,
    slogan: '학과 커뮤니티와 캠퍼스 정보를 한 번에 연결하는 서남권 국립대 생활 허브',
    keywords: ['학과커뮤니티', '학사정보', '캠퍼스생활', '공지확인', '진로탐색'],
    address: '전남 무안군 청계면 영산로 1666 국립목포대학교',
    phone: '061-450-2114',
    email: 'webmaster@mokpo.ac.kr',
    homepage: 'https://www.mokpo.ac.kr',
    hours: '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)',
    transitGuide: [
      '방문 전 학교정보에서 학부·학과를 선택해 학과 연락처와 운영시간을 먼저 확인하세요.',
      '건물·호실 정보가 필요한 경우 학과정보의 위치·연락처 영역에서 바로 확인합니다.',
      '학교 공지와 일정을 먼저 보고, 세부 안내는 선택한 학과 페이지로 이어집니다.',
    ],
    campusGuides: defaultCampusGuides,
    facilities: [
      {
        name: '도림캠퍼스 본관',
        category: '행정',
        location: '대학본부',
        description: '학교 행정 문의와 주요 안내를 확인하는 대표 행정 공간입니다.',
        mapUrl: 'https://map.naver.com/p/search/%EA%B5%AD%EB%A6%BD%EB%AA%A9%ED%8F%AC%EB%8C%80%ED%95%99%EA%B5%90%20%EB%8C%80%ED%95%99%EB%B3%B8%EB%B6%80',
        mapKeyword: '국립목포대학교 대학본부',
      },
      {
        name: '중앙도서관',
        category: '학습',
        location: '도림캠퍼스',
        description: '자료 열람, 학습 공간, 시험 기간 자율학습 동선을 확인합니다.',
        mapUrl: 'https://map.naver.com/p/search/%EA%B5%AD%EB%A6%BD%EB%AA%A9%ED%8F%AC%EB%8C%80%ED%95%99%EA%B5%90%20%EC%A4%91%EC%95%99%EB%8F%84%EC%84%9C%EA%B4%80',
        mapKeyword: '국립목포대학교 중앙도서관',
      },
    ],
    faqs: [
      {
        category: '이동',
        question: '학교정보에서 바로 학과 페이지로 이동할 수 있나요?',
        answer: '학부·학과 선택 메뉴에서 단과대학과 학부를 확인한 뒤 원하는 학과 커뮤니티로 이동할 수 있습니다.',
      },
      {
        category: '공지',
        question: '학교 공지와 학과 공지는 어떻게 구분하나요?',
        answer: '학교 공지는 전체 학생 대상 안내이고, 학과 공지는 선택한 학과 구성원에게 필요한 전공·행정 안내 중심입니다.',
      },
      {
        category: '위치',
        question: '학과 사무실은 어떻게 찾나요?',
        answer: '학부·학과 탐색에서 학과를 선택하면 학과정보 페이지의 연락처·위치·운영시간으로 바로 이동합니다. 위치가 비어 있거나 애매하면 학과 게시판 질문 또는 대표 연락처로 이어집니다.',
      },
      {
        category: '전산',
        question: '포털이나 계정 문제는 어디에서 확인하나요?',
        answer: '정보전산원은 지도 검색 결과가 불안정해 시설 위치 카드에 넣지 않았습니다. 포털·계정·전산 서비스 문의는 정보전산원 안내와 대표 연락처를 먼저 확인하세요.',
      },
    ],
    quickLinks: defaultQuickLinks,
  },
  2: {
    universityId: 2,
    slogan: '지역과 전공을 잇는 캠퍼스 생활 정보를 모아 보여주는 순천대 학교 허브',
    keywords: ['학교생활', '학부탐색', '공지확인', '일정관리', '커뮤니티'],
    address: '전라남도 순천시 중앙로 255 국립순천대학교',
    phone: '061-750-3114',
    email: 'webmaster@sunchon.ac.kr',
    homepage: 'https://www.scnu.ac.kr',
    hours: '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)',
    transitGuide: [
      '방문 전 학교 공지와 학부·학과 안내를 먼저 확인하세요.',
      '학과별 세부 위치는 학과정보의 연락처·위치 영역에서 먼저 확인하세요.',
      '학사 일정과 학교 게시판을 함께 보면 수업·행사·행정 동선을 빠르게 잡을 수 있습니다.',
    ],
    campusGuides: defaultCampusGuides,
    facilities: [
      {
        name: '대학본부',
        category: '행정',
        location: '순천캠퍼스',
        description: '학교 행정과 주요 민원 안내를 확인하는 대표 행정 공간입니다.',
        mapUrl: 'https://map.naver.com/p/search/%EA%B5%AD%EB%A6%BD%EC%88%9C%EC%B2%9C%EB%8C%80%ED%95%99%EA%B5%90%20%EB%8C%80%ED%95%99%EB%B3%B8%EB%B6%80',
        mapKeyword: '국립순천대학교 대학본부',
      },
      {
        name: '도서관',
        category: '학습',
        location: '순천캠퍼스',
        description: '자료 열람과 학습 공간 이용 정보를 확인합니다.',
        mapUrl: 'https://map.naver.com/p/search/%EA%B5%AD%EB%A6%BD%EC%88%9C%EC%B2%9C%EB%8C%80%ED%95%99%EA%B5%90%20%EB%8F%84%EC%84%9C%EA%B4%80',
        mapKeyword: '국립순천대학교 도서관',
      },
    ],
    faqs: [
      {
        category: '탐색',
        question: '학교 페이지와 학과 페이지의 차이는 무엇인가요?',
        answer: '학교 페이지는 대학 전체 공지와 구조를 보여주고, 학과 페이지는 선택한 학과의 교수진·교육과정·진로 정보를 자세히 보여줍니다.',
      },
      {
        category: '일정',
        question: '학교 일정과 학과 일정은 따로 확인해야 하나요?',
        answer: '학교 전체 일정은 학교 일정에서 보고, 전공 수업이나 학과 행사처럼 세부적인 내용은 학과 일정과 공지를 함께 확인하는 흐름을 권장합니다.',
      },
      {
        category: '문의',
        question: '정보가 다르면 어디에 문의해야 하나요?',
        answer: '먼저 이 페이지에서 학교 단위 정보를 확인하고, 세부 학과 정보가 다르면 학과 게시판 질문이나 수정 요청으로 알려 주세요.',
      },
    ],
    quickLinks: defaultQuickLinks,
  },
}

const fallbackExtra: SchoolExtra = {
  universityId: 0,
  slogan: '학교 공지, 일정, 학부·학과 탐색을 한곳에서 시작하는 캠퍼스 정보 허브',
  keywords: ['학교정보', '학과탐색', '공지', '일정', '커뮤니티'],
  address: '주소 정보 미공개',
  phone: '대표전화 미공개',
  email: '이메일 미공개',
  hours: '평일 09:00 ~ 18:00',
  homepage: undefined,
  transitGuide: [
    '학교 공지와 일정을 먼저 확인한 뒤 필요한 학과 페이지로 이동하세요.',
    '학과별 상세 위치는 학과정보의 연락처·위치 영역에서 확인하세요.',
  ],
  campusGuides: defaultCampusGuides,
  facilities: [],
  faqs: [
    {
      category: '안내',
      question: '이 페이지는 어떤 용도인가요?',
      answer: '학교 단위 정보와 학과 커뮤니티로 이동하는 출발점을 제공하는 학생용 안내 페이지입니다.',
    },
  ],
  quickLinks: defaultQuickLinks,
}

export function getSchoolExtra(universityId: number | null): SchoolExtra {
  if (universityId === null) return fallbackExtra
  return schoolExtras[universityId] ?? { ...fallbackExtra, universityId }
}
