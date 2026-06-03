import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { DepartmentDetailDto } from '../../types/department'
import ContactSection from './ContactSection'

const baseDept: DepartmentDetailDto = {
  id: 1,
  name: '컴퓨터공학과',
  description: '소프트웨어 인재를 양성합니다.',
  professors: [],
  curriculum: [],
  address: '전남 무안군 청계면 영산로 1666 공학관 101호',
  phone: '061-450-2400',
  email: 'dept@mokpo.ac.kr',
  hours: '평일 09:00 ~ 18:00',
}

function renderSection(dept: DepartmentDetailDto) {
  return render(
    <MemoryRouter>
      <ContactSection dept={dept} />
    </MemoryRouter>,
  )
}

test('구체적인 주소가 있으면 지도 검색 링크를 표시한다', () => {
  renderSection(baseDept)

  const link = screen.getByRole('link', { name: /지도에서 주소 검색/ })
  expect(link).toHaveAttribute(
    'href',
    'https://map.naver.com/p/search/%EC%A0%84%EB%82%A8%20%EB%AC%B4%EC%95%88%EA%B5%B0%20%EC%B2%AD%EA%B3%84%EB%A9%B4%20%EC%98%81%EC%82%B0%EB%A1%9C%201666%20%EA%B3%B5%ED%95%99%EA%B4%80%20101%ED%98%B8',
  )
})

test('구체적인 주소가 없으면 지도 검색 링크를 숨긴다', () => {
  renderSection({
    ...baseDept,
    address: '공식 홈페이지 확인 필요',
  })

  expect(screen.queryByRole('link', { name: /지도에서 주소 검색/ })).not.toBeInTheDocument()
  expect(screen.getByText('구체적인 주소가 등록되면 지도 링크가 표시됩니다.')).toBeInTheDocument()
})
