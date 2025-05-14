'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {time.toLocaleTimeString()}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        "<span className="rating text-xs font-bold">H</span>" toggle background view
      </div>
    </div>
  );
} 