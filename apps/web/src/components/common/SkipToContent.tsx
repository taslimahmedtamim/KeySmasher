'use client';

import React from 'react';

export interface SkipToContentProps {
  targetId?: string;
  label?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-cyan-500 focus:px-4 focus:py-2.5 focus:text-xs focus:font-black focus:text-slate-950 focus:shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-white transition-all duration-150"
    >
      {label}
    </a>
  );
};
