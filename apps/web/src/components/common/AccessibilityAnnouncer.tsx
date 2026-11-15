'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type AnnouncePriority = 'polite' | 'assertive';

export interface AccessibilityContextType {
  announce: (message: string, priority?: AnnouncePriority) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  announce: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState<string>('');
  const [assertiveMessage, setAssertiveMessage] = useState<string>('');
  const politeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const assertiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, priority: AnnouncePriority = 'polite') => {
    if (!message) return;

    if (priority === 'assertive') {
      if (assertiveTimerRef.current) clearTimeout(assertiveTimerRef.current);
      setAssertiveMessage(message);
      assertiveTimerRef.current = setTimeout(() => {
        setAssertiveMessage('');
      }, 5000);
    } else {
      if (politeTimerRef.current) clearTimeout(politeTimerRef.current);
      setPoliteMessage(message);
      politeTimerRef.current = setTimeout(() => {
        setPoliteMessage('');
      }, 5000);
    }
  }, []);

  return (
    <AccessibilityContext.Provider value={{ announce }}>
      {children}
      {/* Off-screen live regions for assistive technology screen readers */}
      <div
        id="a11y-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        id="a11y-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AccessibilityContext.Provider>
  );
};
