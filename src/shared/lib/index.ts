// Re-export all utils
export * from './utils';

// ========================================
// Focus Ring Styles
// ========================================
export const focusRings = {
  button: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  input: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
  card: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
  link: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
};

// ========================================
// Animation Presets
// ========================================
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

// ========================================
// Transition Presets
// ========================================
export const transitions = {
  fast: { duration: 0.15, ease: [0.32, 0.72, 0, 1] },
  medium: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
  slow: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springFast: { type: 'spring' as const, stiffness: 400, damping: 25 },
};

