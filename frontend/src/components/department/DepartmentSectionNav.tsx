const navItems = [
  { href: '#intro', label: '소개' },
  { href: '#professors', label: '교수진' },
  { href: '#curriculum', label: '교육과정' },
  { href: '#careers', label: '진로' },
  { href: '#requirements', label: '졸업·자격증' },
  { href: '#contact', label: '연락처' },
  { href: '#faq', label: 'FAQ' },
]

export default function DepartmentSectionNav() {
  return (
    <nav className="sticky top-14 z-30 bg-white border-b-2 border-black">
      <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="border-2 border-black px-3 py-1.5 text-sm font-bold hover:bg-black hover:text-white transition"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
