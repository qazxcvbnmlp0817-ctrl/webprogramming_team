import React from 'react'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { useInitialRedirect } from './useInitialRedirect'

vi.mock('../context/DeptContext', () => ({ useDept: vi.fn() }))

import { useDept } from '../context/DeptContext'
const mockUseDept = vi.mocked(useDept)

const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(MemoryRouter, {}, children)

describe('useInitialRedirect', () => {
  beforeEach(() => { vi.clearAllMocks() })

  test('대학교도 학과도 없으면 /universities 반환', () => {
    mockUseDept.mockReturnValue({
      selectedDeptId: null,
      selectedUniversityId: null,
    } as any)
    const { result } = renderHook(() => useInitialRedirect(), { wrapper })
    expect(result.current).toBe('/universities')
  })

  test('대학교만 있고 학과가 없으면 /school/departments 반환', () => {
    mockUseDept.mockReturnValue({
      selectedDeptId: null,
      selectedUniversityId: 1,
    } as any)
    const { result } = renderHook(() => useInitialRedirect(), { wrapper })
    expect(result.current).toBe('/school/departments')
  })

  test('학과까지 선택된 경우 null 반환 (리다이렉트 없음)', () => {
    mockUseDept.mockReturnValue({
      selectedDeptId: 1,
      selectedUniversityId: 1,
    } as any)
    const { result } = renderHook(() => useInitialRedirect(), { wrapper })
    expect(result.current).toBeNull()
  })
})
