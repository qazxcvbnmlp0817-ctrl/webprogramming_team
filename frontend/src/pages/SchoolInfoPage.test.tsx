import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SchoolInfoPage from './SchoolInfoPage'

const mockFetchSchoolInfo = vi.hoisted(() => vi.fn())
const mockSetDept = vi.hoisted(() => vi.fn())

vi.mock('../api/school', () => ({
  fetchSchoolInfo: mockFetchSchoolInfo,
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({
    selectedUniversityId: 1,
    selectedUniversityName: '목포대학교',
    setDept: mockSetDept,
  }),
}))

const mockUniversity = {
  id: 1,
  name: '목포대학교',
  description: '서남권 중심 국립대학교',
  totalDeptCount: 3,
  schools: [
    {
      id: 1,
      name: '공과대학',
      description: '공학 분야 전문 인재 양성',
      faculties: [
        {
          id: 1,
          name: '정보통신공학부',
          schoolId: 1,
          depts: [
            { id: 1, name: '컴퓨터공학과', facultyId: 1 },
            { id: 2, name: '전기전자공학과', facultyId: 1 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: '인문대학',
      description: '인문학적 소양 함양',
      faculties: [
        {
          id: 2,
          name: '인문학부',
          schoolId: 2,
          depts: [
            { id: 3, name: '국어국문학과', facultyId: 2 },
          ],
        },
      ],
    },
  ],
}

const mockSchoolInfo = {
  university: mockUniversity,
  content: {
    slogan: '학교 공지와 학과 커뮤니티를 한 번에 연결하는 허브',
    keywords: ['학교정보', '학과탐색'],
    address: '전남 무안군 청계면 영산로 1666',
    phone: '061-450-2114',
    email: 'webmaster@mokpo.ac.kr',
    hours: '평일 09:00 ~ 18:00',
    campusGuides: [
      {
        title: '학부·학과 선택',
        description: '내 학과 커뮤니티로 이동합니다.',
        action: '학과 찾기',
        href: '/school/departments',
        icon: 'fa-sitemap',
      },
    ],
    facilities: [
      {
        name: '중앙도서관',
        category: '학습',
        location: '도림캠퍼스',
        description: '자료 열람과 자율학습 공간입니다.',
        mapUrl: 'https://map.naver.com/p/search/%EB%AA%A9%ED%8F%AC%EB%8C%80%ED%95%99%EA%B5%90%20%EC%A4%91%EC%95%99%EB%8F%84%EC%84%9C%EA%B4%80',
        mapKeyword: '목포대학교 중앙도서관',
      },
      {
        name: '정보전산원',
        category: '지원',
        location: '도림캠퍼스',
        description: '포털과 계정 문의 동선입니다.',
        mapKeyword: '목포대학교 정보전산원',
      },
    ],
    faqs: [
      {
        category: '공지',
        question: '학교 공지와 학과 공지는 어떻게 구분하나요?',
        answer: '학교 공지는 전체 학생 대상 안내이고 학과 공지는 전공 안내 중심입니다.',
      },
      {
        category: '위치',
        question: '학과 사무실은 어떻게 찾나요?',
        answer: '학부·학과 탐색에서 학과를 선택하면 학과정보 페이지의 연락처·위치·운영시간으로 바로 이동합니다.',
      },
    ],
    quickLinks: [
      {
        title: '학교 공지',
        description: '전체 공지 확인',
        href: '/school/notice',
        icon: 'fa-bullhorn',
      },
    ],
    transitGuides: ['학교 공지와 일정을 먼저 보고 학과 페이지로 이어집니다.'],
  },
  summary: {
    schoolCount: 2,
    facultyCount: 2,
    deptCount: 3,
    noticeCount: 1,
    scheduleCount: 1,
  },
  latestNotices: [
    {
      id: 10,
      title: '장학 신청 안내',
      date: '2026-06-01 10:00',
      author: '관리자',
      category: '장학',
      viewCount: 3,
      featured: false,
      targetGrades: [1, 2, 3, 4],
    },
  ],
  upcomingSchedules: [
    { id: 20, title: '수강신청', date: '2026-06-10', dday: 8, category: '학사' },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/school/info']}>
      <SchoolInfoPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockFetchSchoolInfo.mockReset()
  mockSetDept.mockReset()
})

test('학교정보 허브가 공지, 일정, 시설, FAQ를 렌더링한다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockSchoolInfo)
  renderPage()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: '목포대학교' })).toBeInTheDocument()
  })
  expect(screen.getByText('오늘 확인할 학교 정보')).toBeInTheDocument()
  expect(screen.getByText('장학 신청 안내')).toBeInTheDocument()
  expect(screen.getByText('수강신청')).toBeInTheDocument()
  expect(screen.getByText('중앙도서관')).toBeInTheDocument()
  expect(screen.getByText('학교정보 FAQ')).toBeInTheDocument()
})

test('검증된 지도 URL이 있는 시설만 시설 위치 카드로 표시한다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockSchoolInfo)
  renderPage()

  const mapLink = await screen.findByRole('link', { name: /네이버 지도에서 보기/ })

  expect(mapLink).toHaveAttribute('href', mockSchoolInfo.content.facilities[0].mapUrl)
  expect(screen.getByText('중앙도서관')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: '정보전산원' })).not.toBeInTheDocument()
})

test('학교정보 FAQ가 학과정보 연결 중심 문구로 표시된다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockSchoolInfo)
  renderPage()

  await waitFor(() => {
    expect(screen.getByText('학과 사무실은 어떻게 찾나요?')).toBeInTheDocument()
  })
  expect(screen.queryByText(/최종 확인하나요/)).not.toBeInTheDocument()
})

test('학교정보 빠른 링크와 학부·학과 탐색이 표시된다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockSchoolInfo)
  renderPage()

  await waitFor(() => {
    expect(screen.getAllByRole('link', { name: /학부·학과 선택/ }).length).toBeGreaterThan(0)
  })
  expect(screen.getAllByRole('link', { name: /학교 공지/ }).length).toBeGreaterThan(0)
  expect(screen.getByText('공과대학')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '컴퓨터공학과' })).toBeInTheDocument()
})

test('학과 클릭 시 선택 상태를 저장한다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockSchoolInfo)
  renderPage()

  const deptButton = await screen.findByRole('button', { name: '컴퓨터공학과' })
  fireEvent.click(deptButton)

  expect(mockSetDept).toHaveBeenCalledWith({
    selectedDeptId: 1,
    selectedDeptName: '컴퓨터공학과',
    selectedUniversityId: 1,
    selectedUniversityName: '목포대학교',
    selectedSchoolName: '공과대학',
    selectedFacultyName: '정보통신공학부',
  })
})
