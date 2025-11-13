import { atom } from 'nanostores';

export type WeddingTab = 'home' | 'vendors' | 'timeline' | 'budget' | 'guests' | 'tasks';
export type WeddingTheme = 'light' | 'dark' | 'romantic';

export interface WeddingState {
  activeTab: WeddingTab;
  theme: WeddingTheme;
  isLoading: boolean;
  soundEnabled: boolean;
  animationEnabled: boolean;
}

// Load persisted theme from localStorage or system preference
const getInitialTheme = (): WeddingTheme => {
  if (typeof window === 'undefined') return 'romantic';
  const stored = localStorage.getItem('wedding-theme');
  if (stored === 'light' || stored === 'dark' || stored === 'romantic') return stored;
  // Fallback to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'romantic';
};

export const $weddingState = atom<WeddingState>({
  activeTab: 'home',
  theme: getInitialTheme(),
  isLoading: false,
  soundEnabled: true,
  animationEnabled: true,
});

export const setActiveTab = (tab: WeddingTab) => {
  $weddingState.set({ ...$weddingState.get(), activeTab: tab });
};

export const setTheme = (theme: WeddingTheme) => {
  const state = $weddingState.get();
  if (state.theme === theme) return;

  $weddingState.set({ ...state, theme });

  // Persist to localStorage and apply to DOM
  if (typeof window !== 'undefined') {
    localStorage.setItem('wedding-theme', theme);
    applyThemeToDom(theme);
  }
};

export const toggleTheme = () => {
  const current = $weddingState.get().theme;
  const next: WeddingTheme = current === 'light' ? 'dark' : current === 'dark' ? 'romantic' : 'light';
  setTheme(next);
};

export const applyThemeToDom = (theme: WeddingTheme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'romantic');
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
  // Also update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    if (theme === 'dark') metaThemeColor.setAttribute('content', '#1f2937');
    else if (theme === 'romantic') metaThemeColor.setAttribute('content', '#ec4899');
    else metaThemeColor.setAttribute('content', '#ffffff');
  }
};

export const toggleSound = () => {
  const prev = $weddingState.get();
  $weddingState.set({ ...prev, soundEnabled: !prev.soundEnabled });
};

export const setLoading = (isLoading: boolean) => {
  $weddingState.set({ ...$weddingState.get(), isLoading });
};

/**
 * playSound(type, enabled)
 * Small WebAudio-based tones for app feedback. Silent if disabled or audio locked.
 */
export const playSound = async (
  type: 'tap' | 'success' | 'error' | 'notification',
  enabled = true
) => {
  if (!enabled) return;
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    let freq = 800;
    let dur = 0.12;
    let vol = 0.06;

    switch (type) {
      case 'tap':
        freq = 900; dur = 0.08; vol = 0.06; break;
      case 'success':
        freq = 1200; dur = 0.18; vol = 0.07; break;
      case 'error':
        freq = 360; dur = 0.25; vol = 0.08; break;
      case 'notification':
        freq = 1000; dur = 0.14; vol = 0.06; break;
    }

    o.type = 'sine';
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.start(now);
    o.stop(now + dur + 0.02);
    // close context shortly after
    setTimeout(() => {
      try { ctx.close(); } catch (e) { /* ignore */ }
    }, (dur + 0.05) * 1000);
  } catch (err) {
    // noop on unsupported browsers
    // console.debug('playSound error', err);
  }
};
