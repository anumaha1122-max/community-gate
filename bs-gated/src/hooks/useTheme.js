/**
 * useTheme.js — Global theme hook (bulletproof version)
 *
 * Safe against:
 *  - Zustand store not yet hydrated (returns light theme)
 *  - Unknown theme key (falls back to light)
 *  - Any undefined/null access (Proxy returns empty string)
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.background }} />
 */

import { themes } from '../theme/theme';
import useAppStore from '../store/appStore';

// Safe fallback — never returns undefined for any property
const SAFE_LIGHT = new Proxy(themes.light, {
  get(target, prop) {
    const val = target[prop];
    if (val !== undefined) return val;
    // Unknown property — return a visible fallback so UI doesn't break
    if (prop === 'mode') return 'light';
    return '#CCCCCC'; // neutral gray so missing colors are obvious in dev
  },
});

export function useTheme() {
  // Safe selector — never throws even if store not ready
  let themeKey = 'light';
  try {
    themeKey = useAppStore((s) => s.theme) ?? 'light';
  } catch (e) {
    themeKey = 'light';
  }

  const themeObj = themes[themeKey] ?? themes.light;

  // Wrap in Proxy so any missing property returns a fallback, not undefined
  return new Proxy(themeObj, {
    get(target, prop) {
      const val = target[prop];
      if (val !== undefined) return val;
      // Fallback to light theme for missing keys
      const lightVal = themes.light[prop];
      if (lightVal !== undefined) return lightVal;
      if (prop === 'mode') return themeKey;
      return '#CCCCCC';
    },
  });
}

export default useTheme;
