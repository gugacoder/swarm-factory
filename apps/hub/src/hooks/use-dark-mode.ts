import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dark-mode', String(dark));
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
