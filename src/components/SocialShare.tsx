import { useState, useEffect } from 'react';

interface SocialShareProps {
  title: string;
  excerpt: string;
  url: string;
  image?: string;
  aiSummary?: string;
  aiHashtags?: string[];
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  generateUrl: (data: SocialShareProps) => string;
  description: string;
}

export default function SocialShare({ 
  title, 
  excerpt, 
  url, 
  image, 
  aiSummary, 
  aiHashtags = [], 
  className = '' 
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareData, setShareData] = useState<SharePlatform[]>([]);

  useEffect(() => {
    // AI-optimized share content
    const optimizedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    const optimizedExcerpt = excerpt.length > 140 ? excerpt.substring(0, 137) + '...' : excerpt;
    const hashtagString = aiHashtags.join(' ');
    const shareText = aiSummary || `${optimizedTitle}\n\n${optimizedExcerpt}`;

    const platforms: SharePlatform[] = [
      {
        name: 'Twitter',
        icon: '𝕏',
        color: 'bg-black hover:bg-gray-800',
        description: 'Share on X (Twitter)',
        generateUrl: () => {
          const text = `${shareText}\n\n${hashtagString}`.substring(0, 250);
          return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        }
      },
      {
        name: 'LinkedIn',
        icon: '💼',
        color: 'bg-blue-700 hover:bg-blue-800',
        description: 'Share on LinkedIn',
        generateUrl: () => {
          return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(optimizedTitle)}&summary=${encodeURIComponent(optimizedExcerpt)}`;
        }
      },
      {
        name: 'Facebook',
        icon: '📘',
        color: 'bg-blue-600 hover:bg-blue-700',
        description: 'Share on Facebook',
        generateUrl: () => {
          return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
        }
      },
      {
        name: 'Reddit',
        icon: '🤖',
        color: 'bg-orange-600 hover:bg-orange-700',
        description: 'Share on Reddit',
        generateUrl: () => {
          return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(optimizedTitle)}`;
        }
      },
      {
        name: 'WhatsApp',
        icon: '💬',
        color: 'bg-green-600 hover:bg-green-700',
        description: 'Share on WhatsApp',
        generateUrl: () => {
          const text = `${optimizedTitle}\n\n${optimizedExcerpt}\n\n${url}`;
          return `https://wa.me/?text=${encodeURIComponent(text)}`;
        }
      },
      {
        name: 'Telegram',
        icon: '✈️',
        color: 'bg-blue-500 hover:bg-blue-600',
        description: 'Share on Telegram',
        generateUrl: () => {
          const text = `${optimizedTitle}\n\n${optimizedExcerpt}`;
          return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        }
      },
      {
        name: 'Email',
        icon: '📧',
        color: 'bg-gray-600 hover:bg-gray-700',
        description: 'Share via Email',
        generateUrl: () => {
          const subject = `Check out: ${optimizedTitle}`;
          const body = `${shareText}\n\nRead more: ${url}`;
          return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
      }
    ];

    setShareData(platforms);
  }, [title, excerpt, url, aiSummary, aiHashtags]);

  const copyToClipboard = async () => {
    try {
      const shareText = `${title}\n\n${excerpt}\n\n${url}\n\n${aiHashtags.join(' ')}`;
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url
        });
      } catch (err) {
        console.error('Native sharing failed:', err);
      }
    }
  };

  const openShare = (platform: SharePlatform) => {
    window.open(platform.generateUrl({ title, excerpt, url, image, aiSummary, aiHashtags }), '_blank', 'width=600,height=400');
  };

  return (
    <div className={`social-share ${className}`}>
      {/* Main Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition-all duration-200"
        title="Share this post"
        aria-label="Open sharing options"
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
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        <span className="hidden md:inline">Share</span>
      </button>

      {/* Share Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Share this article</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close sharing panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                AI-optimized content for maximum engagement
              </p>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-b dark:border-dark-700">
              <div className="grid grid-cols-2 gap-3">
                {/* Native Share */}
                {'share' in navigator && (
                  <button
                    onClick={shareNative}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Share
                  </button>
                )}

                {/* Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className={`${copySuccess ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-colors`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Social Platforms */}
            <div className="p-6">
              <h4 className="font-semibold mb-4">Share on social media</h4>
              <div className="grid grid-cols-1 gap-3">
                {shareData.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => openShare(platform)}
                    className={`${platform.color} text-white rounded-lg p-3 flex items-center gap-3 transition-colors w-full text-left`}
                    title={platform.description}
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm opacity-90">{platform.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Hashtags Preview */}
            {aiHashtags.length > 0 && (
              <div className="p-6 bg-gray-50 dark:bg-dark-700">
                <h4 className="font-semibold mb-2">AI-Generated Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {aiHashtags.map((hashtag, index) => (
                    <span 
                      key={index}
                      className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded text-sm"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}