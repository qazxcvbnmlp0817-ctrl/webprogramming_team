import { renderHook, act } from '@testing-library/react'
import { useCurrentRole } from './useCurrentRole'

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

test('returns GUEST when not logged in', () => {
  const { result } = renderHook(() => useCurrentRole())

  expect(result.current).toBe('GUEST')
})

test('returns ADMIN for admin member type', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('memberType', 'admin')

  const { result } = renderHook(() => useCurrentRole())

  expect(result.current).toBe('ADMIN')
})

test('returns ADMIN for super admin role even when member type is not admin', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('memberType', 'student')
  sessionStorage.setItem('adminRole', 'SUPER_ADMIN')

  const { result } = renderHook(() => useCurrentRole())

  expect(result.current).toBe('ADMIN')
})

test('uses remembered auth storage', () => {
  localStorage.setItem('auth_isLoggedIn', 'true')
  localStorage.setItem('auth_adminRole', 'SCHOOL_ADMIN')

  const { result } = renderHook(() => useCurrentRole())

  expect(result.current).toBe('ADMIN')
})

test('updates after loginChanged event', () => {
  const { result } = renderHook(() => useCurrentRole())
  expect(result.current).toBe('GUEST')

  act(() => {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', 'DEPT_ADMIN')
    window.dispatchEvent(new Event('loginChanged'))
  })

  expect(result.current).toBe('ADMIN')
})
