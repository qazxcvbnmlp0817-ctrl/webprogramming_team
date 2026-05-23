import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import FilterTabs from '../components/FilterTabs'
import { fetchSchoolSchedules } from '../api/school'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDept } from '../context/DeptContext'
import { groupByMonth } from '../utils/scheduleUtils'
import AdminBanner from '../components/common/AdminBanner'

const TABS = ['전체', '학사', '행사', '시험', '기타']

const CATEGORY_COLORS: Record<string, string> = {
  '학사': 'bg-blue-100 text-blue-800 border-blue-200',
  '행사': 'bg-green-100 text-green-800 border-green-200',
  '시험': 'bg-red-100 text-red-800 border-red-200',
  '기타': 'bg-gray-100 text-gray-800 border-gray-200',
}

const DDAY_COLOR = (dday: number) => {
  if (dday === 0) return 'bg-red-600 text-white'
  if (dday <= 7) return 'bg-orange-500 text-white'
  if (dday <= 30) return 'bg-yellow-500 text-black'
  return 'bg-gray-800 text-white'
}

export default function SchoolSchedulePage() {
  const { selectedUniversityId, selectedUniversityName } = useDept()
  const [active, setActive] = useState('전체')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data, loading } = useDeptFetch(fetchSchoolSchedules, selectedUniversityId)
  const schedules = data ?? []
  const filtered = active === '전체' ? schedules : schedules.filter(s => s.category === active)
  const grouped = useMemo(() => groupByMonth(filtered), [filtered])
  const categoryCounts = TABS.map(label => ({
    label,
    count: label === '전체' ? schedules.length : schedules.filter(s => s.category === label).length,
  }))

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filtered.filter(s => s.date.startsWith(dateStr))
  }

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/universities/${selectedUniversityId}`} className="text-gray-400 hover:text-white transition text-sm">
              <i className="fas fa-arrow-left mr-1" />{selectedUniversityName ?? '학교 홈'}
            </Link>
            <span className="text-gray-600">›</span>
            <h1 className="text-xl font-bold"><i className="fas fa-calendar-alt mr-2" />학교 일정</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-bold border transition ${viewMode === 'list' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-gray-600 hover:border-white'}`}>
              <i className="fas fa-list mr-1" />목록
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-bold border transition ${viewMode === 'calendar' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-gray-600 hover:border-white'}`}>
              <i className="fas fa-calendar mr-1" />달력
            </button>
          </div>
        </div>
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : viewMode === 'list' ? (
          <>
            <FilterTabs tabs={TABS} active={active} onChange={setActive} />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <i className="fas fa-calendar text-3xl mb-3 block" />등록된 일정이 없습니다.
                  </div>
                ) : Array.from(grouped.entries()).map(([month, items]) => (
                  <div key={month}>
                    <div className="text-base font-bold py-3 px-1 mt-4 border-b-2 border-black flex items-center gap-2">
                      <i className="fas fa-caret-right" />
                      {month.slice(0, 4)}년 {month.slice(5, 7)}월
                    </div>
                    {items.map(s => (
                      <div key={s.id} className="flex items-start gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition">
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-2xl font-bold leading-none">{s.date.slice(8, 10)}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.date.slice(5, 7)}월</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold leading-snug">{s.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${DDAY_COLOR(s.dday)}`}>
                              {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                            </span>
                            <span className={`text-xs border px-1.5 py-0.5 font-medium rounded ${CATEGORY_COLORS[s.category] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {s.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Sidebar
                categoryWidget={{ title: '카테고리', items: categoryCounts, onSelect: setActive }}
                recentWidget={{
                  title: 'D-Day 임박 TOP 5',
                  items: schedules.slice(0, 5).map(s => ({
                    title: s.title,
                    sub: `${s.dday === 0 ? 'D-Day' : `D-${s.dday}`}  ${s.date}`,
                  })),
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="border-2 border-black">
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-black text-white">
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="hover:opacity-70 transition">
                    <i className="fas fa-chevron-left" />
                  </button>
                  <h2 className="text-lg font-bold">{year}년 {month + 1}월</h2>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="hover:opacity-70 transition">
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <div key={d} className={`text-center py-2 text-sm font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} className="border-b border-r border-gray-100 min-h-[80px]" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const daySchedules = getSchedulesForDay(day)
                    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                    const dow = (firstDay + i) % 7
                    return (
                      <div key={day} className={`border-b border-r border-gray-100 min-h-[80px] p-1 ${isToday ? 'bg-gray-50' : ''}`}>
                        <div className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1
                          ${isToday ? 'bg-black text-white' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-800'}`}>
                          {day}
                        </div>
                        {daySchedules.slice(0, 2).map(s => (
                          <div key={s.id} className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate font-medium
                            ${s.category === '시험' ? 'bg-red-100 text-red-700' : s.category === '학사' ? 'bg-blue-100 text-blue-700' : s.category === '행사' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {s.title}
                          </div>
                        ))}
                        {daySchedules.length > 2 && <div className="text-xs text-gray-400 px-1">+{daySchedules.length - 2}개</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-6 border-2 border-black p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <i className="fas fa-clock text-sm" />오늘의 일정 ({today.getMonth() + 1}/{today.getDate()})
                </h3>
                {getSchedulesForDay(today.getDate()).length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">오늘 일정이 없습니다.</p>
                ) : getSchedulesForDay(today.getDate()).map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.category === '시험' ? 'bg-red-500' : s.category === '학사' ? 'bg-blue-500' : s.category === '행사' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-sm font-medium flex-1">{s.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${DDAY_COLOR(s.dday)}`}>
                      {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Sidebar
              categoryWidget={{ title: '카테고리', items: categoryCounts, onSelect: setActive }}
              recentWidget={{
                title: 'D-Day 임박 TOP 5',
                items: schedules.slice(0, 5).map(s => ({
                  title: s.title,
                  sub: `${s.dday === 0 ? 'D-Day' : `D-${s.dday}`}  ${s.date}`,
                })),
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
