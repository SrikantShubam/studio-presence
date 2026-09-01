'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { ClientConfig } from '@studio/backend'
import { chromeCopy, localeRoleClass, localeTextClass, type PublicLocale } from '@/lib/i18n-client'
import { ClipLine, FadeUpItem, Stagger } from '@/lib/motion'

const pagePad = 'px-[clamp(20px,5vw,64px)]'

type FaqItem = NonNullable<ClientConfig['sections']['services']>['items'][number]['faq'][number]

export function ServiceFaq({ faq, locale }: { faq: FaqItem[]; locale: PublicLocale }) {
  const [open, setOpen] = useState<number | null>(null)
  const title = chromeCopy[locale].serviceFaq.title

  return (
    <section className={`${pagePad} border-t border-accent bg-panel py-[clamp(64px,9vw,110px)]`}>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,88px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <h2 className={`m-0 font-display text-[clamp(36px,6vw,80px)] font-light leading-[0.95] text-ink ${localeRoleClass(locale, 'sectionTitle')}`}>
          <ClipLine>
            {title.lead} <span className="text-accent">{title.accent}</span>
          </ClipLine>
        </h2>
        <Stagger className="min-w-0">
          {faq.map((item, index) => {
            const isOpen = open === index
            return (
              <FadeUpItem key={item.q} className="border-b border-accent">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center justify-between gap-6 bg-transparent py-[clamp(20px,2.4vw,30px)] text-left text-ink"
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className={`min-w-0 break-words font-normal ${locale === 'hi' ? 'text-[clamp(20px,2.15vw,26px)] leading-[1.45]' : 'text-[clamp(17px,1.8vw,22px)]'} ${localeTextClass(locale, 'uppercase tracking-[0.01em]')}`}>
                    {item.q}
                  </span>
                  <span aria-hidden className="shrink-0 text-2xl font-light leading-none text-accent">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className={`m-0 pb-[clamp(20px,2.4vw,30px)] pr-[clamp(0px,8vw,90px)] text-pretty text-justify leading-[1.75] text-body ${localeRoleClass(locale, 'body')}`}>
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
