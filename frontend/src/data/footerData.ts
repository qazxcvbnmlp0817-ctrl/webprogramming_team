export interface FooterLink {
  label: string
  href: string
}

export interface FooterData {
  universityName: string
  serviceName: string
  address: string
  phone: string
  email: string
  copyright: string
  links: FooterLink[]
}

// DB 연동 시 이 객체를 API 응답으로 교체하세요
const currentYear = new Date().getFullYear()

export const footerData: FooterData = {
  universityName: '국립목포대학교',
  serviceName: '학과정보통합서비스',
  address: '전라남도 무안군 청계면 영산로 1666',
  phone: '061-450-2114',
  email: 'webmaster@mokpo.ac.kr',
  copyright: `© ${currentYear} 국립목포대학교. All rights reserved.`,
  links: [
    { label: '개인정보처리방침', href: '#' },
    { label: '이용약관', href: '#' },
    { label: '사이트맵', href: '#' },
  ],
}
