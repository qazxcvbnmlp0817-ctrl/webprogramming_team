import { Fragment, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { getAuthItem, isLoggedIn } from '../utils/authStorage'
import {
  addTimetableEntry,
  fetchLectureOfferings,
  fetchMyTimetable,
  removeTimetableEntry,
  type LectureOfferingDto,
  type TimetableEntryDto,
} from '../api/timetable'

const SEMESTER = '2026-1'
const DAYS = ['월', '화', '수', '목', '금']
const PERIODS = Array.from({ length: 22 }, (_, index) => index + 1)
const COLORS = ['#0f766e', '#7c3aed', '#b45309', '#0369a1', '#be123c', '#4d7c0f', '#6d28d9', '#b91c1c']

interface Block {
  day: string
  start: number
  end: number
  entry: TimetableEntryDto
  color: string
}

function parseBlocks(entry: TimetableEntryDto, color: string): Block[] {
  const text = entry.offering.lectureTime.replace(/\s+/g, '')
  const matches = [...text.matchAll(/([월화수목금])([0-9,]+)/g)]
  return matches.flatMap(match => {
    const periods = match[2].split(',').map(Number).filter(Boolean).sort((a, b) => a - b)
    if (periods.length === 0) return []
    const groups: number[][] = []
    periods.forEach(period => {
      const last = groups[groups.length - 1]
      if (last && last[last.length - 1] + 1 === period) last.push(period)
      else groups.push([period])
    })
    return groups.map(group => ({
      day: match[1],
      start: group[0],
      end: group[group.length - 1],
      entry,
      color,
    }))
  })
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, '')
}

export default function TimetablePage() {
  const username = getAuthItem('username') ?? ''
  const memberType = getAuthItem('memberType')
  const canUse = isLoggedIn() && memberType === 'student' && username

  const [offerings, setOfferings] = useState<LectureOfferingDto[]>([])
  const [entries, setEntries] = useState<TimetableEntryDto[]>([])
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('전체')
  const [completion, setCompletion] = useState('전체')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const reload = async () => {
    if (!canUse) return
    setLoading(true)
    const [nextOfferings, nextEntries] = await Promise.all([
      fetchLectureOfferings(SEMESTER),
      fetchMyTimetable(username, SEMESTER),
    ])
    setOfferings(nextOfferings)
    setEntries(nextEntries)
    setLoading(false)
  }

  useEffect(() => {
    reload().catch(error => setMessage(error.message))
  }, [canUse, username])

  const selectedOfferingIds = useMemo(() => new Set(entries.map(entry => entry.offering.id)), [entries])
  const totalCredits = entries.reduce((sum, entry) => sum + entry.offering.credits, 0)

  const filtered = useMemo(() => {
    const q = normalize(query)
    return offerings.filter(offering => {
      const text = normalize(`${offering.courseName} ${offering.courseCode} ${offering.professorName}`)
      return (!q || text.includes(q))
        && (year === '전체' || offering.targetYear === year || offering.targetYear === '전체학년')
        && (completion === '전체' || offering.completionType === completion)
    })
  }, [offerings, query, year, completion])

  const blocks = useMemo(() => entries.flatMap((entry, index) =>
    parseBlocks(entry, COLORS[index % COLORS.length]),
  ), [entries])

  const add = async (offeringId: number) => {
    try {
      setMessage('')
      await addTimetableEntry(username, offeringId)
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '시간표에 담지 못했습니다.')
    }
  }

  const remove = async (entryId: number) => {
    try {
      setMessage('')
      await removeTimetableEntry(username, entryId)
      await reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '시간표에서 제거하지 못했습니다.')
    }
  }

  if (!canUse) {
    return (
      <div className="bg-white text-black min-h-screen">
        <Navbar />
        <main className="pt-28 max-w-xl mx-auto px-4 text-center">
          <i className="fas fa-table-cells-large text-4xl text-gray-400 mb-4 block" />
          <h1 className="text-3xl font-black">시간표</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">학생 계정으로 로그인하면 2026학년도 1학기 개설강좌를 담아 시간표를 만들 수 있습니다.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <main className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b-2 border-black pb-4 mb-5">
          <div>
            <p className="text-sm text-gray-500">2026학년도 1학기</p>
            <h1 className="text-3xl font-black">시간표</h1>
            <p className="text-sm text-gray-500 mt-2">강좌를 담으면 시간이 겹치는 과목은 자동으로 막습니다.</p>
          </div>
          <div className="border-2 border-black px-4 py-2 font-black text-sm">
            담은 과목 {entries.length}개 / {totalCredits}학점
          </div>
        </div>

        {message && (
          <div className="mb-4 border-2 border-black bg-yellow-50 px-4 py-3 text-sm font-bold">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-[480px_1fr] gap-5 items-start">
          <aside className="border-2 border-black">
            <div className="p-4 border-b-2 border-black space-y-3">
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="과목명, 코드, 교수 검색"
                className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select value={year} onChange={event => setYear(event.target.value)} className="border-2 border-black px-2 py-2 text-sm">
                  {['전체', '전체학년', '1학년', '2학년', '3학년', '4학년'].map(item => <option key={item}>{item}</option>)}
                </select>
                <select value={completion} onChange={event => setCompletion(event.target.value)} className="border-2 border-black px-2 py-2 text-sm">
                  {['전체', '교양필수', '교양선택', '전문교양', '공학기초', '전공필수', '전공선택'].map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>
            <div className="max-h-[720px] overflow-y-auto divide-y divide-gray-200">
              {loading ? (
                <p className="p-6 text-center text-gray-500">불러오는 중...</p>
              ) : filtered.map(offering => (
                <article key={offering.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{offering.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {offering.courseCode}-{offering.section} · {offering.completionType} · {offering.targetYear}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={selectedOfferingIds.has(offering.id)}
                      onClick={() => add(offering.id)}
                      className={`border-2 border-black px-3 py-1 text-xs font-black shrink-0 ${
                        selectedOfferingIds.has(offering.id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'hover:bg-black hover:text-white'
                      }`}
                    >
                      {selectedOfferingIds.has(offering.id) ? '담김' : '담기'}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 text-xs">
                    <p className="text-gray-700">{offering.professorName || '담당교수 미정'}</p>
                    <p className="font-bold">{offering.credits}학점</p>
                    <p className="col-span-2 font-semibold">{offering.lectureTime || '강의시간 미정'}</p>
                    <p className="col-span-2 text-gray-500">수강 {offering.enrolled}/{offering.capacity}명</p>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <section className="overflow-x-auto">
            <div className="min-w-[760px] border-2 border-black">
              <div className="grid grid-cols-[52px_repeat(5,1fr)] bg-black text-white text-center text-sm font-black">
                <div className="py-2 border-r border-gray-700">교시</div>
                {DAYS.map(day => <div key={day} className="py-2 border-r border-gray-700 last:border-r-0">{day}</div>)}
              </div>
              <div className="relative grid grid-cols-[52px_repeat(5,1fr)]" style={{ gridTemplateRows: `repeat(${PERIODS.length}, 34px)` }}>
                {PERIODS.map(period => (
                  <Fragment key={period}>
                    <div className="border-r border-b border-gray-200 text-xs text-gray-500 flex items-center justify-center">
                      {period}
                    </div>
                    {DAYS.map(day => (
                      <div key={`${day}-${period}`} className="border-r border-b border-gray-200" />
                    ))}
                  </Fragment>
                ))}
                {blocks.map(block => {
                  const dayIndex = DAYS.indexOf(block.day)
                  if (dayIndex < 0) return null
                  return (
                    <div
                      key={`${block.entry.entryId}-${block.day}-${block.start}`}
                      className="absolute text-white p-2 overflow-hidden"
                      style={{
                        left: `calc(52px + ${dayIndex} * ((100% - 52px) / 5))`,
                        top: `${(block.start - 1) * 34}px`,
                        width: 'calc((100% - 52px) / 5)',
                        height: `${(block.end - block.start + 1) * 34}px`,
                        background: block.color,
                        border: '1px solid white',
                      }}
                    >
                      <p className="font-black text-xs leading-tight">{block.entry.offering.courseName}</p>
                      <p className="text-[11px] opacity-90 mt-1">{block.entry.offering.section}분반 · {block.entry.offering.professorName}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 border-2 border-black divide-y divide-gray-200">
              {entries.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">아직 담은 과목이 없습니다.</p>
              ) : entries.map(entry => (
                <div key={entry.entryId} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-sm">{entry.offering.courseName}</p>
                    <p className="text-xs text-gray-500">{entry.offering.section}분반 · {entry.offering.lectureTime}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(entry.entryId)}
                    className="border-2 border-black px-3 py-1 text-xs font-black hover:bg-black hover:text-white"
                  >
                    제거
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
