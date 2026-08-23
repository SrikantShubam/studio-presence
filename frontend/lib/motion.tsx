'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
}

export function HomeSection({
  children,
  first = false,
}: {
  children: ReactNode
  first?: boolean
}) {
  const reduce = useReducedMotion()

  if (first) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.85, ease }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '80px 0px' }}
      transition={{ duration: 0.8, ease }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className,
  delay = 0,
  ...rest
}: {
  children: ReactNode
  className?: string
  delay?: number
} & Record<string, unknown>) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.08, margin: '80px 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '80px 0px' }}
      transition={{ duration: 0.65, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

export function FadeUpItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '80px 0px' }}
      transition={{ duration: 0.65, ease }}
    >
      {children}
    </motion.div>
  )
}

/** Child of `Stagger` — waits for the parent so items actually sequence. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}

/** Photo wipe + settle. Wrap a fill `Image` inside an overflow-hidden frame. */
export function RevealImage({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2, margin: '120px 0px' })
  const show = Boolean(reduce || inView)

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className ?? ''}`}>
      <motion.div
        className="absolute inset-0 origin-center"
        initial={reduce ? false : { y: '108%', scale: 1.08 }}
        animate={{ y: show ? '0%' : '108%', scale: show ? 1 : 1.08 }}
        transition={{ duration: 1.05, ease, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function DrawFrame({
  className,
  delay = 0.18,
}: {
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.span
      aria-hidden
      className={className}
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3, margin: '80px 0px' }}
      transition={{ duration: 0.7, ease, delay }}
    />
  )
}

export function ClipLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2, margin: '120px 0px' })
  const show = Boolean(reduce || inView)

  return (
    <span ref={ref} className={`block overflow-hidden ${className ?? ''}`}>
      <motion.span
        className="block"
        initial={reduce ? false : { y: '108%' }}
        animate={{ y: show ? '0%' : '108%' }}
        transition={{ duration: 0.75, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}
