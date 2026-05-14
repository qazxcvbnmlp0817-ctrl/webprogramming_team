import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

function renderNavbar(currentPath = '/') {
  return render(
    <MemoryRouter initialEntries={[currentPath]}>
      <Navbar />
    </MemoryRouter>
  )
}

test('로고가 렌더링된다', () => {
  renderNavbar()
  expect(screen.getByText('학과정보통합서비스')).toBeInTheDocument()
})

test('공지사항 링크가 존재한다', () => {
  renderNavbar()
  expect(screen.getAllByText('공지사항').length).toBeGreaterThan(0)
})

test('/notice 경로에서 공지사항 링크가 활성화된다', () => {
  renderNavbar('/notice')
  const links = screen.getAllByText('공지사항')
  const activeLink = links.find(el => el.closest('a')?.className.includes('border-white'))
  expect(activeLink).toBeTruthy()
})

test('햄버거 버튼 클릭 시 모바일 메뉴가 나타난다', () => {
  renderNavbar()
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
  expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
})

test('학교 변경 버튼이 렌더링된다', () => {
  renderNavbar()
  expect(screen.getAllByText('학교 변경').length).toBeGreaterThan(0)
})

test('학교 변경 버튼이 /universities로 연결된다', () => {
  renderNavbar()
  const links = screen.getAllByText('학교 변경')
  expect(links[0].closest('a')).toHaveAttribute('href', '/universities')
})

test('모바일 메뉴에 학교 변경 항목이 있다', () => {
  renderNavbar()
  fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
  const mobileMenu = screen.getByTestId('mobile-menu')
  expect(mobileMenu).toHaveTextContent('학교 변경')
})
