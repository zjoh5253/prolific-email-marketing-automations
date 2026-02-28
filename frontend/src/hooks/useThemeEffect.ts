import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui';

export function useThemeEffect() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyDark(isDark: boolean) {
      root.classList.toggle('dark', isDark);
    }

    if (theme === 'light') {
      applyDark(false);
      return;
    }

    if (theme === 'dark') {
      applyDark(true);
      return;
    }

    // theme === 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyDark(mq.matches);

    function onChange(e: MediaQueryListEvent) {
      applyDark(e.matches);
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);
}
