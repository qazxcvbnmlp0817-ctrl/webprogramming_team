import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from './Sidebar'

test('위젯 제목이 렌더링된다', () => {
  render(
    <Sidebar
      categoryWidget={{
        title: '카테고리',
        items: [{ label: '전체', count: 32 }, { label: '학사', count: 14 }],
        onSelect: () => {},
      }}
      recentWidget={{
        title: '최근 공지',
        items: [{ title: '공지 제목', sub: '2026-05-11' }],
      }}
    />
  )
  expect(screen.getByText('카테고리')).toBeInTheDocument()
  expect(screen.getByText('최근 공지')).toBeInTheDocument()
  expect(screen.getByText('전체')).toBeInTheDocument()
  expect(screen.getByText('32')).toBeInTheDocument()
  expect(screen.getByText('공지 제목')).toBeInTheDocument()
})

test('카테고리 항목 클릭 시 onSelect가 호출된다', () => {
  const onSelect = vi.fn()
  render(
    <Sidebar
      categoryWidget={{
        title: '카테고리',
        items: [{ label: '전체', count: 32 }, { label: '학사', count: 14 }],
        onSelect,
      }}
      recentWidget={{
        title: '최근 공지',
        items: [{ title: '공지 제목', sub: '2026-05-11' }],
      }}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: /전체/ }))
  expect(onSelect).toHaveBeenCalledWith('전체')
})
