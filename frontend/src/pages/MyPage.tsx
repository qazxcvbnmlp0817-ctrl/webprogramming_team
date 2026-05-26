import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ScheduleModal from '../components/ScheduleModal'
import ScheduleDetailModal from '../components/ScheduleDetailModal'
import {
  loadSchedules, addSchedule, updateSchedule, deleteSchedule,
  CATEGORY_META, todayStr,
  type LocalSchedule,
} from '../utils/localSchedule'
import { getAuthItem, clearAuthStorage } from '../utils/authStorage'

type Tab = '내 정보' | '내가 쓴 글' | '댓글 관리' | '내 일정 관리' | '알림 설정'

interface MyPost {
  id: number
  title: string
  category: string
  commentCount: number
  date: string
  scopeType: string
}

interface MyComment {
  id: number
  postId: number
  content: string
  date: string
  postTitle?: string
}
type MyFilter = 'all' | 'today' | 'week' | 'month' | 'past'
type MyView = 'list' | 'calendar'

const PAGE_SIZE = 7
const DAYS_KO = ['일','월','화','수','목','금','토']
function pad(n: number) { return String(n).padStart(2,'0') }
function toDS(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}` }

function MyCalendar({ year, month, onPrev, onNext, onToday, schedules, onEventClick, onDayClick }: {
  year: number; month: number
  onPrev: () => void; onNext: () => void; onToday: () => void
  schedules: LocalSchedule[]
  onEventClick: (s: LocalSchedule) => void
  onDayClick: (ds: string) => void
}) {
  const today = todayStr()
  const firstDow = new Date(year, month-1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const prevDays = new Date(year, month-1, 0).getDate()
  const totalCells = Math.ceil((daysInMonth + firstDow) / 7) * 7
  const eventMap = useMemo(() => {
    const m = new Map<string, LocalSchedule[]>()
    schedules.forEach(s => { const a = m.get(s.date) ?? []; a.push(s); m.set(s.date, a) })
    return m
  }, [schedules])
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <button onClick={onPrev} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm">‹</button>
        <button onClick={onNext} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm">›</button>
        <h3 className="flex-1 text-center font-bold text-sm">{year}년 {month}월</h3>
        <button onClick={onToday} className="px-2.5 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50">오늘</button>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS_KO.map((d, i) => (
          <div key={d} className={`text-center py-2 text-xs font-bold ${i===0?'text-red-500':i===6?'text-blue-500':'text-gray-500'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: totalCells }).map((_, i) => {
          let day: number, ds: string, isOther = false
          if (i < firstDow) { day=prevDays-firstDow+i+1; const pm=month===1?12:month-1,py=month===1?year-1:year; ds=toDS(py,pm,day); isOther=true }
          else if (i >= firstDow+daysInMonth) { day=i-firstDow-daysInMonth+1; const nm=month===12?1:month+1,ny=month===12?year+1:year; ds=toDS(ny,nm,day); isOther=true }
          else { day=i-firstDow+1; ds=toDS(year,month,day) }
          const evs = eventMap.get(ds) ?? []
          const isToday = ds === today
          const dow = i % 7
          return (
            <div key={i} onClick={() => onDayClick(ds)}
              className={`min-h-[72px] border-b border-r border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition ${isOther?'bg-gray-50/60':''} ${isToday?'bg-blue-50/40':''}`}>
              <div className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-0.5
                ${isToday?'bg-blue-600 text-white':isOther?'text-gray-300':dow===0?'text-red-500':dow===6?'text-blue-500':'text-gray-700'}`}>{day}</div>
              {evs.slice(0,2).map(ev => (
                <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                  className="flex items-center gap-1 text-[10px] px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer hover:opacity-80"
                  style={{ background: CATEGORY_META[ev.category].color+'22', color: CATEGORY_META[ev.category].color }}>
                  <span className="truncate font-medium">{ev.startTime} {ev.title}</span>
                </div>
              ))}
              {evs.length > 2 && <div className="text-[10px] text-blue-500 px-1">+{evs.length-2}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MyPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('내 정보')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName]   = useState('')
  const [nameMsg, setNameMsg]     = useState<{ type: 'success'|'error'; text: string }|null>(null)
  const [nameSaving, setNameSaving] = useState(false)

  const name             = getAuthItem('name')             || '사용자'
  const username         = getAuthItem('username')         || ''
  const memberType       = getAuthItem('memberType')       || 'student'
  const department       = getAuthItem('department')       || ''
  const grade            = getAuthItem('grade')
  const enrollmentStatus = getAuthItem('enrollmentStatus')

  const memberTypeLabel  = memberType==='student'?'학생':memberType==='professor'?'교수':memberType==='employee'?'직원':memberType==='assistant'?'조교':memberType==='admin'?'관리자':'회원'
  const enrollmentLabel  = enrollmentStatus==='freshman'?'신입생':enrollmentStatus==='enrolled'?'재학생':enrollmentStatus==='graduated'?'졸업생':''

  const handleLogout = () => { clearAuthStorage(); window.dispatchEvent(new Event('loginChanged')); navigate('/login') }

  const handleSaveName = async () => {
    const trimmed = editName.trim()
    if (!trimmed) { setNameMsg({type:'error', text:'이름을 입력해주세요.'}); return }
    if (trimmed === name) { setIsEditing(false); return }
    setNameSaving(true)
    try {
      const res = await fetch('/api/auth/change-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newName: trimmed }),
      })
      const result = await res.json()
      if (result.success) {
        sessionStorage.setItem('name', trimmed)
        if (localStorage.getItem('auth_isLoggedIn') === 'true') {
          localStorage.setItem('auth_name', trimmed)
        }
        window.dispatchEvent(new Event('loginChanged'))
        setNameMsg({type:'success', text:'이름이 변경되었습니다.'})
        setTimeout(() => { setNameMsg(null); setIsEditing(false) }, 1200)
      } else {
        setNameMsg({type:'error', text: result.message || '이름 변경에 실패했습니다.'})
      }
    } catch {
      setNameMsg({type:'error', text:'서버 연결에 실패했습니다.'})
    } finally {
      setNameSaving(false)
    }
  }

  const [currentPw, setCurrentPw]       = useState('')
  const [newPw, setNewPw]               = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')
  const [pwMsg, setPwMsg]               = useState<{ type: 'success'|'error'; text: string }|null>(null)
  const [pwLoading, setPwLoading]       = useState(false)

  const handleChangePassword = async () => {
    if (!currentPw||!newPw||!newPwConfirm) { setPwMsg({type:'error',text:'모든 항목을 입력해주세요.'}); return }
    if (newPw!==newPwConfirm) { setPwMsg({type:'error',text:'새 비밀번호가 일치하지 않습니다.'}); return }
    if (newPw.length<8) { setPwMsg({type:'error',text:'비밀번호는 8자 이상이어야 합니다.'}); return }
    setPwLoading(true)
    try {
      const vr = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:currentPw,memberType})})
      const v = await vr.json()
      if (!v.success) { setPwMsg({type:'error',text:'현재 비밀번호가 올바르지 않습니다.'}); return }
      const r = await fetch('/api/auth/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,newPassword:newPw})})
      const res = await r.json()
      if (res.success) { setPwMsg({type:'success',text:'비밀번호가 변경되었습니다.'}); setCurrentPw(''); setNewPw(''); setNewPwConfirm('') }
      else setPwMsg({type:'error',text:res.message||'비밀번호 변경에 실패했습니다.'})
    } catch { setPwMsg({type:'error',text:'서버 연결에 실패했습니다.'}) }
    finally { setPwLoading(false) }
  }

  const [mySchedules, setMySchedules] = useState<LocalSchedule[]>([])
  const [myFilter, setMyFilter]       = useState<MyFilter>('all')
  const [myView, setMyView]           = useState<MyView>('list')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const [calYear, setCalYear]         = useState(new Date().getFullYear())
  const [calMonth, setCalMonth]       = useState(new Date().getMonth()+1)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState<LocalSchedule|null>(null)
  const [modalDate, setModalDate]     = useState<string|undefined>(undefined)
  const [detailTarget, setDetailTarget] = useState<LocalSchedule|null>(null)

  useEffect(() => { setMySchedules(loadSchedules()) }, [])
  const reload = useCallback(() => { setMySchedules(loadSchedules()) }, [])

  const today     = todayStr()
  const now       = new Date()
  const weekStart = (() => { const d=new Date(now); d.setDate(now.getDate()-now.getDay()); return d.toISOString().slice(0,10) })()
  const weekEnd   = (() => { const d=new Date(now); d.setDate(now.getDate()+(6-now.getDay())); return d.toISOString().slice(0,10) })()
  const monthPfx  = `${now.getFullYear()}-${pad(now.getMonth()+1)}`

  const filtered = useMemo(() => {
    let list = [...mySchedules]
    if (myFilter==='today')  list=list.filter(s=>s.date===today)
    else if (myFilter==='week')  list=list.filter(s=>s.date>=weekStart&&s.date<=weekEnd)
    else if (myFilter==='month') list=list.filter(s=>s.date.startsWith(monthPfx))
    else if (myFilter==='past')  list=list.filter(s=>s.date<today)
    if (search.trim()) { const q=search.toLowerCase(); list=list.filter(s=>s.title.toLowerCase().includes(q)||s.content.toLowerCase().includes(q)) }
    return list.sort((a,b)=>b.date.localeCompare(a.date)||a.startTime.localeCompare(b.startTime))
  }, [mySchedules,myFilter,search,today,weekStart,weekEnd,monthPfx])

  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  useEffect(() => { setPage(1) }, [myFilter,search])

  const handleSave = (data: Omit<LocalSchedule,'id'>&{id?:string}) => {
    if (data.id) updateSchedule(data as LocalSchedule); else addSchedule(data)
    reload(); setModalOpen(false); setEditTarget(null)
  }
  const handleDelete = (id: string) => { deleteSchedule(id); reload() }
  const openAdd  = (date?: string) => { setEditTarget(null); setModalDate(date); setModalOpen(true) }
  const openEdit = (s: LocalSchedule) => { setEditTarget(s); setModalDate(undefined); setModalOpen(true); setDetailTarget(null) }

  const calPrev  = () => { if(calMonth===1){setCalYear(y=>y-1);setCalMonth(12)}else setCalMonth(m=>m-1) }
  const calNext  = () => { if(calMonth===12){setCalYear(y=>y+1);setCalMonth(1)}else setCalMonth(m=>m+1) }
  const calToday = () => { setCalYear(now.getFullYear()); setCalMonth(now.getMonth()+1) }

  const [myPosts, setMyPosts]       = useState<MyPost[]>([])
  const [myComments, setMyComments] = useState<MyComment[]>([])
  const [postsLoading, setPostsLoading]       = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    if (activeTab === '내가 쓴 글' && username && myPosts.length === 0) {
      setPostsLoading(true)
      fetch(`/api/my/posts?username=${encodeURIComponent(username)}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setMyPosts(data) })
        .catch(() => {})
        .finally(() => setPostsLoading(false))
    }
    if (activeTab === '댓글 관리' && username && myComments.length === 0) {
      setCommentsLoading(true)
      fetch(`/api/my/comments?username=${encodeURIComponent(username)}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setMyComments(data) })
        .catch(() => {})
        .finally(() => setCommentsLoading(false))
    }
  }, [activeTab, username])

  const [noti, setNoti] = useState({ notice:true, comment:true, dday:true })
  const [notiLoading, setNotiLoading] = useState(false)
  const [notiMsg, setNotiMsg] = useState<{type:'success'|'error';text:string}|null>(null)

  useEffect(() => {
    if (activeTab === '알림 설정' && username) {
      fetch(`/api/auth/notification-settings?username=${encodeURIComponent(username)}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setNoti({ notice: data.notiNotice, comment: data.notiComment, dday: data.notiDday })
          }
        })
        .catch(() => {})
    }
  }, [activeTab, username])

  const handleSaveNoti = async () => {
    setNotiLoading(true)
    try {
      const res = await fetch('/api/auth/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, notiNotice: noti.notice, notiComment: noti.comment, notiDday: noti.dday })
      })
      const result = await res.json()
      if (result.success) setNotiMsg({type:'success', text:'알림 설정이 저장되었습니다.'})
      else setNotiMsg({type:'error', text: result.message || '저장에 실패했습니다.'})
    } catch { setNotiMsg({type:'error', text:'서버 연결에 실패했습니다.'}) }
    finally { setNotiLoading(false); setTimeout(() => setNotiMsg(null), 2000) }
  }

  const TABS: Tab[] = ['내 정보','내가 쓴 글','댓글 관리','내 일정 관리','알림 설정']

  return (
    <div className="bg-gray-50 text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-7 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold">마이페이지</h1>
          <p className="text-gray-400 text-sm mt-0.5">내 정보를 확인하고 관리하세요.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-5">

        {/* 사이드바 */}
        <aside className="w-full lg:w-52 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 text-center">
            <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100 mx-auto mb-2">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="font-bold text-sm">{name}</p>
            {grade && <span className="inline-block text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full mt-1">{grade}학년</span>}
            <p className="text-xs text-gray-400 mt-1">{memberTypeLabel} · {username}</p>
            {department && <p className="text-xs text-gray-400 mt-0.5">{department}</p>}
          </div>

          <nav className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2
                  ${i<TABS.length-1?'border-b border-gray-100':''}
                  ${activeTab===tab?'bg-gray-900 text-white font-semibold':'hover:bg-gray-50 text-gray-700'}`}>
                <span className="text-base">
                  {tab==='내 정보'&&'👤'}{tab==='내가 쓴 글'&&'✏️'}{tab==='댓글 관리'&&'💬'}{tab==='내 일정 관리'&&'📅'}{tab==='알림 설정'&&'🔔'}
                </span>
                {tab}
              </button>
            ))}
          </nav>

          <button onClick={handleLogout}
            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition">
            로그아웃
          </button>
        </aside>

        {/* 메인 */}
        <main className="flex-1 min-w-0">

          {/* 내 정보 */}
          {activeTab==='내 정보' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold">내 정보</h2>
                <button onClick={() => { setIsEditing(!isEditing); setEditName(name); setNameMsg(null) }}
                  className="text-sm border border-gray-300 rounded px-4 py-1.5 font-semibold hover:bg-gray-50 transition">
                  {isEditing?'취소':'정보 수정'}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {label:'이름',      value:name},
                  {label:'아이디',    value:username},
                  {label:'회원 유형', value:memberTypeLabel},
                  ...(department?[{label:'소속 학과',value:department}]:[]),
                  ...(grade?[{label:'학년',value:`${grade}학년`}]:[]),
                  ...(enrollmentLabel?[{label:'재학 상태',value:enrollmentLabel}]:[]),
                ].map(({label,value}) => (
                  <div key={label} className="flex items-center border-b border-gray-100 pb-3">
                    <span className="text-sm text-gray-400 w-24 flex-shrink-0">{label}</span>
                    {isEditing&&label==='이름'
                      ?<input value={editName} onChange={e=>setEditName(e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" placeholder="이름 입력"/>
                      :<span className="text-sm font-medium">{value||'-'}</span>}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="mt-5 flex flex-col gap-3">
                  {nameMsg && (
                    <p className={`text-xs px-3 py-2 rounded border ${nameMsg.type==='success'?'bg-green-50 border-green-200 text-green-700':'bg-red-50 border-red-200 text-red-600'}`}>
                      {nameMsg.text}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button onClick={()=>{setIsEditing(false);setNameMsg(null)}} className="flex-1 border border-gray-300 rounded py-2 text-sm font-semibold hover:bg-gray-50">취소</button>
                    <button onClick={handleSaveName} disabled={nameSaving} className="flex-1 bg-gray-900 text-white rounded py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      {nameSaving?'저장 중...':'저장'}
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-bold mb-3">비밀번호 변경</h3>
                <div className="flex flex-col gap-3">
                  {[{label:'현재 비밀번호',val:currentPw,set:setCurrentPw},{label:'새 비밀번호',val:newPw,set:setNewPw},{label:'새 비밀번호 확인',val:newPwConfirm,set:setNewPwConfirm}]
                    .map(({label,val,set}) => (
                    <div key={label}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input type="password" value={val} onChange={e=>{set(e.target.value);setPwMsg(null)}}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"/>
                    </div>
                  ))}
                  {newPw&&newPwConfirm&&newPw!==newPwConfirm&&<p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>}
                  {pwMsg&&<p className={`text-xs px-3 py-2 rounded border ${pwMsg.type==='success'?'bg-green-50 border-green-200 text-green-700':'bg-red-50 border-red-200 text-red-600'}`}>{pwMsg.text}</p>}
                  <button onClick={handleChangePassword} disabled={pwLoading}
                    className="w-full bg-gray-900 text-white rounded py-2.5 text-sm font-semibold hover:opacity-90 mt-1 disabled:opacity-50">
                    {pwLoading?'변경 중...':'비밀번호 변경'}
                  </button>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-bold mb-3">계정 관리</h3>
                <button onClick={()=>{ if(window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')){ clearAuthStorage(); localStorage.clear(); window.dispatchEvent(new Event('loginChanged')); navigate('/login') }}}
                  className="text-sm text-red-500 border border-red-200 rounded px-4 py-2 hover:bg-red-50 transition">
                  회원 탈퇴
                </button>
              </div>
            </div>
          )}

          {activeTab==='내가 쓴 글' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-bold mb-5">내가 쓴 글</h2>
              {postsLoading ? (
                <div className="py-14 text-center text-gray-400 text-sm">불러오는 중...</div>
              ) : myPosts.length === 0 ? (
                <div className="py-14 text-center text-gray-400 text-sm">작성한 게시글이 없습니다.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {myPosts.map(post => (
                    <div key={post.id} className="flex items-center gap-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition px-2 rounded">
                      <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded flex-shrink-0">{post.category}</span>
                      <p className="flex-1 text-sm font-medium text-gray-800 truncate">{post.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">댓글 {post.commentCount}</span>
                      <span className="text-xs text-gray-300 flex-shrink-0">{post.date?.slice(0,10)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab==='댓글 관리' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-bold mb-5">댓글 관리</h2>
              {commentsLoading ? (
                <div className="py-14 text-center text-gray-400 text-sm">불러오는 중...</div>
              ) : myComments.length === 0 ? (
                <div className="py-14 text-center text-gray-400 text-sm">작성한 댓글이 없습니다.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {myComments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition px-2 rounded">
                      <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2 py-0.5 rounded flex-shrink-0 mt-0.5">댓글</span>
                      <p className="flex-1 text-sm text-gray-700 break-all">{comment.content}</p>
                      <span className="text-xs text-gray-300 flex-shrink-0">{comment.date?.slice(0,10)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab==='내 일정 관리' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold">내 일정 관리</h2>
                  <p className="text-xs text-gray-400 mt-0.5">내가 등록한 일정을 확인하고 관리할 수 있습니다.</p>
                </div>
                <button onClick={()=>openAdd()} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition">
                  + 일정 추가
                </button>
              </div>
              <div className="flex gap-3 flex-wrap items-center">
                <div className="flex border border-gray-300 rounded overflow-hidden bg-white flex-shrink-0">
                  {(['list','calendar'] as const).map(v => (
                    <button key={v} onClick={()=>setMyView(v)}
                      className={`px-4 py-2 text-xs font-semibold transition ${myView===v?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-50'}`}>
                      {v==='list'?'목록':'달력'}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1 min-w-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input className="w-full border border-gray-300 rounded pl-8 pr-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                    placeholder="일정 제목, 내용 검색" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {([['all','전체'],['today','오늘'],['week','이번 주'],['month','이번 달'],['past','지난 일정']] as const).map(([v,l]) => (
                  <button key={v} onClick={()=>setMyFilter(v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${myFilter===v?'bg-blue-600 border-blue-600 text-white':'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'}`}>
                    {l}
                  </button>
                ))}
              </div>
              {myView==='list' && (
                <>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {['날짜','시간','제목','카테고리','상태','관리'].map((h,i) => (
                              <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 ${i===3?'hidden sm:table-cell':i===4?'hidden md:table-cell':i===5?'text-center':''}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paged.length===0
                            ?<tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">등록된 일정이 없습니다.</td></tr>
                            :paged.map(s => {
                              const meta=CATEGORY_META[s.category]
                              return (
                                <tr key={s.id} onClick={()=>setDetailTarget(s)}
                                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{s.date}</td>
                                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{s.allDay?'종일':s.startTime+(s.endTime?` ~ ${s.endTime}`:'')}</td>
                                  <td className="px-4 py-3 font-semibold text-gray-900 max-w-[160px] truncate">{s.title}</td>
                                  <td className="px-4 py-3 hidden sm:table-cell">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{background:meta.color}}>{meta.label}</span>
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status==='done'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>
                                      {s.status==='done'?'완료':'예정'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={()=>setDetailTarget(s)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition text-sm">👁</button>
                                      <button onClick={()=>openEdit(s)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition text-sm">✏️</button>
                                      <button onClick={()=>{if(window.confirm('삭제하시겠습니까?')){handleDelete(s.id)}}} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition text-sm">🗑</button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                    {totalPages>1 && (
                      <div className="flex items-center justify-center gap-1.5 py-3 border-t border-gray-100">
                        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-xs disabled:opacity-30 hover:bg-gray-50">‹</button>
                        {Array.from({length:totalPages}).map((_,i) => (
                          <button key={i} onClick={()=>setPage(i+1)}
                            className={`w-7 h-7 rounded border text-xs font-semibold transition ${page===i+1?'bg-blue-600 border-blue-600 text-white':'border-gray-300 hover:bg-gray-50'}`}>{i+1}</button>
                        ))}
                        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-xs disabled:opacity-30 hover:bg-gray-50">›</button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                    💡 <strong className="text-gray-600">Tip</strong> 일정을 클릭하면 상세 정보를 확인할 수 있습니다.
                  </div>
                </>
              )}
              {myView==='calendar' && (
                <MyCalendar year={calYear} month={calMonth}
                  onPrev={calPrev} onNext={calNext} onToday={calToday}
                  schedules={mySchedules}
                  onEventClick={s=>setDetailTarget(s)}
                  onDayClick={ds=>openAdd(ds)}/>
              )}
            </div>
          )}

          {activeTab==='알림 설정' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-bold mb-5">알림 설정</h2>
              <div className="flex flex-col gap-1">
                {[
                  {key:'notice'  as const, label:'새 공지사항 알림', desc:'학과/학교 새 공지사항이 등록되면 알림'},
                  {key:'comment' as const, label:'댓글 알림',        desc:'내 게시글에 댓글이 달리면 알림'},
                  {key:'dday'    as const, label:'D-Day 임박 알림',  desc:'일정 7일 전 알림'},
                ].map(({key,label,desc}) => (
                  <div key={key} className="flex items-center justify-between py-3.5 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button onClick={()=>setNoti(p=>({...p,[key]:!p[key]}))}
                      className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${noti[key]?'bg-blue-600':'bg-gray-200'}`}>
                      <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${noti[key]?'translate-x-4':'translate-x-0.5'}`}/>
                    </button>
                  </div>
                ))}
              </div>
              {notiMsg && (
                <p className={`text-xs px-3 py-2 rounded border mt-3 ${notiMsg.type==='success'?'bg-green-50 border-green-200 text-green-700':'bg-red-50 border-red-200 text-red-600'}`}>
                  {notiMsg.text}
                </p>
              )}
              <button onClick={handleSaveNoti} disabled={notiLoading}
                className="w-full bg-gray-900 text-white rounded py-2.5 text-sm font-semibold hover:opacity-90 transition mt-5 disabled:opacity-50">
                {notiLoading ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          )}

        </main>
      </div>

      <ScheduleModal open={modalOpen} initial={editTarget} defaultDate={modalDate}
        onSave={handleSave} onClose={()=>{setModalOpen(false);setEditTarget(null)}}/>
      <ScheduleDetailModal schedule={detailTarget} onClose={()=>setDetailTarget(null)}
        onEdit={openEdit} onDelete={handleDelete}/>
    </div>
  )
}
