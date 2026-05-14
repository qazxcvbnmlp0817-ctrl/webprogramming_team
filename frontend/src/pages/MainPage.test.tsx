import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MainPage from './MainPage'

vi.mock('../api/universities', () => ({
  fetchMainData: () => Promise.resolve({
    notices: [
      { id: 1, title: '공지사항 제목1', date: '2026-05-10', author: '학과', category: '학사', viewCount: 10, featured: false },
    ],
    posts: [
      { id: 1, title: '인기글 제목1', date: '2026-05-10', author: '홍길동', likes: 5, category: '자유게시판', viewCount: 10, featured: false, commentCount: 0 },
    ],
    schedules: [
      { id: 1, title: '중간고사', date: '2026-05-15', dday: 20, category: '시험' },
    ],
    today: '2026-05-14 (목)',
  }),
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({ selectedDeptName: '컴퓨터공학과' }),
}))

function renderPage() {
  return render(<MemoryRouter><MainPage /></MemoryRouter>)
}

test('캘린더가 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument()
  })
})

test('공지사항 섹션이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('공지사항 제목1')).toBeInTheDocument()
  })
})

test('인기 게시글 섹션이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('인기글 제목1')).toBeInTheDocument()
  })
})

test('다가오는 일정 섹션이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('중간고사')).toBeInTheDocument()
  })
})
