import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $weddingState, playSound } from '../../stores/weddingStore';

interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  image: string;
}

export default function WeddingVendors() {
  const state = useStore($weddingState);

  const [vendors] = useState<Vendor[]>([
    {
      id: 1,
      name: 'Elegant Catering',
      category: 'Catering',
      rating: 4.9,
      image: '🍽️',
    },
    {
      id: 2,
      name: 'Forever Flowers',
      category: 'Flowers',
      rating: 4.8,
      image: '💐',
    },
    {
      id: 3,
      name: 'Spotlight Photography',
      category: 'Photography',
      rating: 5.0,
      image: '📸',
    },
    { id: 4, name: 'Melody Sounds', category: 'DJ/Music', rating: 4.7, image: '🎵' },
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const selectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    playSound('tap', state.soundEnabled);
  };

  const closeDetail = () => {
    setSelectedVendor(null);
  };

  return (
    <div className="wedding-page px-4 py-6">
      <div className="max-w-md mx-auto">
        <h2 className="font-serif text-3xl mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Our Vendors
        </h2>

        <div className="space-y-4">
          {vendors.map((vendor, idx) => (
            <div
              key={vendor.id}
              className={`vendor-card bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 transform touch-manipulation ${
                isVisible ? 'fade-in' : ''
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => selectVendor(vendor)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  selectVendor(vendor);
                }
              }}
            >
              <div className="flex gap-4">
                <div className="text-5xl flex-shrink-0">{vendor.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {vendor.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">
                    {vendor.category}
                  </p>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {vendor.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedVendor && (
          <div
            className="fixed inset-0 bg-black/50 flex items-end z-40 animate-fade-in"
            onClick={closeDetail}
            role="presentation"
          >
            <div
              className="w-full bg-white dark:bg-slate-800 rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="vendor-detail-title"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedVendor.image}</div>
                <h3
                  id="vendor-detail-title"
                  className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2"
                >
                  {selectedVendor.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedVendor.category} • ★ {selectedVendor.rating}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                  Professional {selectedVendor.category.toLowerCase()} service with{' '}
                  {selectedVendor.rating} star rating. Contact us to book your wedding date
                  today!
                </p>
                <button
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold py-3 rounded-xl mb-2 hover:shadow-lg transition-shadow active:scale-95 touch-manipulation"
                  onClick={() => {
                    playSound('success', state.soundEnabled);
                  }}
                >
                  Book Now
                </button>
                <button
                  className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors active:scale-95 touch-manipulation"
                  onClick={closeDetail}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .vendor-card {
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .vendor-card.fade-in {
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
