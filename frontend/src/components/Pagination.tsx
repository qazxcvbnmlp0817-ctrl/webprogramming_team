interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  const pages = Array.from({ length: Math.min(total, 10) }, (_, i) => i + 1)

  return (
    <div className="flex justify-center gap-1 mt-8">
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
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
