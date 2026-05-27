import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RoleManageModal from './RoleManageModal'
import type { AdminUser } from '../../api/adminSchool'

const makeUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 1,
  username: 'prof_kim',
  name: '김민준',
  memberType: 'professor',
  adminRole: null,
  status: 'ACTIVE',
  department: '컴퓨터공학과',
  universityId: '1',
  createdDate: '2026-01-01',
  ...overrides,
})

describe('RoleManageModal', () => {
  it('사용자 이름, 아이디, memberType, 현재 역할을 표시한다', () => {
    const user = makeUser({ adminRole: 'DEPT_ADMIN' })
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={vi.fn()} />)

    expect(screen.getByText('김민준')).toBeInTheDocument()
    expect(screen.getByText('(prof_kim)')).toBeInTheDocument()
    expect(screen.getByText('professor')).toBeInTheDocument()
    expect(screen.getAllByText('DEPT_ADMIN').length).toBeGreaterThan(0)
  })

  it('admin 타입이면 없음 라디오가 disabled된다', () => {
    const user = makeUser({ memberType: 'admin', adminRole: 'SCHOOL_ADMIN' })
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={vi.fn()} />)

    const radios = screen.getAllByRole('radio')
    const noneRadio = radios.find(r => (r as HTMLInputElement).value === '')
    expect(noneRadio).toBeDisabled()
  })

  it('역할 변경 없으면 저장 버튼이 disabled된다', () => {
    const user = makeUser({ adminRole: 'DEPT_ADMIN' })
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={vi.fn()} />)

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('다른 역할 선택 후 저장 클릭 시 onSave(userId, newRole)가 호출된다', async () => {
    const user = makeUser({ adminRole: null })
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={onSave} />)

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(1, 'DEPT_ADMIN'))
  })

  it('onSave 실패 시 에러 메시지를 모달 내부에 표시한다', async () => {
    const user = makeUser({ adminRole: null })
    const onSave = vi.fn().mockRejectedValue(new Error('이미 상위 역할을 보유하고 있습니다'))
    render(<RoleManageModal user={user} onClose={vi.fn()} onSave={onSave} />)

    const deptRadio = screen.getAllByRole('radio').find(
      r => (r as HTMLInputElement).value === 'DEPT_ADMIN'
    )!
    fireEvent.click(deptRadio)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('이미 상위 역할을 보유하고 있습니다')).toBeInTheDocument()
  })

  it('취소 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn()
    render(<RoleManageModal user={makeUser()} onClose={onClose} onSave={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('✕ 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn()
    render(<RoleManageModal user={makeUser()} onClose={onClose} onSave={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalled()
  })
})
