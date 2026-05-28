import { useEffect, useRef, useState } from 'react'

interface Props {
  onComplete: () => void
}

export default function IntroAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fadeout'>('hidden')
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 500)
    const t2 = setTimeout(() => setPhase('fadeout'), 2500)
    const t3 = setTimeout(() => onCompleteRef.current(), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-500 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`text-center transition-all duration-700 ease-in-out ${
          phase === 'hidden' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
          학과정보통합서비스
        </h1>
        <p className="text-gray-400 text-sm mt-3 tracking-widest uppercase">Dept Portal</p>
      </div>
    </div>
  )
}
