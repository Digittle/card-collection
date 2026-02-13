import { Variants, Transition } from "framer-motion";

export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 300, damping: 25 };
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 400, damping: 20 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 22 };
export const EASE_SMOOTH = [0.23, 1, 0.32, 1] as const;

// Page enter variants
export const pageEnter: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};
export const pageTransition: Transition = { duration: 0.45, ease: [...EASE_SMOOTH] };

// Card expand (thumbnail→detail feel)
export const cardExpand: Variants = {
  initial: { opacity: 0, scale: 0.85, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
};

// Staggered grid
export const gridContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
export const gridItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Countdown numbers
export const countdownNumber: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.8 },
};

// Toast slide-in
export const toastSlideIn: Variants = {
  initial: { opacity: 0, x: 60, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 80, scale: 0.9 },
};

// Avatar entry
export const avatarEnter: Variants = {
  initial: { opacity: 0, x: 20, scale: 0.8 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.6 },
};

// Counter tick
export const counterTick: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Celebration particle factory
export const celebrationParticle = (angle: number, distance: number, delay: number) => ({
  initial: { x: 0, y: 0, opacity: 0, scale: 0 },
  animate: {
    x: Math.cos((angle * Math.PI) / 180) * distance,
    y: Math.sin((angle * Math.PI) / 180) * distance - 40,
    opacity: [0, 1, 1, 0.8, 0],
    scale: [0, 1.2, 1, 0.6, 0],
    rotate: Math.random() * 360,
  },
  transition: { duration: 1.4, delay, ease: "easeOut" as const },
});
