import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import IntroAnimation from './IntroAnimation'

afterEach(() => {
  vi.useRealTimers()
})

test('서비스 이름이 렌더링된다', () => {
  render(<IntroAnimation onComplete={vi.fn()} />)
  expect(screen.getByText('학과정보통합서비스')).toBeInTheDocument()
})

test('3000ms 후 onComplete가 호출된다', async () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  render(<IntroAnimation onComplete={onComplete} />)
  await act(async () => { vi.advanceTimersByTime(3000) })
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test('2999ms 시점에는 onComplete가 호출되지 않는다', async () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  render(<IntroAnimation onComplete={onComplete} />)
  await act(async () => { vi.advanceTimersByTime(2999) })
  expect(onComplete).not.toHaveBeenCalled()
})

test('언마운트 시 타이머가 정리된다', () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  const { unmount } = render(<IntroAnimation onComplete={onComplete} />)
  unmount()
  vi.advanceTimersByTime(5000)
  expect(onComplete).not.toHaveBeenCalled()
})
