import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SchoolAdminPage from './SchoolAdminPage'

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {}, LinearScale: class {}, PointElement: class {},
  LineElement: class {}, BarElement: class {}, ArcElement: class {},
  Title: class {}, Tooltip: class {}, Legend: class {}, Filler: class {},
}))
vi.mock('react-chartjs-2', () => ({
  Line: () => null, Doughnut: () => null, Bar: () => null,
}))
vi.mock('../../components/Navbar', () => ({ default: () => null }))

const mockUpdateRole = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('../../api/adminSchool', () => ({
  fetchSchoolStats: vi.fn().mockResolvedValue({
    totalUsers: 10, totalPosts: 5, totalNotices: 3,
    pendingApprovals: 0, activeAdmins: 1, totalVisits: 100,
  }),
  fetchSchoolVisitors: vi.fn().mockResolvedValue([]),
  fetchSchoolMonthlyStats: vi.fn().mockResolvedValue([]),
  fetchSchoolAllUsers: vi.fn().mockResolvedValue([
    { id: 1, name: '김교수', username: 'prof_kim', memberType: 'professor', adminRole: null,         status: 'ACTIVE' },
    { id: 2, name: '이조교', username: 'ta_lee',   memberType: 'assistant', adminRole: 'DEPT_ADMIN', status: 'ACTIVE' },
  ]),
  fetchSchoolPendingUsers: vi.fn().mockResolvedValue([]),
  fetchSchoolUsers: vi.fn().mockResolvedValue([
    { id: 2, name: '이조교', username: 'ta_lee', memberType: 'assistant', adminRole: 'DEPT_ADMIN', status: 'ACTIVE' },
  ]),
  fetchAdminLogs: vi.fn().mockResolvedValue([]),
  fetchSchoolPosts: vi.fn().mockResolvedValue({ posts: [], totalPages: 1 }),
  fetchSchoolProfessors: vi.fn().mockResolvedValue([]),
  fetchSchoolCourses: vi.fn().mockResolvedValue([]),
  fetchSchoolAssignments: vi.fn().mockResolvedValue([]),
  updateSchoolUserRole: mockUpdateRole,
  deleteSchoolPost: vi.fn(),
  updateUserStatus: vi.fn().mockResolvedValue(undefined),
  createSchoolAssignment: vi.fn(),
  deleteSchoolAssignment: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/school/1']}>
      <Routes>
        <Route path="/admin/school/:id" element={<SchoolAdminPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SchoolAdminPage — 역할 관리', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateRole.mockResolvedValue(undefined)
    sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
    sessionStorage.setItem('username', 'school_admin')
    sessionStorage.setItem('universityId', '1')
  })

  it('"전체 사용자" 탭에 관리자 역할 드롭다운이 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    expect(selects).toHaveLength(2)
  })

  it('드롭다운에서 DEPT_ADMIN 선택 시 updateSchoolUserRole이 호출된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    // 김교수(adminRole: null) 행 — 첫 번째 드롭다운
    fireEvent.change(selects[0], { target: { value: 'DEPT_ADMIN' } })
    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(1, 'DEPT_ADMIN', undefined)
    })
  })

  it('드롭다운에서 없음 선택 시 updateSchoolUserRole이 빈 문자열로 호출된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    // 이조교(adminRole: DEPT_ADMIN) 행 — 두 번째 드롭다운에서 없음 선택
    fireEvent.change(selects[1], { target: { value: '' } })
    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(2, '', undefined)
    })
  })

  it('역할 변경 실패 시 에러 메시지가 표시된다', async () => {
    mockUpdateRole.mockRejectedValueOnce(new Error('서버 오류'))
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const selects = await screen.findAllByRole('combobox', { name: /관리자 역할/ })
    fireEvent.change(selects[0], { target: { value: 'DEPT_ADMIN' } })
    expect(await screen.findByText('역할 변경에 실패했습니다. 다시 시도해 주세요.')).toBeInTheDocument()
  })

  it('"관리자 계정" 탭에 memberType 뱃지가 adminRole과 함께 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('관리자 계정'))
    // fetchSchoolUsers mock: 이조교(assistant, DEPT_ADMIN) 반환
    expect(await screen.findByText('assistant')).toBeInTheDocument()
    expect(screen.getByText('DEPT_ADMIN')).toBeInTheDocument()
  })
})
