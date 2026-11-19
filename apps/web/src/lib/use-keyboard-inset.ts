import { useEffect } from 'react';

const KEYBOARD_INSET_PROPERTY = '--keyboard-inset';

/**
 * Publishes how much of the layout viewport the on-screen keyboard covers as the CSS variable
 * `--keyboard-inset` on the root element, so an element stuck to the bottom can stay above
 * the keyboard. Browsers that shrink the layout viewport for the keyboard report zero.
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      root.style.setProperty(KEYBOARD_INSET_PROPERTY, `${Math.max(0, covered)}px`);
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.style.removeProperty(KEYBOARD_INSET_PROPERTY);
    };
  }, []);
}
