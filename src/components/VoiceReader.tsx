import { useState, useEffect, useRef } from 'react';

interface VoiceReaderProps {
  content: string;
  title: string;
  className?: string;
}

export default function VoiceReader({ content, title, className = '' }: VoiceReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textContentRef = useRef<string>('');

  // Clean content for speech synthesis
  const cleanContent = (htmlContent: string): string => {
    return htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
      .replace(/`[^`]*`/g, '[Code]') // Replace inline code
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert markdown links to text
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  useEffect(() => {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Select a good default voice (prefer English voices)
        const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          setVoice(englishVoices[0]);
        } else if (availableVoices.length > 0) {
          setVoice(availableVoices[0]);
        }
      };

      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  useEffect(() => {
    textContentRef.current = cleanContent(`${title}. ${content}`);
  }, [content, title]);

  const speak = () => {
    if (!isSupported || !textContentRef.current) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textContentRef.current);
    utteranceRef.current = utterance;

    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const progressPercent = (event.charIndex / textContentRef.current.length) * 100;
        setProgress(Math.min(progressPercent, 100));
      }
    };

    speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`voice-reader bg-white/90 dark:bg-dark-800/90 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <svg 
            className="w-5 h-5 text-primary-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 7l2-2v14l-2-2V7z" 
            />
          </svg>
          Voice Reader
        </h3>
        
        {/* Rate Control */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Speed:</label>
          <select 
            value={rate} 
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="text-sm border rounded px-2 py-1 dark:bg-dark-700 dark:border-dark-600"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(progress)}% completed
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isPlaying && !isPaused ? (
          <button
            onClick={speak}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 transition-colors"
            title="Start reading"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        ) : isPlaying ? (
          <button
            onClick={pause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-3 transition-colors"
            title="Pause reading"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={resume}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition-colors"
            title="Resume reading"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        )}

        <button
          onClick={stop}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors"
          title="Stop reading"
          disabled={!isPlaying && !isPaused}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>
      </div>

      {/* Voice Selection */}
      {voices.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Voice:</label>
          <select 
            value={voice?.name || ''} 
            onChange={(e) => {
              const selectedVoice = voices.find(v => v.name === e.target.value);
              setVoice(selectedVoice || null);
            }}
            className="w-full text-sm border rounded px-3 py-2 dark:bg-dark-700 dark:border-dark-600"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Accessibility Features */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>• Use keyboard: Space to play/pause, Escape to stop</p>
        <p>• Screen reader compatible</p>
      </div>
    </div>
  );
}