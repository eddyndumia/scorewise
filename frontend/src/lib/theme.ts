// Pure client-side display preference — no reason to round-trip this through
// the backend, so it lives in localStorage only, per device/browser.

const THEME_KEY = 'sw_theme';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

// Called once, as early as possible (main.tsx), so there's no flash of the
// wrong theme before React mounts.
export function initTheme(): void {
  applyTheme(getTheme());
}
