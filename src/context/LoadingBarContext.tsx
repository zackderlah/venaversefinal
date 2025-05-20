"use client";

import { createContext, useContext, useCallback, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LoadingBarContextType {
  start: () => void;
  done: () => void;
}

const LoadingBarContext = createContext<LoadingBarContextType>({
  start: () => {},
  done: () => {},
});

export function LoadingBarProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const start = useCallback(() => setIsLoading(true), []);
  const done = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingBarContext.Provider value={{ start, done }}>
      {isLoading && <LoadingSpinner />}
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  return useContext(LoadingBarContext);
} 