import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CalendarPage from './CalendarPage'

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({ selectedDeptId: 1, selectedDeptName: '컴퓨터공학과' }),
  DeptProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  // Set up authentication
  localStorageMock.setItem('auth_isLoggedIn', 'true')
})

function renderPage() {
  return render(<MemoryRouter><CalendarPage /></MemoryRouter>)
}

test('개인 캘린더 페이지가 렌더링된다', () => {
  renderPage()
  expect(screen.getByText('+ 일정 추가')).toBeInTheDocument()
})

test('오늘의 일정 섹션이 표시된다', () => {
  renderPage()
  expect(screen.getByText(/오늘의 일정/)).toBeInTheDocument()
})

test('요일 헤더(일월화수목금토)가 표시된다', () => {
  renderPage()
  expect(screen.getAllByText('일').length).toBeGreaterThan(0)
  expect(screen.getAllByText('토').length).toBeGreaterThan(0)
})

test('오늘 이동 버튼이 있다', () => {
  renderPage()
  expect(screen.getByText('오늘')).toBeInTheDocument()
})
