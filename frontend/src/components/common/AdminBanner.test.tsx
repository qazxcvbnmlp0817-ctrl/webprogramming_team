import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AdminBanner from './AdminBanner'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function setup(
  scope: 'selection' | 'school' | 'dept',
  adminRole?: string,
  targetId?: number,
) {
  sessionStorage.clear()
  if (adminRole) {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', adminRole)
  }
  return render(
    <MemoryRouter>
      <AdminBanner scope={scope} targetId={targetId} />
    </MemoryRouter>,
  )
}

beforeEach(() => mockNavigate.mockClear())

test('비어있음 — 비로그인', () => {
  setup('dept')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('표시 — DEPT_ADMIN on selection (역할별 대시보드로 진입)', () => {
  setup('selection', 'DEPT_ADMIN')
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('표시 — SCHOOL_ADMIN on selection (역할별 대시보드로 진입)', () => {
  setup('selection', 'SCHOOL_ADMIN')
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('비어있음 — DEPT_ADMIN on school', () => {
  setup('school', 'DEPT_ADMIN', 2)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('표시 — SUPER_ADMIN on selection, 배지 최고 관리자', () => {
  setup('selection', 'SUPER_ADMIN')
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('최고 관리자')).toBeInTheDocument()
})

test('표시 — SCHOOL_ADMIN on school, 배지 학교 관리자', () => {
  setup('school', 'SCHOOL_ADMIN', 2)
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('학교 관리자')).toBeInTheDocument()
})

test('표시 — SUPER_ADMIN on school', () => {
  setup('school', 'SUPER_ADMIN', 2)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('표시 — DEPT_ADMIN on dept, 배지 학과 관리자', () => {
  setup('dept', 'DEPT_ADMIN', 5)
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('학과 관리자')).toBeInTheDocument()
})

test('표시 — SCHOOL_ADMIN on dept', () => {
  setup('dept', 'SCHOOL_ADMIN', 5)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('navigate → /admin/super (selection, SUPER_ADMIN)', () => {
  setup('selection', 'SUPER_ADMIN')
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/super')
})

test('navigate → /admin/school/{univId} (selection, SCHOOL_ADMIN w/ universityId)', () => {
  setup('selection', 'SCHOOL_ADMIN')
  sessionStorage.setItem('universityId', '5')
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/school/5')
})

test('navigate → /admin/super (selection, SCHOOL_ADMIN w/o universityId)', () => {
  setup('selection', 'SCHOOL_ADMIN')
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/super')
})

test('navigate → /admin/school/3 (school)', () => {
  setup('school', 'SUPER_ADMIN', 3)
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/school/3')
})

test('navigate → /admin/dept/7 (dept)', () => {
  setup('dept', 'DEPT_ADMIN', 7)
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/dept/7')
})
