import { useEffect, useRef, useState } from 'react'

interface Props {
  onComplete: () => void
}

const TITLE     = '학과정보통합서비스'
const CHAR_GAP  = 55
const BLACK_PCT = 38

export default function IntroAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<'init' | 'reveal' | 'fadeout'>('init')
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })

  const titleEnd = TITLE.length * CHAR_GAP + 900

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'),  200)
    const t2 = setTimeout(() => setPhase('fadeout'), 200 + titleEnd + 900)
    const t3 = setTimeout(() => onCompleteRef.current(), 200 + titleEnd + 900 + 550)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const active = phase !== 'init'
  const fading = phase === 'fadeout'

  return (
    <div className="fixed inset-0 z-50">

      {/* ── 배경: 페이드아웃 없이 항상 유지 (학교선택 페이지와 동일 색상) ── */}
      <div className="absolute inset-x-0 top-0" style={{ height: `${BLACK_PCT}%`, backgroundColor: '#111' }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: `${100 - BLACK_PCT}%`, backgroundColor: 'white' }} />

      {/* ── 콘텐츠: 텍스트·구분선만 페이드아웃 ── */}
      <div
        style={{
          position:   'absolute',
          inset:      0,
          opacity:    fading ? 0 : 1,
          transition: fading ? 'opacity 0.5s ease-in-out' : 'none',
        }}
      >
        {/* 검은 영역 — 타이틀 */}
        <div
          className="absolute inset-x-0 top-0 overflow-hidden flex items-center justify-center"
          style={{ height: `${BLACK_PCT}%` }}
        >
          <h1
            className="text-center font-bold tracking-tight px-6"
            style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)', lineHeight: 1.15 }}
          >
            {TITLE.split('').map((char, i) => (
              <span
                key={i}
                style={{
                  display:    'inline-block',
                  color:      'white',
                  transform:  active ? 'translateY(0)' : 'translateY(64px)',
                  opacity:    active ? 1 : 0,
                  transition: active
                    ? `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * CHAR_GAP}ms,
                       opacity  0.4s  ease-out                        ${i * CHAR_GAP}ms`
                    : 'none',
                }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* 구분선 — 중앙에서 양쪽으로 확장 */}
        <div
          className="absolute inset-x-0 flex justify-center"
          style={{ top: `${BLACK_PCT}%`, height: '1px' }}
        >
          <div
            style={{
              height:          '1px',
              backgroundColor: '#888',
              width:           active ? '100%' : '0%',
              transition:      active
                ? `width 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${TITLE.length * CHAR_GAP * 0.4}ms`
                : 'none',
            }}
          />
        </div>

        {/* 흰 영역 — 서브타이틀 */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center"
          style={{ height: `${100 - BLACK_PCT}%`, paddingTop: 'clamp(20px, 4vh, 40px)' }}
        >
          <p
            style={{
              color:         '#555',
              fontSize:      '0.62rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              opacity:       active ? 1 : 0,
              transition:    active
                ? `opacity 0.7s ease-out ${TITLE.length * CHAR_GAP + 350}ms`
                : 'none',
            }}
          >
            Dept&nbsp;&nbsp;Portal
          </p>
        </div>
      </div>

    </div>
  )
}
