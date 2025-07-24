import { useState, useEffect } from 'react';

interface AccessibilityPanelProps {
  className?: string;
}

export default function AccessibilityPanel({ className = '' }: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTextScale = localStorage.getItem('accessibility-text-scale');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedDyslexiaFont = localStorage.getItem('accessibility-dyslexia-font') === 'true';
    const savedFocusVisible = localStorage.getItem('accessibility-focus-visible') === 'true';

    if (savedTextScale) setTextScale(parseFloat(savedTextScale));
    setHighContrast(savedHighContrast);
    setDyslexiaFont(savedDyslexiaFont);
    setFocusVisible(savedFocusVisible);

    // Apply saved settings
    applyTextScale(savedTextScale ? parseFloat(savedTextScale) : 1);
    applyHighContrast(savedHighContrast);
    applyDyslexiaFont(savedDyslexiaFont);
    applyFocusVisible(savedFocusVisible);
  }, []);

  const applyTextScale = (scale: number) => {
    document.documentElement.style.fontSize = `${scale}rem`;
  };

  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const applyDyslexiaFont = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dyslexia-friendly');
    } else {
      document.documentElement.classList.remove('dyslexia-friendly');
    }
  };

  const applyFocusVisible = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('focus-visible-enhanced');
    } else {
      document.documentElement.classList.remove('focus-visible-enhanced');
    }
  };

  const handleTextScaleChange = (newScale: number) => {
    setTextScale(newScale);
    applyTextScale(newScale);
    localStorage.setItem('accessibility-text-scale', newScale.toString());
    announceChange(`Text size changed to ${Math.round(newScale * 100)}%`);
  };

  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    applyHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
    announceChange(`High contrast ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleDyslexiaFontToggle = () => {
    const newValue = !dyslexiaFont;
    setDyslexiaFont(newValue);
    applyDyslexiaFont(newValue);
    localStorage.setItem('accessibility-dyslexia-font', newValue.toString());
    announceChange(`Dyslexia-friendly font ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleFocusVisibleToggle = () => {
    const newValue = !focusVisible;
    setFocusVisible(newValue);
    applyFocusVisible(newValue);
    localStorage.setItem('accessibility-focus-visible', newValue.toString());
    announceChange(`Enhanced focus indicators ${newValue ? 'enabled' : 'disabled'}`);
  };

  const resetSettings = () => {
    setTextScale(1);
    setHighContrast(false);
    setDyslexiaFont(false);
    setFocusVisible(false);

    applyTextScale(1);
    applyHighContrast(false);
    applyDyslexiaFont(false);
    applyFocusVisible(false);

    localStorage.removeItem('accessibility-text-scale');
    localStorage.removeItem('accessibility-high-contrast');
    localStorage.removeItem('accessibility-dyslexia-font');
    localStorage.removeItem('accessibility-focus-visible');

    announceChange('Accessibility settings reset to defaults');
  };

  const announceChange = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <div className={`accessibility-panel ${className}`}>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors z-50 focus:ring-2 focus:ring-blue-500"
        title="Open accessibility settings"
        aria-label="Open accessibility settings panel"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Accessibility Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close accessibility panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                Customize the site to meet your accessibility needs
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Text Size */}
              <div>
                <label className="block text-sm font-medium mb-3" htmlFor="text-scale">
                  Text Size: {Math.round(textScale * 100)}%
                </label>
                <div className="space-y-2">
                  <input
                    id="text-scale"
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.1"
                    value={textScale}
                    onChange={(e) => handleTextScaleChange(parseFloat(e.target.value))}
                    className="w-full"
                    aria-describedby="text-scale-description"
                  />
                  <p id="text-scale-description" className="text-xs text-gray-600 dark:text-gray-400">
                    Adjust the text size from 80% to 200% of normal
                  </p>
                  <div className="flex gap-2">
                    {[0.8, 1, 1.2, 1.5, 2].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => handleTextScaleChange(scale)}
                        className={`px-2 py-1 text-xs rounded ${
                          textScale === scale
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {Math.round(scale * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* High Contrast */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={handleHighContrastToggle}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium">High Contrast Mode</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increases contrast for better visibility
                    </p>
                  </div>
                </label>
              </div>

              {/* Dyslexia-Friendly Font */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dyslexiaFont}
                    onChange={handleDyslexiaFontToggle}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium">Dyslexia-Friendly Font</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uses a font designed to improve readability for dyslexia
                    </p>
                  </div>
                </label>
              </div>

              {/* Enhanced Focus */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={focusVisible}
                    onChange={handleFocusVisibleToggle}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium">Enhanced Focus Indicators</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Makes keyboard navigation more visible
                    </p>
                  </div>
                </label>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Search</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded text-xs">/</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Voice Reader Play/Pause</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded text-xs">Space</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Close Modals</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded text-xs">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t dark:border-dark-700">
                <button
                  onClick={resetSettings}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-dark-700 rounded-b-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Settings are automatically saved and will persist across sessions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut listeners */}
      <div className="sr-only" aria-live="polite" id="accessibility-announcements"></div>
    </div>
  );
}