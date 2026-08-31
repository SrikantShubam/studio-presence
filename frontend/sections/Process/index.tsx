'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeRoleClass, localeTextClass, publicLocaleFromSite, type PublicLocale } from '@/lib/i18n-client'
import { ClipLine } from '@/lib/motion'

const ease = [0.22, 1, 0.36, 1] as const

function StepLine({
  children,
  className,
  delay,
  show,
}: {
  children: ReactNode
  className?: string
  delay: number
  show: boolean
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={reduce || show ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease, delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

function ProcessStep({
  title,
  body,
  duration,
  index,
  locale,
}: {
  title: string
  body: string
  duration?: string
  index: number
  locale: PublicLocale
}) {
  const ref = useRef<HTMLElement>(null)
  const show = useInView(ref, { once: true, amount: 0.55, margin: '-8% 0px -12% 0px' })
  const isLeft = index % 2 === 0

  return (
    <article ref={ref} className="grid min-w-0 md:grid-cols-2">
      <div
        className={`min-w-0 pb-[52px] pl-[34px] md:pb-20 md:pl-0 ${
          isLeft ? 'md:col-start-1 md:pr-[clamp(28px,5vw,70px)] md:text-right' : 'md:col-start-2 md:pl-[clamp(28px,5vw,70px)]'
        }`}
      >
        <StepLine show={show} delay={0}>
          <span
            aria-hidden
            className="block select-none font-display text-[clamp(64px,8vw,96px)] font-light leading-[0.9] text-transparent [-webkit-text-stroke:1px_var(--t-hairline)]"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </StepLine>
        <StepLine show={show} delay={0.12}>
          <h3 className={`m-0 mt-3 break-words font-display text-[clamp(24px,2.6vw,32px)] font-normal leading-tight ${localeTextClass(locale, 'uppercase')}`}>
            {title}
          </h3>
        </StepLine>
        <StepLine show={show} delay={0.24}>
          <p className={`ai-type-process-body m-0 mt-3 inline-block max-w-[440px] leading-[1.75] text-muted md:text-justify ${localeRoleClass(locale, 'body')}`}>
            {body}
          </p>
        </StepLine>
        {duration ? (
          <StepLine show={show} delay={0.36}>
            <p className={`ai-type-process-body m-0 mt-3 break-words font-medium text-accent ${localeRoleClass(locale, 'meta')}`}>
              {duration}
            </p>
          </StepLine>
        ) : null}
      </div>
    </article>
  )
}

export function Process({ config, site }: SectionComponentProps<'process'>) {
  const locale = publicLocaleFromSite(site)
  const title = chromeCopy[locale].process.title

  if (!config?.enabled || !config.steps?.length) return null

  return (
    <section
      id="process"
      className="border-t border-accent bg-surface px-5 py-[clamp(64px,9vw,120px)] text-ink sm:px-8 lg:px-16"
    >
      <h2 className={`m-0 mb-[clamp(48px,7vw,90px)] font-display text-[clamp(46px,9vw,112px)] font-light leading-[0.95] ${localeRoleClass(locale, 'sectionTitle')}`}>
        <ClipLine>{title.lead}</ClipLine>
        <ClipLine className="pl-[0.55em] text-accent" delay={0.08}>{title.accent}</ClipLine>
      </h2>

      <div className="relative mx-auto max-w-[1120px] before:absolute before:bottom-0 before:left-1.5 before:top-0 before:w-px before:bg-accent md:before:left-1/2">
        {config.steps.map((step, index) => (
          <ProcessStep
            key={`${step.title}-${index}`}
            index={index}
            title={step.title}
            body={step.body}
            duration={step.duration}
            locale={locale}
          />
        ))}
      </div>
    </section>
  )
}
