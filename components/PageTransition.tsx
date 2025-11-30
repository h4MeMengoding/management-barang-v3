'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.2, 
          ease: [0.4, 0, 0.2, 1] // cubic-bezier for smooth easing
        }}
        style={{ willChange: 'opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Card animation component
export function AnimatedCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay, 
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
export function StaggerContainer({ children, staggerDelay = 0.05 }: { children: ReactNode; staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger item
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}

// Scale on hover
export function ScaleOnHover({ children, scale = 1.02 }: { children: ReactNode; scale?: number }) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ 
        duration: 0.15, 
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}

// Fade in
export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{ willChange: 'opacity' }}
    >
      {children}
    </motion.div>
  );
}
