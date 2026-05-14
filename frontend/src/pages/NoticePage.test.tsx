import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import NoticePage from './NoticePage'

vi.mock('../api/notices', () => ({
  fetchNotices: () => Promise.resolve({
    featured: { id: 1, title: '긴급 공지', date: '2026-05-11', author: '학과', category: '학사', viewCount: 215, featured: true },
    notices: [
      { id: 1, title: '공지 제목1', date: '2026-05-11', author: '학과', category: '학사', viewCount: 100, featured: false },
      { id: 2, title: '공지 제목2', date: '2026-05-10', author: '학과', category: '장학', viewCount: 50,  featured: false },
    ],
  }),
}))

function renderPage() {
  return render(<MemoryRouter><NoticePage /></MemoryRouter>)
}

test('공지 목록이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /공지 제목1/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /공지 제목2/ })).toBeInTheDocument()
  })
})

test('학사 탭 클릭 시 학사 공지만 메인 목록에 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByRole('link', { name: /공지 제목1/ }))

  // FilterTabs 버튼 클릭 (aria-pressed 속성으로 식별)
  fireEvent.click(screen.getByRole('button', { name: '학사' }))
  // 학사 공지는 링크로 남아있음
  expect(screen.getByRole('link', { name: /공지 제목1/ })).toBeInTheDocument()
  // 장학 공지는 링크(메인 목록)에서 제거됨
  expect(screen.queryByRole('link', { name: /공지 제목2/ })).not.toBeInTheDocument()
})
