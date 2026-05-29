export interface CampusGuideItem {
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
  transitGuide: string[]
  campusGuides: CampusGuideItem[]
  faqs: CampusFaqItem[]
}

const defaultCampusGuides: CampusGuideItem[] = [
  {
    title: '학부·학과 선택',
    description: '단과대학과 학부를 따라 내 학과 커뮤니티로 이동합니다.',
    href: '/school/departments',
    icon: 'fa-sitemap',
  },
  {
    title: '학교 공지',
    description: '학사, 장학, 행사처럼 학교 단위로 보는 공지를 확인합니다.',
    href: '/school/notice',
    icon: 'fa-bullhorn',
  },
  {
    title: '학교 일정',
    description: '시험, 수강신청, 축제 등 학교 전체 일정을 한 화면에서 봅니다.',
    href: '/school/schedule',
    icon: 'fa-calendar-days',
  },
  {
    title: '학교 게시판',
    description: '학과를 넘어 학교 구성원이 함께 보는 글을 확인합니다.',
    href: '/school/board',
    icon: 'fa-comments',
  },
]

const schoolExtras: Record<number, SchoolExtra> = {
  1: {
    universityId: 1,
    slogan: '학과 커뮤니티와 캠퍼스 정보를 한 번에 연결하는 서남권 국립대 생활 허브',
    keywords: ['학과커뮤니티', '학사정보', '캠퍼스생활', '공지확인', '진로탐색'],
    address: '전남 무안군 청계면 영산로 1666 국립목포대학교',
    phone: '061-450-2114',
    email: 'webmaster@mokpo.ac.kr',
    hours: '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)',
    transitGuide: [
      '학교 방문 전 학과 사무실 위치와 운영시간을 먼저 확인하세요.',
      '학과별 건물과 호실은 공식 홈페이지 또는 학과 사무실 공지를 최종 기준으로 확인하세요.',
      '처음 방문하는 학생은 학교 공지와 학과 공지를 함께 확인하면 이동 동선이 줄어듭니다.',
    ],
    campusGuides: defaultCampusGuides,
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
        question: '학과 사무실 위치는 어디서 최종 확인하나요?',
        answer: '이 페이지는 캠퍼스 이동 안내를 돕는 허브이며, 상세 호실은 학과정보 페이지와 공식 홈페이지를 함께 확인하는 것이 안전합니다.',
      },
    ],
  },
  2: {
    universityId: 2,
    slogan: '지역과 전공을 잇는 캠퍼스 생활 정보를 모아 보여주는 순천대 학교 허브',
    keywords: ['학교생활', '학부탐색', '공지확인', '일정관리', '커뮤니티'],
    address: '전라남도 순천시 중앙로 255 국립순천대학교',
    phone: '061-750-3114',
    email: 'webmaster@sunchon.ac.kr',
    hours: '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)',
    transitGuide: [
      '방문 전 학교 공지와 학부·학과 안내를 먼저 확인하세요.',
      '학과별 세부 위치는 공식 홈페이지 또는 학과 사무실 안내를 최종 기준으로 삼으세요.',
      '학사 일정과 학교 게시판을 함께 보면 수업·행사·행정 동선을 빠르게 잡을 수 있습니다.',
    ],
    campusGuides: defaultCampusGuides,
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
        answer: '공식 행정 정보는 학교 또는 학과 사무실 안내를 우선 기준으로 확인하고, 커뮤니티 정보는 참고용으로 활용하세요.',
      },
    ],
  },
}

const fallbackExtra: SchoolExtra = {
  universityId: 0,
  slogan: '학교 공지, 일정, 학부·학과 탐색을 한곳에서 시작하는 캠퍼스 정보 허브',
  keywords: ['학교정보', '학과탐색', '공지', '일정', '커뮤니티'],
  address: '공식 홈페이지에서 주소를 확인하세요.',
  phone: '공식 페이지 미공개',
  email: '공식 페이지 미공개',
  hours: '평일 09:00 ~ 18:00',
  transitGuide: [
    '방문 전 학교 공지와 공식 홈페이지를 확인하세요.',
    '학과별 상세 위치는 학과 사무실 안내를 최종 기준으로 확인하세요.',
  ],
  campusGuides: defaultCampusGuides,
  faqs: [
    {
      category: '안내',
      question: '이 페이지는 어떤 용도인가요?',
      answer: '학교 단위 정보와 학과 커뮤니티로 이동하는 출발점을 제공하는 학생용 안내 페이지입니다.',
    },
  ],
}

export function getSchoolExtra(universityId: number | null): SchoolExtra {
  if (universityId === null) return fallbackExtra
  return schoolExtras[universityId] ?? { ...fallbackExtra, universityId }
}
