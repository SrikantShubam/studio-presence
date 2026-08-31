'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeRoleClass, localeTextClass, publicLocaleFromSite } from '@/lib/i18n-client'
import { FadeUpItem, Stagger } from '@/lib/motion'

export function FAQ({ config, site }: SectionComponentProps<'faq'>) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const locale = publicLocaleFromSite(site)
  const title = chromeCopy[locale].faq.title

  if (!config?.enabled || !config.items?.length) return null

  return (
    <section
      id="faq"
      className="border-t border-accent bg-surface px-5 py-[clamp(64px,9vw,120px)] text-ink sm:px-8 lg:px-16"
    >
      <div className="grid items-start gap-[clamp(36px,7vw,96px)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <h2 className={`m-0 max-w-md font-display text-[clamp(42px,7.5vw,92px)] font-light leading-[0.95] text-ink ${localeRoleClass(locale, 'sectionTitle')}`}>
          <span className="block">
            {title.lead} <span className="text-accent">{title.accent}</span>
          </span>
        </h2>

        <Stagger className="min-w-0">
          {config.items.map((item, index) => {
            const isOpen = openIndex === index
            const answerId = `faq-answer-${index}`

            return (
              <FadeUpItem key={`${item.q}-${index}`} className="border-b border-accent">
                <button
                  type="button"
                  aria-controls={answerId}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 bg-transparent py-[clamp(20px,2.4vw,30px)] text-left text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={`min-w-0 break-words text-[clamp(17px,1.9vw,23px)] font-normal ${localeTextClass(locale, 'uppercase tracking-[0.01em]')}`}>
                    {item.q}
                  </span>
                  <span aria-hidden className="shrink-0 text-2xl font-light leading-none text-accent">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={answerId}
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className={`m-0 max-w-2xl pb-[clamp(20px,2.4vw,30px)] pr-[clamp(0px,8vw,90px)] text-pretty text-justify leading-[1.75] text-body ${localeRoleClass(locale, 'body')}`}>
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </FadeUpItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
