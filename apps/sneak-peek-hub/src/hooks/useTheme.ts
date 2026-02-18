import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const effective = theme === 'system' ? getSystemTheme() : theme
  root.classList.remove('light', 'dark')
  root.classList.add(effective)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('sneak-peek-theme') as Theme | null
    return stored ?? 'system'
  })

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('sneak-peek-theme', t)
    applyTheme(t)
  }, [])

  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme }
}
