import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import BoardPage from './BoardPage'
import { DeptProvider } from '../context/DeptContext'

const mockPosts = [
  { id: 1, title: '자료구조 족보', date: '2026-05-01', author: '박민수', likes: 45, category: '자유게시판', viewCount: 312, featured: false, commentCount: 18, targetGrades: [1,2,3,4], visibility: 'public' },
  { id: 2, title: '스터디 모집',   date: '2026-04-25', author: '홍길동', likes: 24, category: '스터디',    viewCount: 150, featured: false, commentCount:  7, targetGrades: [1,2,3,4], visibility: 'public' },
]

vi.mock('../hooks/useDeptFetch', () => ({
  useDeptFetch: () => ({ data: { posts: mockPosts }, loading: false, error: null }),
}))

vi.mock('../utils/accessCheck', () => ({
  isLoggedIn: () => true,
  isSameDept: () => true,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <DeptProvider>
        <BoardPage />
      </DeptProvider>
    </MemoryRouter>
  )
}

test('게시글 목록이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getAllByText('자료구조 족보').length).toBeGreaterThan(0)
    expect(screen.getAllByText('스터디 모집').length).toBeGreaterThan(0)
  })
})

test('제목 검색으로 필터링된다', async () => {
  renderPage()
  await waitFor(() => screen.getAllByText('자료구조 족보'))

  // 제목 타입 선택 후 검색
  fireEvent.click(screen.getByText('제목'))
  fireEvent.change(screen.getByPlaceholderText('제목으로 검색...'), { target: { value: '스터디' } })

  await waitFor(() => {
    // '자료구조 족보'는 사이드바에만 남고 목록에서는 사라져 총 1개
    expect(screen.queryAllByText('자료구조 족보').length).toBe(1)
    // '스터디 모집'은 목록 + 사이드바 = 2개 이상
    expect(screen.getAllByText('스터디 모집').length).toBeGreaterThanOrEqual(1)
  })
})
