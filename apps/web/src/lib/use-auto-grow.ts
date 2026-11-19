import { useCallback, useEffect, useLayoutEffect, type RefObject } from 'react';

/** The share of the visible viewport a growing text field may take before it scrolls inside. */
export const AUTO_GROW_MAX_VIEWPORT_SHARE = 0.4;

/**
 * Lets a textarea grow with its text, from its `rows` up to a share of the visible viewport,
 * then scroll inside. It re-measures when the text changes and when the viewport resizes, e.g.
 * when the on-screen keyboard opens.
 */
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string): void {
  const measure = useCallback(() => {
    const field = ref.current;
    if (!field) return;
    // Back to the height of `rows`, so the content's own height can be read.
    field.style.height = '';
    // A field that is not laid out (hidden) has no height to follow.
    if (field.scrollHeight === 0) return;
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    const max = viewport * AUTO_GROW_MAX_VIEWPORT_SHARE;
    const overflows = field.scrollHeight > max;
    field.style.height = `${overflows ? max : field.scrollHeight}px`;
    field.style.overflowY = overflows ? 'auto' : 'hidden';
  }, [ref]);

  useLayoutEffect(measure, [measure, value]);

  useEffect(() => {
    const viewport = window.visualViewport ?? window;
    viewport.addEventListener('resize', measure);
    return () => viewport.removeEventListener('resize', measure);
  }, [measure]);
}
