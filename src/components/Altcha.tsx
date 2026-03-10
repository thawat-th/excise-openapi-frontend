'use client';

import { useEffect, useRef, useState } from 'react';

interface AltchaProps {
  onVerify: (payload: string) => void;
  onError?: () => void;
}

export function Altcha({ onVerify, onError }: AltchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [challengeJson, setChallengeJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [altchaLoaded, setAltchaLoaded] = useState(false);

  // Store callbacks in refs to avoid stale closures
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
  }, [onVerify, onError]);

  // Custom CSS variables to match our light theme
  const customStyle = {
    '--altcha-color-base': '#ffffff',
    '--altcha-color-text': '#374151',
    '--altcha-color-border': '#d1d5db',
    '--altcha-color-border-focus': '#1d4ed8',
    '--altcha-color-footer-bg': '#f9fafb',
    '--altcha-max-width': '100%',
    '--altcha-border-radius': '0.5rem',
  } as Record<string, string>;

  // Load altcha script
  useEffect(() => {
    import('altcha').then(() => {
      setAltchaLoaded(true);
    }).catch(() => {
      // Script load failed
    });
  }, []);

  // Fetch challenge
  useEffect(() => {
    fetch(`/api/auth/altcha/challenge?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setChallengeJson(JSON.stringify(data));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        onErrorRef.current?.();
      });
  }, []);

  // Use MutationObserver to detect when widget is ready and attach listener
  useEffect(() => {
    if (!altchaLoaded || !challengeJson || !containerRef.current) return;

    let widget: Element | null = null;
    let cleanupFn: (() => void) | null = null;

    const handleStateChange = (ev: Event) => {
      const customEvent = ev as CustomEvent;
      const detail = customEvent.detail || {};

      if (detail.state === 'verified' && detail.payload) {
        onVerifyRef.current(detail.payload);
      } else if (detail.state === 'error') {
        onErrorRef.current?.();
      }
    };

    const attachToWidget = (el: Element) => {
      el.addEventListener('statechange', handleStateChange);
      widget = el;
      cleanupFn = () => {
        el.removeEventListener('statechange', handleStateChange);
      };
    };

    // Try to find widget immediately
    const existingWidget = containerRef.current.querySelector('altcha-widget');
    if (existingWidget) {
      attachToWidget(existingWidget);
    } else {
      // Use MutationObserver to wait for widget
      const observer = new MutationObserver(() => {
        const w = containerRef.current?.querySelector('altcha-widget');
        if (w && !widget) {
          attachToWidget(w);
          observer.disconnect();
        }
      });

      observer.observe(containerRef.current, { childList: true, subtree: true });

      // Also try with a delay as fallback
      const timeoutId = setTimeout(() => {
        const w = containerRef.current?.querySelector('altcha-widget');
        if (w && !widget) {
          attachToWidget(w);
        }
        observer.disconnect();
      }, 1000);

      return () => {
        observer.disconnect();
        clearTimeout(timeoutId);
        cleanupFn?.();
      };
    }

    return () => {
      cleanupFn?.();
    };
  }, [altchaLoaded, challengeJson]);

  if (loading || !altchaLoaded) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-sm text-excise-500">Loading security check...</div>
      </div>
    );
  }

  if (!challengeJson) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-sm text-red-500">Failed to load security check</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center my-4">
      <altcha-widget
        challengejson={challengeJson}
        hidelogo
        hidefooter
        style={customStyle}
      />
    </div>
  );
}
