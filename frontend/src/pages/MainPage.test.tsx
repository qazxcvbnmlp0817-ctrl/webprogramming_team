import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'
import MainPage from './MainPage'

// vi.hoisted: vi.mock 호이스팅 이전에 변수를 안전하게 초기화
const mockNavigate = vi.hoisted(() => vi.fn())
const mockLoggedIn = vi.hoisted(() => ({ value: false }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...(actual as object), useNavigate: () => mockNavigate }
})

vi.mock('../api/universities', () => ({
  fetchMainData: () => Promise.resolve({
    notices: [
      { id: 1, title: '공지사항 제목1', date: '2026-05-10', author: '학과', category: '학사', viewCount: 10, featured: false, targetGrades: [1,2,3,4], isPublicToOutsiders: true },
      { id: 2, title: '장학금 안내',    date: '2026-05-09', author: '학과', category: '장학', viewCount: 5,  featured: false, targetGrades: [1,2,3,4], isPublicToOutsiders: true },
    ],
    posts: [
      { id: 10, title: '인기글 제목1', date: '2026-05-10', author: '홍길동', likes: 45, category: '자유게시판', viewCount: 100, featured: false, commentCount: 5, targetGrades: [1,2,3,4], visibility: 'public' },
      { id: 11, title: '인기글 제목2', date: '2026-05-09', author: '김철수', likes: 30, category: '스터디',    viewCount: 80,  featured: false, commentCount: 2, targetGrades: [1,2,3,4], visibility: 'public' },
    ],
    schedules: [
      { id: 1, title: '중간고사', date: '2026-05-15', dday: 20, category: '시험' },
      { id: 2, title: '기말고사', date: '2026-06-10', dday: 1,  category: '시험' },
    ],
    today: '2026-05-14 (목)',
  }),
}))

vi.mock('../utils/accessCheck', () => ({
  isLoggedIn: () => mockLoggedIn.value,
}))

vi.mock('../utils/authStorage', () => ({
  getAuthItem: () => null,
}))

vi.mock('../utils/localSchedule', () => ({
  loadSchedules: () => [],
}))

vi.mock('../api/schedules', () => ({
  fetchSchedules: () => Promise.resolve([]),
  fetchFacultySchedules: () => Promise.resolve([]),
  fetchUnivSchedules: () => Promise.resolve([]),
}))

vi.mock('../api/classSchedules', () => ({
  fetchStudentDeptEvents: () => Promise.resolve([]),
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({ selectedDeptId: 1, selectedDeptName: '컴퓨터공학과' }),
  DeptProvider: ({ children }: { children: React.ReactNode }) => children,
}))

beforeEach(() => {
  mockLoggedIn.value = false
  localStorage.clear()
  sessionStorage.clear()
  mockNavigate.mockClear()
})

function renderPage() {
  return render(<MemoryRouter><MainPage /></MemoryRouter>)
}

// ── 기존 테스트 ──────────────────────────────────────────────
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
  mockLoggedIn.value = true
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

test('D-14 이내 일정이 hero 배너에 D-Day 배지로 표시된다', async () => {
  renderPage()
  await waitFor(() => {
    const badges = screen.getAllByText('D-1')
    expect(badges.length).toBeGreaterThan(0)
  })
})

// ── 신규 테스트 ──────────────────────────────────────────────
test('공지사항 카테고리 필터 버튼 5개가 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '학사' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '장학' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행사' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취업' })).toBeInTheDocument()
  })
})

test('학사 필터 클릭 시 학사 공지만 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('장학금 안내'))

  fireEvent.click(screen.getByRole('button', { name: '학사' }))

  await waitFor(() => {
    expect(screen.getByText('공지사항 제목1')).toBeInTheDocument()
    expect(screen.queryByText('장학금 안내')).not.toBeInTheDocument()
  })
})

test('필터 클릭 시 localStorage에 사용자별 키로 저장된다', async () => {
  renderPage()
  await waitFor(() => screen.getByRole('button', { name: '장학' }))

  fireEvent.click(screen.getByRole('button', { name: '장학' }))

  expect(localStorage.getItem('mainNoticeFilter_guest')).toBe('장학')
})

test('공지사항 아이템 클릭 시 /notice/:id로 이동한다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('공지사항 제목1'))

  fireEvent.click(screen.getByText('공지사항 제목1'))

  expect(mockNavigate).toHaveBeenCalledWith('/notice/1')
})

test('인기 게시글 아이템 클릭 시 /post/:id로 이동한다', async () => {
  mockLoggedIn.value = true
  renderPage()
  await waitFor(() => screen.getByText('인기글 제목1'))

  fireEvent.click(screen.getByText('인기글 제목1'))

  expect(mockNavigate).toHaveBeenCalledWith('/post/10')
})
