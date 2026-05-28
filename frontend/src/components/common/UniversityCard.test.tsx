import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import UniversityCard, { activityScore } from './UniversityCard'
import type { UniversityDto } from '../../types/university'

const mockUniv: UniversityDto = {
  id: 1,
  name: '목포대학교',
  description: '국립 목포대학교',
  schools: [
    { id: 1, name: '공과대학', description: '', faculties: [] },
    { id: 2, name: '사범대학', description: '', faculties: [] },
  ],
  totalDeptCount: 10,
}

function renderCard(overrides: Partial<Parameters<typeof UniversityCard>[0]> = {}) {
  return render(
    <UniversityCard
      univ={mockUniv}
      maxScore={40}
      maxDepts={10}
      maxSchools={2}
      onSelect={vi.fn()}
      {...overrides}
    />
  )
}

test('대학교 이름이 표시된다', () => {
  renderCard()
  expect(screen.getByText('목포대학교')).toBeInTheDocument()
})

test('단과대학 수와 학과 수가 표시된다', () => {
  renderCard()
  expect(screen.getByText('2개 단과대학')).toBeInTheDocument()
  expect(screen.getByText('10개 학과')).toBeInTheDocument()
})

test('activityScore = totalDeptCount*3 + schools.length*5', () => {
  expect(activityScore(mockUniv)).toBe(10 * 3 + 2 * 5) // 40
})

test('버튼 클릭 시 onSelect가 호출된다', () => {
  const onSelect = vi.fn()
  renderCard({ onSelect })
  screen.getByRole('button').click()
  expect(onSelect).toHaveBeenCalledTimes(1)
})

test('프리뷰 패널의 현황 레이블이 존재한다', () => {
  renderCard()
  expect(screen.getByText('📊 주간 현황 (최근 7일)')).toBeInTheDocument()
})

test('프리뷰 패널에 단과대학/학과 수/활동 점수 레이블이 모두 있다', () => {
  renderCard()
  expect(screen.getByText('단과대학')).toBeInTheDocument()
  expect(screen.getByText('학과 수')).toBeInTheDocument()
  expect(screen.getByText('활동 점수')).toBeInTheDocument()
})
