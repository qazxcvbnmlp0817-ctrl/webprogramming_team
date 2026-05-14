import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import BoardPage from './BoardPage'

vi.mock('../api/posts', () => ({
  fetchPosts: () => Promise.resolve({
    featured: { id: 1, title: '인기글', date: '2026-05-01', author: '홍길동', likes: 45, category: '자유게시판', viewCount: 312, featured: true, commentCount: 18 },
    posts: [
      { id: 1, title: '자료구조 족보', date: '2026-05-01', author: '박민수', likes: 45, category: '자유게시판', viewCount: 312, featured: false, commentCount: 18 },
      { id: 2, title: '스터디 모집',   date: '2026-04-25', author: '홍길동', likes: 24, category: '스터디',    viewCount: 150, featured: false, commentCount:  7 },
    ],
  }),
}))

function renderPage() {
  return render(<MemoryRouter><BoardPage /></MemoryRouter>)
}

test('게시글 목록이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /자료구조 족보/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /스터디 모집/ })).toBeInTheDocument()
  })
})

test('제목 검색으로 필터링된다', async () => {
  renderPage()
  await waitFor(() => screen.getByRole('link', { name: /자료구조 족보/ }))

  fireEvent.change(screen.getByPlaceholderText('제목으로 검색...'), { target: { value: '스터디' } })
  // 자료구조 족보는 링크(메인 목록)에서 제거됨
  expect(screen.queryByRole('link', { name: /자료구조 족보/ })).not.toBeInTheDocument()
  // 스터디 모집은 남아있음
  expect(screen.getByRole('link', { name: /스터디 모집/ })).toBeInTheDocument()
})
