import { renderHook, act } from '@testing-library/react'
import { useAdminRole } from './useAdminRole'

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

test('로그인 안 된 상태에서 null 반환', () => {
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()
})

test('student로 로그인 시 null 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('memberType', 'student')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()
})

test('SUPER_ADMIN 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('adminRole', 'SUPER_ADMIN')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBe('SUPER_ADMIN')
})

test('SCHOOL_ADMIN 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBe('SCHOOL_ADMIN')
})

test('remembered auth storage is used', () => {
  localStorage.setItem('auth_isLoggedIn', 'true')
  localStorage.setItem('auth_adminRole', 'DEPT_ADMIN')

  const { result } = renderHook(() => useAdminRole())

  expect(result.current).toBe('DEPT_ADMIN')
})

test('DEPT_ADMIN 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('adminRole', 'DEPT_ADMIN')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBe('DEPT_ADMIN')
})

test('loginChanged 이벤트 발생 시 역할 갱신', () => {
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()

  act(() => {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', 'SUPER_ADMIN')
    window.dispatchEvent(new Event('loginChanged'))
  })

  expect(result.current).toBe('SUPER_ADMIN')
})

test('storage 이벤트 발생 시 역할 갱신', () => {
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()

  act(() => {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
    window.dispatchEvent(new Event('storage'))
  })

  expect(result.current).toBe('SCHOOL_ADMIN')
})
