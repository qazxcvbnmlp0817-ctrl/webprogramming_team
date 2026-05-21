import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SchoolInfoPage from './SchoolInfoPage'

const mockFetchSchoolInfo = vi.hoisted(() => vi.fn())

vi.mock('../api/school', () => ({
  fetchSchoolInfo: mockFetchSchoolInfo,
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({
    selectedUniversityId: 1,
    selectedUniversityName: '목포대학교',
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/school/info']}>
      <SchoolInfoPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockFetchSchoolInfo.mockReset()
})

test('학교정보 허브가 렌더링된다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockUniversity)
  renderPage()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: '목포대학교' })).toBeInTheDocument()
  })
  expect(screen.getByText('학교 한눈에 보기')).toBeInTheDocument()
  expect(screen.getByText('캠퍼스 생활 가이드')).toBeInTheDocument()
  expect(screen.getByText('공과대학')).toBeInTheDocument()
  expect(screen.getByText('학교정보 FAQ')).toBeInTheDocument()
})

test('학교정보 빠른 링크가 표시된다', async () => {
  mockFetchSchoolInfo.mockResolvedValue(mockUniversity)
  renderPage()

  await waitFor(() => {
    expect(screen.getAllByRole('link', { name: /학부·학과 선택/ }).length).toBeGreaterThan(0)
  })
  expect(screen.getAllByRole('link', { name: /학교 공지/ }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('link', { name: /학교 일정/ }).length).toBeGreaterThan(0)
})
