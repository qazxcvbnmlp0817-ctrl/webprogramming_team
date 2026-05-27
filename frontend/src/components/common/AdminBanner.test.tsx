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
  extras?: Record<string, string>,
) {
  sessionStorage.clear()
  if (adminRole) {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', adminRole)
  }
  if (extras) {
    Object.entries(extras).forEach(([k, v]) => sessionStorage.setItem(k, v))
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

test('비어있음 — DEPT_ADMIN on selection (접근 권한 없음)', () => {
  setup('selection', 'DEPT_ADMIN')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('비어있음 — SCHOOL_ADMIN on selection (접근 권한 없음)', () => {
  setup('selection', 'SCHOOL_ADMIN')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
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
  setup('school', 'SCHOOL_ADMIN', 2, { universityId: '2' })
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('학교 관리자')).toBeInTheDocument()
})

test('표시 — SUPER_ADMIN on school', () => {
  setup('school', 'SUPER_ADMIN', 2)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('표시 — DEPT_ADMIN on dept, 배지 학과 관리자', () => {
  setup('dept', 'DEPT_ADMIN', 5, { deptId: '5' })
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

test('비어있음 — SCHOOL_ADMIN on school, 다른 대학 universityId', () => {
  setup('school', 'SCHOOL_ADMIN', 9, { universityId: '5' })
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('비어있음 — DEPT_ADMIN on dept, 다른 학과 deptId', () => {
  setup('dept', 'DEPT_ADMIN', 7, { deptId: '3' })
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('navigate → /admin/school/5 (school scope, SCHOOL_ADMIN 소속 대학)', () => {
  setup('school', 'SCHOOL_ADMIN', 5, { universityId: '5' })
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/school/5')
})


test('navigate → /admin/school/3 (school)', () => {
  setup('school', 'SUPER_ADMIN', 3)
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/school/3')
})

test('navigate → /admin/dept/7 (dept scope, DEPT_ADMIN 소속 학과)', () => {
  setup('dept', 'DEPT_ADMIN', 7, { deptId: '7' })
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/dept/7')
})

