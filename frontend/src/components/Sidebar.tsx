interface CategoryItem {
  label: string
  count: number
}

interface RecentItem {
  title: string
  sub: string
}

interface SidebarProps {
  categoryWidget: {
    title: string
    items: CategoryItem[]
    onSelect: (label: string) => void
  }
  recentWidget: {
    title: string
    items: RecentItem[]
  }
}

export default function Sidebar({ categoryWidget, recentWidget }: SidebarProps) {
  return (
    <aside className="lg:w-72 flex-shrink-0 flex flex-col gap-6">
      <div className="border-2 border-black">
        <div className="bg-black text-white px-4 py-2 text-sm font-bold">
          {categoryWidget.title}
        </div>
        <ul className="divide-y divide-gray-200 text-sm">
          {categoryWidget.items.map(({ label, count }) => (
            <li
              key={label}
              className="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => categoryWidget.onSelect(label)}
            >
              <span>{label}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-2 border-black">
        <div className="bg-black text-white px-4 py-2 text-sm font-bold">
          {recentWidget.title}
        </div>
        <ul className="divide-y divide-gray-200 text-sm">
          {recentWidget.items.map((item, i) => (
            <li key={i} className="px-4 py-2 hover:bg-gray-50">
              <p className="leading-snug text-black">{item.title}</p>
              <span className="text-gray-400 text-xs">{item.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
