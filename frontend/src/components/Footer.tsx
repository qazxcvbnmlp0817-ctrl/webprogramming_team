import { useLocation } from 'react-router-dom'
import { footerData } from '../data/footerData'

const FOOTER_HIDDEN_PATHS = ['/universities']

export default function Footer() {
  const { pathname } = useLocation()
  if (FOOTER_HIDDEN_PATHS.some(p => pathname === p)) return null
  return (
    <footer className="bg-black text-gray-500 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">

        {/* 좌측: 대학 정보 */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-gray-400">{footerData.universityName}</span>
          <span className="hidden md:inline text-gray-700">|</span>
          <span>{footerData.address}</span>
          <span className="hidden md:inline text-gray-700">|</span>
          <span>Tel. {footerData.phone}</span>
          <span className="hidden md:inline text-gray-700">|</span>
          <span>{footerData.email}</span>
        </div>

        {/* 우측: 링크 + 저작권 */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {footerData.links.map((link, idx) => (
            <span key={link.label} className="flex items-center gap-3">
              <a href={link.href} className="hover:text-gray-300 transition-colors">
                {link.label}
              </a>
              {idx < footerData.links.length - 1 && (
                <span className="text-gray-700">|</span>
              )}
            </span>
          ))}
          <span className="hidden md:inline text-gray-700">|</span>
          <span className="text-gray-600">{footerData.copyright}</span>
        </div>

      </div>
    </footer>
  )
}
