import { render, screen, fireEvent } from '@testing-library/react'
import FilterTabs from './FilterTabs'

test('탭 목록이 렌더링된다', () => {
  render(
    <FilterTabs tabs={['전체', '학사', '장학']} active="전체" onChange={() => {}} />
  )
  expect(screen.getByText('전체')).toBeInTheDocument()
  expect(screen.getByText('학사')).toBeInTheDocument()
  expect(screen.getByText('장학')).toBeInTheDocument()
})

test('활성 탭은 검정 배경을 갖는다', () => {
  render(
    <FilterTabs tabs={['전체', '학사']} active="학사" onChange={() => {}} />
  )
  const activeBtn = screen.getByText('학사')
  expect(activeBtn.className).toContain('bg-black')
})

test('탭 클릭 시 onChange가 호출된다', () => {
  const onChange = vi.fn()
  render(
    <FilterTabs tabs={['전체', '학사']} active="전체" onChange={onChange} />
  )
  fireEvent.click(screen.getByText('학사'))
  expect(onChange).toHaveBeenCalledWith('학사')
})
