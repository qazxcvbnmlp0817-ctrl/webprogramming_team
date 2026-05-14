interface FilterTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export default function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 text-sm border border-black font-medium transition ${
            active === tab ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
