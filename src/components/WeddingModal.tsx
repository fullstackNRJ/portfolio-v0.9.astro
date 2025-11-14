import React, { useState, useEffect } from 'react';

export default function WeddingModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has seen the modal before
        const hasSeenWeddingModal = localStorage.getItem('hasSeenWeddingModal');

        if (!hasSeenWeddingModal) {
            // Show modal for new users
            setIsOpen(true);
            // Mark that user has seen the modal
            localStorage.setItem('hasSeenWeddingModal', 'true');
        }
    }, []);

    const closeModal = () => {
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Our Wedding Celebration
                    </h2>

                    {/* Wedding Image/Card Area */}
                    <div className="bg-gray-100 rounded-lg p-6 mb-8 text-center">
                        <img
                            src="/images/wedding-card.jpg"
                            alt="Our Wedding Story"
                            className="w-full rounded-lg mb-4 object-cover"
                            onError={(e) => {
                                // Fallback if image not found
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <p className="text-gray-600 text-sm">
                            Join us for our special day!
                        </p>
                    </div>

                    {/* RSVP Form */}
                    <div className="space-y-4 mb-6">
                        <input
                            type="text"
                            placeholder="Your Name(s)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* CTA Button */}
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg hover:opacity-90 transition-all mb-4">
                        Generate My Invite & Gift Code
                    </button>

                    {/* Close Link */}
                    <button
                        onClick={closeModal}
                        className="w-full text-gray-500 hover:text-gray-700 transition-colors text-sm"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
