# Wedding App — Testing Guide

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000/wedding
```

## What to Test

### 1. **Tab Navigation (Bottom Nav)**
- Click each tab (🏠 Home, 🧾 Vendors, 🗓️ Timeline, 💰 Budget, 👥 Guests, ✅ Tasks)
- Verify:
  - Tab highlights (active state changes)
  - Content fades in/out smoothly
  - Icons respond to clicks (scale animation)
  - Sound plays on tap (if speaker is on)

### 2. **Theme Toggle (💗 / 🌙 / ☀️ button)**
- Click the rightmost button to toggle themes
- Observe the cycle: **Romantic (pink/purple)** → **Dark** → **Light** → **Romantic**
- Verify:
  - Icon changes: 💗 (romantic) → 🌙 (dark) → ☀️ (light)
  - Entire page theme changes (background, text, cards)
  - Mobile status bar color updates (if testing on device)
  - Theme persists after page refresh (check localStorage)

### 3. **Persistence (localStorage)**
Open DevTools (F12) and test:

```javascript
// In console:
localStorage.getItem('wedding-theme')  // should show current theme
localStorage.setItem('wedding-theme', 'dark')  // manually set
```

Then:
- Hard refresh the page (Cmd+Shift+R)
- Theme should persist to what you set

### 4. **Responsive Design**
- Shrink browser to mobile width (375px)
- Verify:
  - Bottom nav stays fixed at bottom
  - Tabs stack nicely, no overflow
  - Safe area insets apply on notched devices (iOS simulator)
  - Tab labels are readable

### 5. **Sound Feedback**
- Click any tab
- Should hear a subtle "tap" sound (if not muted)
- Mute tab in browser (speaker icon) and tap again—no sound
- Unmute and verify sound returns

### 6. **Content Visibility**
Each tab should show:

| Tab | Content |
|-----|---------|
| 🏠 Home | "Our Love Story" headline, countdown (120 days, etc.), 3 quick stats, 2 buttons |
| 🧾 Vendors | "Our Vendors" title, 4 vendor cards (Catering, Flowers, Photography, DJ) |
| 🗓️ Timeline | "Wedding Timeline" title, vertical timeline with 4 events and colored dots |
| 💰 Budget | (Placeholder—not yet implemented) |
| 👥 Guests | (Placeholder—not yet implemented) |
| ✅ Tasks | (Placeholder—not yet implemented) |

### 7. **Dark Mode Styling**
Switch to dark theme and check:
- Text is readable (light text on dark background)
- Cards have appropriate contrast
- Buttons are styled correctly
- No white background blinding issues

### 8. **Vendor Modal (Home tab detail)**
- On Vendors tab, click a vendor card
- Sheet modal slides up from bottom
- See vendor image, name, category, rating
- "Book Now" button is visible
- "Close" button hides the modal
- Clicking outside the modal also closes it

### 9. **Animations**
- Tab transitions should be smooth (not jerky)
- Cards on Timeline should stagger in (each with slight delay)
- Theme switching should fade smoothly (not instant flicker)

## Browser DevTools Checks

### Console (F12 → Console tab)
```javascript
// Check store state
console.log(localStorage.getItem('wedding-theme'));

// Manually trigger events (for testing)
window.dispatchEvent(new CustomEvent('wedding-set-theme', { detail: { theme: 'dark' } }));
window.dispatchEvent(new CustomEvent('wedding-tab-change', { detail: { tab: 'timeline' } }));
```

### Network tab
- No errors in console
- JS and CSS load without 404s

### Lighthouse (DevTools → Lighthouse)
- Run performance audit
- Should score well on mobile (aim for 90+)

### Local Storage (DevTools → Application → Local Storage)
- Look for `wedding-theme` key
- Should reflect current theme after refresh

## Testing on Mobile Devices

### iOS (macOS Simulator)
```bash
# Build and preview
npm run build
npm run preview
# Access from iPhone simulator at http://localhost:3000/wedding
```

- Test safe area insets (notch + home bar)
- Verify status bar color changes with theme

### Android Emulator
- Same as iOS
- Test landscape/portrait rotations

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Theme doesn't persist after refresh | Check browser localStorage is enabled; clear cache and try again |
| Sound not playing | Browser may block autoplay audio; click a button to unmute, then try again |
| Nav buttons not clickable | Ensure z-index conflict isn't hiding nav; check DevTools Computed styles |
| Tabs not switching | Open console and check for JS errors; verify `wedding-tab-change` event is firing |
| Dark mode too dark | Adjust CSS variables in `src/styles/wedding.css` |

## Performance Tips

- Open DevTools → Performance tab
- Record a session of clicking through tabs
- Verify no long tasks or layout shifts
- Look for smooth 60fps animations

## Edge Cases to Test

1. **Rapid tab clicks** — should queue and not break
2. **Refresh during animation** — should land on correct tab
3. **System dark mode preference** — if not stored in localStorage, should default to system preference
4. **Accessibility** — Tab through nav with keyboard; verify focus indicators visible

## Next: Automation Testing (Optional)

If you'd like to add automated tests:

```bash
npm install --save-dev @playwright/test
# Then create tests/wedding.spec.ts with:
# - Tab navigation assertions
# - Theme persistence checks
# - Element visibility tests
```

---

**Last Updated:** November 5, 2025
