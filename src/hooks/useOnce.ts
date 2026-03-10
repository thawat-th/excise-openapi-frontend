import { useRef, useEffect, DependencyList } from 'react';

/**
 * useOnce - Hook to run effect only once, preventing React Strict Mode double execution
 *
 * Problem:
 * - React Strict Mode runs useEffect twice in development
 * - Causes duplicate API calls, double initialization, etc.
 *
 * Solution:
 * - Uses useRef to track if effect has run
 * - Prevents duplicate execution even with Strict Mode
 *
 * @param effect - The effect function to run once
 * @param deps - Optional dependency array (default: [])
 *
 * @example
 * ```typescript
 * // Run once on mount (no dependencies)
 * useOnce(() => {
 *   console.log('This runs only once');
 *   fetchData();
 * });
 *
 * // Run once when dependency changes
 * useOnce(() => {
 *   fetchUser(userId);
 * }, [userId]);
 * ```
 *
 * Note:
 * - For cleanup, return a function from the effect
 * - The effect runs only once per unique dependency combination
 */
export function useOnce(effect: () => void | (() => void), deps: DependencyList = []) {
  const hasRun = useRef(false);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    // Skip if already run
    if (hasRun.current) {
      return;
    }

    // Mark as run and execute effect
    hasRun.current = true;
    cleanupRef.current = effect();

    // Cleanup function
    return () => {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * useOnceAsync - Hook to run async effect only once
 *
 * @param effect - Async effect function
 * @param deps - Optional dependency array
 *
 * @example
 * ```typescript
 * useOnceAsync(async () => {
 *   const data = await fetchData();
 *   setState(data);
 * });
 * ```
 */
export function useOnceAsync(
  effect: () => Promise<void | (() => void)>,
  deps: DependencyList = []
) {
  const hasRun = useRef(false);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    // Skip if already run
    if (hasRun.current) {
      return;
    }

    // Mark as run and execute async effect
    hasRun.current = true;

    effect().then((cleanup) => {
      cleanupRef.current = cleanup;
    });

    // Cleanup function
    return () => {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
