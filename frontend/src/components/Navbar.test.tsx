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
