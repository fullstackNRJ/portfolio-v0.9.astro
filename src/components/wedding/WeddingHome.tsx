import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $weddingState, playSound, setActiveTab } from '../../stores/weddingStore';

export default function WeddingHome() {
	const state = useStore($weddingState);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
		// listen for external tab changes to animate out if needed
		const onTab = (e: any) => {
			const tab = e.detail?.tab;
			if (tab && tab !== 'home') {
				setIsVisible(false);
			} else if (tab === 'home') {
				setIsVisible(true);
			}
		};
		window.addEventListener('wedding-tab-change', onTab);
		// allow play-sound bridge from layout
		const onPlay = (e: any) => playSound(e.detail?.type || 'tap', state.soundEnabled);
		window.addEventListener('wedding-play-sound', onPlay);

		return () => {
			window.removeEventListener('wedding-tab-change', onTab);
			window.removeEventListener('wedding-play-sound', onPlay);
		};
	}, [state.soundEnabled]);

	return (
		<div className={`wedding-page px-4 py-6 ${isVisible ? 'fade-in' : 'fade-out'}`} data-tab-content="home">
			<div className="max-w-md mx-auto space-y-6">
				<div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h1 className="font-serif text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
						Our Love Story
					</h1>
					<p className="text-gray-600 dark:text-gray-300 text-lg">Just 120 days to celebrate forever</p>
				</div>

				<div className={`grid grid-cols-4 gap-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					{[
						{ label: 'Days', value: 120 },
						{ label: 'Hours', value: 8 },
						{ label: 'Mins', value: 45 },
						{ label: 'Secs', value: 32 },
					].map((item, idx) => (
						<div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
							<div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">{item.value}</div>
							<div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
						</div>
					))}
				</div>

				<div className={`space-y-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<button
						className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold py-4 rounded-2xl hover:shadow-lg"
						onClick={() => {
							playSound('success', state.soundEnabled);
							// example: jump to timeline
							setActiveTab('timeline');
							window.dispatchEvent(new CustomEvent('wedding-set-tab', { detail: { tab: 'timeline' } }));
							window.dispatchEvent(new CustomEvent('wedding-tab-change', { detail: { tab: 'timeline' } }));
						}}
					>
						Start Planning
					</button>
					<button className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-2xl hover:bg-gray-50" onClick={() => window.dispatchEvent(new CustomEvent('wedding-set-tab', { detail: { tab: 'timeline' } }))}>
						View Timeline
					</button>
				</div>
			</div>
		</div>
	);
}

