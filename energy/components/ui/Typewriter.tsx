'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function Typewriter({ text, className = "", delay = 0 }: TypewriterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const characters = Array.from(text);

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      style={{ display: "inline-block", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
