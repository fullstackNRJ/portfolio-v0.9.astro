# Wedding App — Developer Guide (concise)

This guide explains how the `/wedding` route is structured, how to add client-side components (React / Svelte / others), how to wire transitions and the global store, and how to enable audio feedback.

Files you should know

- `src/stores/weddingStore.ts` — Framework-agnostic global state (Nanostores) and `playSound` utility.
- `src/layouts/WeddingLayout.astro` — Mobile-first layout with bottom navigation. Emits `wedding-tab-change` and `wedding-play-sound` events.
- `src/styles/wedding.css` — Styles for navbar, animations and safe-area support.
- `src/pages/wedding/index.astro` — Entry page; client components are rendered here and hidden/shown by tab events.
- `src/components/wedding/*` — Client components (React, Svelte, etc.).

Core contract

- Components rendered on the `/wedding` page should:
	- Mount client-side (use `client:load`, `client:idle` or `client:visible` as appropriate).
	- Listen for the `wedding-tab-change` event to react when the active tab changes.
	- Optionally listen for `wedding-play-sound` to play audio via `playSound` or call `playSound` directly.
- The layout dispatches `wedding-tab-change` when a bottom-nav item is tapped; it also dispatches `wedding-play-sound` with `{ type }`.

Adding a new tab

1. Add a nav button in `src/layouts/WeddingLayout.astro` with `data-tab="yourtab"` and label/icon.
2. Create a client component in `src/components/wedding/YourTab.(tsx|svelte|vue)` and export the default component.
3. In `src/pages/wedding/index.astro`, add a wrapper `<div data-tab-content="yourtab"> <YourTab client:load /> </div>`.
4. Inside your component, listen to `wedding-tab-change` and animate in/out based on the active tab.

Example: React component pattern

```tsx
import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $weddingState, playSound } from '../../stores/weddingStore';

export default function YourTab(){
	const state = useStore($weddingState);
	const [visible, setVisible] = useState(false);

	useEffect(()=>{
		const onTab = (e:any)=> setVisible(e.detail?.tab === 'yourtab');
		window.addEventListener('wedding-tab-change', onTab);
		return ()=> window.removeEventListener('wedding-tab-change', onTab);
	},[]);

	return <div data-tab-content="yourtab" className={visible ? 'fade-in' : 'fade-out'}>...</div>
}
```

Svelte pattern

```svelte
<script>
	import { onMount, onDestroy } from 'svelte';
	import { $weddingState } from '../../stores/weddingStore';
	let visible = false;
	function onTab(e){ visible = e.detail?.tab === 'yourtab'; }
	onMount(()=> window.addEventListener('wedding-tab-change', onTab));
	onDestroy(()=> window.removeEventListener('wedding-tab-change', onTab));
</script>

<div data-tab-content="yourtab" class:fade-in={visible} class:fade-out={!visible}>...</div>
```

Transitions & animation tips

- Prefer transform and opacity (translate, scale, opacity) to avoid layout thrashing.
- Use the provided `.fade-in` / `.fade-out` classes for quick fades. Use `.animate-slide-up` for modal sheets.
- Stagger child animations with `animation-delay` for a pleasant effect.

Audio feedback

- Use `playSound(type, enabled)` from the store. The layout dispatches `wedding-play-sound` when nav is tapped; components can also call `playSound` directly.
- On mobile browsers, audio often requires a prior user gesture; tie important sounds to clicks/taps.

Global state (Nanostores)

- Import and read: `import { useStore } from '@nanostores/react'; import { $weddingState } from '../../stores/weddingStore';`
- Update from any framework by calling exposed helpers (we expose `setActiveTab`, `setTheme`, `toggleSound`, `setLoading`) or dispatching events.

Accessibility

- Provide `aria-label` on nav buttons (layout already does).
- Ensure interactive cards are focusable and respond to Enter/Space.

Build & run

```bash
npm install
npm run dev
# open http://localhost:3000/wedding
```

Notes

- This repo already includes `nanostores` and `@nanostores/react` in `package.json`.
- I kept components small and framework-agnostic. If you need deeper integration (server-side data fetching, auth, or persistent storage), add APIs under `src/pages/api/` and wire them in the components.

If you'd like, I can now:

- Add a small Vue example component.
- Wire a persisted theme toggle that updates `document.documentElement` classes.
- Add unit tests for the store helpers.

