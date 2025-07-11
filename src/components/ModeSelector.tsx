import { useStore } from '@nanostores/react';
import { portfolioMode, setPortfolioMode, type PortfolioMode } from '../stores/portfolioMode';
import { useState } from 'react';

export default function ModeSelector() {
  const $mode = useStore(portfolioMode);
  const [isOpen, setIsOpen] = useState(false);

  const modes: { id: PortfolioMode; label: string; description: string; path: string }[] = [
    {
      id: 'basic',
      label: 'Technical',
      description: 'Technical deep-dive with code samples',
      path: '/technical'
    },
    {
      id: 'business-product',
      label: 'Business/Product',
      description: 'Professional focus with achievements',
      path: '/business-product'
    },
    {
      id: 'consultant',
      label: 'Consultant',
      description: 'Consulting-oriented with case studies',
      path: '/consultant'
    },
    {
      id: 'story',
      label: 'Story',
      description: 'Journey-focused narrative presentation',
      path: '/neerajmukta-tv'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-dark-800 dark:text-dark-100 hover:bg-gray-200 dark:hover:bg-dark-800 focus:outline-none"
        aria-label="Change portfolio mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-dark-900 shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-lg">
          <div className="p-2">
            {modes.map((mode) => (
              <a
                key={mode.id}
                href={mode.path}
                onClick={() => {
                  setPortfolioMode(mode.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${$mode === mode.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-800'
                  }`}
              >
                <div className="font-medium">{mode.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}