import '@testing-library/jest-dom'

Object.defineProperty(globalThis, 'localStorage', {
  value: window.localStorage,
  configurable: true,
})

Object.defineProperty(globalThis, 'sessionStorage', {
  value: window.sessionStorage,
  configurable: true,
})
