import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import NoticePage from './NoticePage'
import { DeptProvider } from '../context/DeptContext'

const mockNotices = [
  { id: 1, title: '공지 제목1', date: '2026-05-11', author: '학과', category: '학사', viewCount: 100, featured: false, commentCount: 0, targetGrades: [1,2,3,4] },
  { id: 2, title: '공지 제목2', date: '2026-05-10', author: '학과', category: '장학', viewCount: 50,  featured: false, commentCount: 0, targetGrades: [1,2,3,4] },
]

vi.mock('../hooks/useDeptFetch', () => ({
  useDeptFetch: () => ({ data: { notices: mockNotices, featured: null }, loading: false, error: null }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <DeptProvider>
        <NoticePage />
      </DeptProvider>
    </MemoryRouter>
  )
}

test('공지 목록이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getAllByText('공지 제목1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('공지 제목2').length).toBeGreaterThan(0)
  })
})

test('학사 탭 클릭 시 학사 공지만 메인 목록에 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getAllByText('공지 제목1'))

  fireEvent.click(screen.getByRole('button', { name: '학사' }))

  // 학사 공지는 목록 + 사이드바에 존재 (최소 1개)
  expect(screen.getAllByText('공지 제목1').length).toBeGreaterThanOrEqual(1)
  // 장학 공지는 사이드바에만 남음 (목록에서는 제거) - 총 1개
  expect(screen.queryAllByText('공지 제목2').length).toBe(1)
})
