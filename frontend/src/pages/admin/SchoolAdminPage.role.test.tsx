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
    { id: 1, name: '김교수', username: 'prof_kim', memberType: 'professor',
      adminRole: null, status: 'ACTIVE', department: null, universityId: '1', createdDate: '' },
    { id: 2, name: '이조교', username: 'ta_lee', memberType: 'assistant',
      adminRole: 'DEPT_ADMIN', status: 'ACTIVE', department: null, universityId: '1', createdDate: '' },
  ]),
  fetchSchoolPendingUsers: vi.fn().mockResolvedValue([]),
  fetchSchoolUsers: vi.fn().mockResolvedValue([
    { id: 2, name: '이조교', username: 'ta_lee', memberType: 'assistant',
      adminRole: 'DEPT_ADMIN', status: 'ACTIVE', department: null, universityId: '1', createdDate: '' },
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

describe('SchoolAdminPage — 역할 관리 모달', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateRole.mockResolvedValue(undefined)
    sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
    sessionStorage.setItem('username', 'school_admin')
    sessionStorage.setItem('universityId', '1')
  })

  it('"전체 사용자" 탭에 사용자마다 "역할 관리" 버튼이 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    expect(buttons).toHaveLength(2)
  })

  it('"역할 관리" 버튼 클릭 시 모달 다이얼로그가 열린다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    fireEvent.click(buttons[0])
    expect(await screen.findByRole('dialog', { name: /역할 관리/ })).toBeInTheDocument()
  })

  it('모달에서 DEPT_ADMIN 선택 후 저장 시 updateSchoolUserRole이 호출된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    fireEvent.click(buttons[0])
    await screen.findByRole('dialog')

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() =>
      expect(mockUpdateRole).toHaveBeenCalledWith(1, 'DEPT_ADMIN', undefined)
    )
  })

  it('역할 저장 실패 시 에러 메시지가 모달 내부에 표시된다', async () => {
    mockUpdateRole.mockRejectedValueOnce(new Error('이미 상위 역할을 보유하고 있습니다'))
    renderPage()
    fireEvent.click(await screen.findByText('전체 사용자'))
    const buttons = await screen.findAllByRole('button', { name: '역할 관리' })
    fireEvent.click(buttons[0])
    await screen.findByRole('dialog')

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(
      await screen.findByText('이미 상위 역할을 보유하고 있습니다')
    ).toBeInTheDocument()
  })

  it('"관리자 계정" 탭에 memberType 뱃지가 adminRole과 함께 표시된다', async () => {
    renderPage()
    fireEvent.click(await screen.findByText('관리자 계정'))
    expect(await screen.findByText('assistant')).toBeInTheDocument()
    expect(screen.getByText('DEPT_ADMIN')).toBeInTheDocument()
  })
})
