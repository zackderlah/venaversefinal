'use client';

import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
  className?: string;
}

export default function ShareButton({ title, url, text, className = '' }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);

    try {
      if (isNative) {
        // Use native share
        await Share.share({
          title,
          text: text || `Check out this review: ${title}`,
          url: `https://venaverse.net${url}`,
          dialogTitle: 'Share review',
        });
      } else if (navigator.share) {
        // Use Web Share API
        await navigator.share({
          title,
          text: text || `Check out this review: ${title}`,
          url: `https://venaverse.net${url}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`https://venaverse.net${url}`);
        alert('Link copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.message !== 'Share canceled') {
        console.error('Error sharing:', error);
      }
    } finally {
      setSharing(false);
    }
  };

  if (!isNative && !navigator.share && !navigator.clipboard) {
    return null; // Don't show share button if not supported
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className={`flex items-center gap-1 text-xs lowercase font-semibold text-blue-600 hover:underline disabled:opacity-50 ${className}`}
      aria-label="Share"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      {sharing ? 'sharing...' : 'share'}
    </button>
  );
}

