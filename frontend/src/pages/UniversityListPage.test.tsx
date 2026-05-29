import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import UniversityListPage from './UniversityListPage'

vi.mock('../api/universities', () => ({
  fetchUniversities: () => Promise.resolve([
    {
      id: 1,
      name: '목포대학교',
      description: '국립 목포대학교',
      schools: [
        { id: 1, name: '공과대학', description: '', faculties: [] },
        { id: 2, name: '사범대학', description: '', faculties: [] },
      ],
      totalDeptCount: 10,
    },
    {
      id: 2,
      name: '한양대학교',
      description: '서울 성동구 소재 사립대학교',
      schools: [
        { id: 3, name: '공과대학', description: '', faculties: [] },
      ],
      totalDeptCount: 20,
    },
    {
      id: 3,
      name: '가천대학교',
      description: '경기도 성남시 소재 사립대학교',
      schools: [],
      totalDeptCount: 5,
    },
  ]),
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({
    setUniversityInfo: vi.fn(),
    selectedUniversityId: null,
    selectedDeptId: null,
    selectedDeptName: '',
  }),
  DeptProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../components/common/AdminBanner', () => ({
  default: () => null,
}))

function renderPage() {
  return render(<MemoryRouter><UniversityListPage /></MemoryRouter>)
}

test('모든 대학교 카드가 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('목포대학교')).toBeInTheDocument()
    expect(screen.getByText('한양대학교')).toBeInTheDocument()
    expect(screen.getByText('가천대학교')).toBeInTheDocument()
  })
})

test('검색어 입력 시 일치하는 대학교만 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  await userEvent.type(screen.getByPlaceholderText('대학교 이름 검색...'), '목포')

  expect(screen.getByText('목포대학교')).toBeInTheDocument()
  expect(screen.queryByText('한양대학교')).not.toBeInTheDocument()
  expect(screen.queryByText('가천대학교')).not.toBeInTheDocument()
})

test('검색 결과가 없으면 빈 상태 메시지가 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  await userEvent.type(screen.getByPlaceholderText('대학교 이름 검색...'), '존재하지않는대학교')

  expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
})

test('가나다 순 정렬 시 가천대학교가 첫 번째로 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  await userEvent.click(screen.getByRole('button', { name: '가나다 순' }))

  const cards = screen.getAllByRole('button', { name: /대학교 입장/ })
  // 가천대학교 < 목포대학교 < 한양대학교 순
  expect(cards[0].textContent).toContain('가천대학교')
})

test('활동 많은 순 정렬 시 totalDeptCount가 높은 대학이 앞에 온다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  // 기본이 활동 많은 순이므로 바로 확인
  // 한양대: 20*3 + 1*5 = 65, 목포: 10*3 + 2*5 = 40, 가천: 5*3 + 0*5 = 15
  const cards = screen.getAllByRole('button', { name: /대학교 입장/ })
  expect(cards[0].textContent).toContain('한양대학교')
})
