"use client";

import { createContext, useContext, useCallback } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

interface LoadingBarContextType {
  start: () => void;
  done: () => void;
}

const LoadingBarContext = createContext<LoadingBarContextType>({
  start: () => {},
  done: () => {},
});

export function LoadingBarProvider({ children }: { children: React.ReactNode }) {
  const start = useCallback(() => NProgress.start(), []);
  const done = useCallback(() => NProgress.done(), []);

  return (
    <LoadingBarContext.Provider value={{ start, done }}>
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  return useContext(LoadingBarContext);
} 