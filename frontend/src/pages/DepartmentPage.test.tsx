import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import DepartmentPage from './DepartmentPage'

const mockFetchDepartmentDetail = vi.hoisted(() => vi.fn())

vi.mock('../api/departments', () => ({
  fetchDepartmentDetail: mockFetchDepartmentDetail,
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({
    selectedDeptId: 1,
    selectedDeptName: '컴퓨터공학과',
    selectedUniversityId: 1,
    selectedUniversityName: '목포대학교',
    selectedSchoolName: '공과대학',
  }),
}))

const mockDept = {
  id: 1,
  name: '컴퓨터공학과',
  description: '컴퓨터공학과는 소프트웨어 인재를 양성합니다.',
  professors: [
    { id: 11, name: '김교수', specialty: '소프트웨어공학', email: 'kim@mokpo.ac.kr' },
  ],
  curriculum: [
    { name: '웹프로그래밍', year: '2학년', required: true, credit: 3, category: '전공핵심' },
  ],
  address: '전남 무안군 청계면 영산로 1666',
  phone: '061-450-2400',
  email: 'dept1@mokpo.ac.kr',
  hours: '평일 09:00 ~ 18:00',
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/dept/department']}>
      <DepartmentPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockFetchDepartmentDetail.mockReset()
})

test('학과정보 성공 화면이 렌더링된다', async () => {
  mockFetchDepartmentDetail.mockResolvedValue(mockDept)
  renderPage()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: '컴퓨터공학과' })).toBeInTheDocument()
  })
  expect(screen.getByText('김교수')).toBeInTheDocument()
  expect(screen.getAllByText('웹프로그래밍').length).toBeGreaterThan(0)
})

test('학과정보 에러 화면이 렌더링된다', async () => {
  mockFetchDepartmentDetail.mockRejectedValue(new Error('학과 정보를 불러오지 못했습니다'))
  renderPage()

  await waitFor(() => {
    expect(screen.getByText('학과 정보를 불러올 수 없습니다')).toBeInTheDocument()
  })
  expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
})

test('교수진과 교육과정이 비어도 안내 문구가 표시된다', async () => {
  mockFetchDepartmentDetail.mockResolvedValue({
    ...mockDept,
    professors: [],
    curriculum: [],
  })
  renderPage()

  await waitFor(() => {
    expect(screen.getByText('교수진 공식 데이터 연결 대기 중')).toBeInTheDocument()
  })
  expect(screen.getByText('교육과정 데이터 연결 대기 중')).toBeInTheDocument()
})
