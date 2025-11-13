import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $weddingState, playSound } from '../../stores/weddingStore';

interface TimelineEvent {
	id: number;
	date: string;
	title: string;
	description: string;
	status: 'completed' | 'pending' | 'upcoming';
	icon: string;
}

export default function WeddingTimeline() {
	const state = useStore($weddingState);
	const [events] = useState<TimelineEvent[]>([
		{ id: 1, date: 'Mar 15, 2025', title: 'Engagement Party', description: 'Celebrate with family', status: 'completed', icon: '🎉' },
		{ id: 2, date: 'Apr 20, 2025', title: 'Venue Booking', description: 'Reserve venue', status: 'completed', icon: '🏛️' },
		{ id: 3, date: 'May 30, 2025', title: 'Invitations Sent', description: 'Send invites', status: 'pending', icon: '📬' },
		{ id: 4, date: 'Jul 5, 2025', title: 'The Big Day!', description: 'Ceremony & reception', status: 'upcoming', icon: '💍' },
	]);

	const [visibleItems, setVisibleItems] = useState<number[]>([]);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// stagger reveal
		events.forEach((_, idx) => {
			setTimeout(() => setVisibleItems(prev => [...prev, idx]), idx * 120);
		});
		setIsVisible(true);

		const onPlay = (e: any) => playSound(e.detail?.type || 'tap', state.soundEnabled);
		window.addEventListener('wedding-play-sound', onPlay);
		const onTab = (e: any) => {
			const tab = e.detail?.tab;
			setIsVisible(tab === 'timeline');
		};
		window.addEventListener('wedding-tab-change', onTab);

		return () => {
			window.removeEventListener('wedding-play-sound', onPlay);
			window.removeEventListener('wedding-tab-change', onTab);
		};
	}, []);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed': return 'from-green-500 to-emerald-500';
			case 'pending': return 'from-yellow-500 to-amber-500';
			case 'upcoming': return 'from-pink-500 to-rose-500';
			default: return 'from-gray-500 to-gray-400';
		}
	};

	return (
		<div className={`wedding-page px-4 py-6 ${isVisible ? 'fade-in' : 'fade-out'}`} data-tab-content="timeline">
			<div className="max-w-md mx-auto">
				<h2 className="font-serif text-3xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Wedding Timeline</h2>

				<div className="relative pl-8">
					<div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>

					<div className="space-y-8">
						{events.map((event, idx) => (
							<div key={event.id} className={`relative transition-all duration-500 transform ${visibleItems.includes(idx) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
								<div className={`absolute -left-8 top-0 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-r ${getStatusColor(event.status)} z-10`} />

								<div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
									<div className="flex items-start gap-3 mb-2">
										<span className="text-2xl">{event.icon}</span>
										<div className="flex-1">
											<p className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">{event.date}</p>
										</div>
										<span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 capitalize">{event.status}</span>
									</div>
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

