'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function HeroCategoryPiano({ label, index }: { label: string; index: number }) {
  const reduce = useReducedMotion()

  return (
    <motion.h5
      className="ai-heading-reset m-0 cursor-default transition-colors duration-200 hover:text-cta"
      animate={reduce ? undefined : { y: [0, 4, 0] }}
      transition={reduce ? undefined : { delay: index * 0.24, duration: 0.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
    >
      {label}
    </motion.h5>
  )
}
