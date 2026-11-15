import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SkipToContent } from '@/components/common/SkipToContent';
import {
  AccessibilityProvider,
  useAccessibility,
} from '@/components/common/AccessibilityAnnouncer';
import GlobalErrorPage from '@/app/error';
import NotFound from '@/app/not-found';
import { metadata, viewport } from '@/app/layout';

// Test consumer for accessibility announcer
const AnnounceTestComponent: React.FC = () => {
  const { announce } = useAccessibility();

  return (
    <div>
      <button
        type="button"
        onClick={() => announce('Test completed. 95 WPM with 99% accuracy.')}
      >
        Announce Polite
      </button>
      <button
        type="button"
        onClick={() => announce('Race countdown started!', 'assertive')}
      >
        Announce Assertive
      </button>
    </div>
  );
};

describe('Feature O: Accessibility, Performance & Production Readiness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SkipToContent Component', () => {
    it('renders with accessible href and focuses target on activation', () => {
      // Mock document target element
      const targetEl = document.createElement('main');
      targetEl.id = 'main-content';
      targetEl.focus = vi.fn();
      targetEl.scrollIntoView = vi.fn();
      document.body.appendChild(targetEl);

      render(<SkipToContent targetId="main-content" />);
      const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      fireEvent.click(skipLink);
      expect(targetEl.focus).toHaveBeenCalled();
      expect(targetEl.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(targetEl);
    });
  });

  describe('AccessibilityAnnouncer & useAccessibility', () => {
    it('renders polite and assertive ARIA live regions and announces messages', () => {
      render(
        <AccessibilityProvider>
          <AnnounceTestComponent />
        </AccessibilityProvider>
      );

      const politeRegion = screen.getByRole('status');
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(politeRegion).toHaveAttribute('aria-atomic', 'true');

      const assertiveRegion = screen.getByRole('alert');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true');

      // Trigger polite announcement
      const politeBtn = screen.getByRole('button', { name: /Announce Polite/i });
      fireEvent.click(politeBtn);
      expect(politeRegion.textContent).toBe('Test completed. 95 WPM with 99% accuracy.');

      // Trigger assertive announcement
      const assertiveBtn = screen.getByRole('button', { name: /Announce Assertive/i });
      fireEvent.click(assertiveBtn);
      expect(assertiveRegion.textContent).toBe('Race countdown started!');

      // Advance timers to verify auto-clear
      act(() => {
        vi.advanceTimersByTime(5100);
      });
      expect(politeRegion.textContent).toBe('');
      expect(assertiveRegion.textContent).toBe('');
    });
  });

  describe('GlobalErrorPage Component', () => {
    it('renders error boundary screen and triggers reset callback on Retry', () => {
      const mockReset = vi.fn();
      const testError = new Error('Database connection failed');
      (testError as unknown as { digest: string }).digest = 'ERR_DB_TIMEOUT_408';

      render(<GlobalErrorPage error={testError as Error & { digest?: string }} reset={mockReset} />);

      expect(screen.getByRole('heading', { name: /Engine Interrupted/i })).toBeInTheDocument();
      expect(screen.getByText(/ERR_DB_TIMEOUT_408/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryBtn);
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('NotFound 404 Component', () => {
    it('renders 404 heading and navigation recovery links', () => {
      render(<NotFound />);
      expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return Home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Practice Test/i })).toBeInTheDocument();
    });
  });

  describe('Metadata and PWA Configuration', () => {
    it('defines comprehensive SEO, openGraph, twitter, and manifest settings', () => {
      expect(metadata.title).toContain('KeySmasher');
      expect(metadata.description).toBeDefined();
      expect(metadata.manifest).toBe('/manifest.json');
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
      expect(viewport.colorScheme).toBe('dark');
      expect(viewport.themeColor).toBe('#090d16');
    });
  });
});
