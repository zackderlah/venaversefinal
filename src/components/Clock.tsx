'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !time) {
    return (
      <div className="text-right">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          --:--:--
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          "<span className="rating text-xs font-bold">H</span>" toggle background view
        </div>
      </div>
    );
  }

  // Use consistent formatting to prevent server/client mismatch
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="text-right">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {formatTime(time)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        "<span className="rating text-xs font-bold">H</span>" toggle background view
      </div>
    </div>
  );
} 