interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  const maxPages = Math.min(total, 10)
  const half = Math.floor(maxPages / 2)
  let start = Math.max(1, current - half)
  const end = Math.min(total, start + maxPages - 1)
  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1)
  }
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex justify-center gap-1 mt-8">
      {pages.map(p => (
        <button
          key={p}
          onClick={() => p !== current && onChange(p)}
          aria-current={p === current ? 'page' : undefined}
          className={`w-8 h-8 border border-black text-sm font-medium ${
            p === current ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
