'use client'

import Image from 'next/image'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { EditorialIcon } from '@/lib/icons'

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = { of: 'of', close: 'Close', prev: 'Previous', next: 'Next' }

export type GalleryItem = {
  src: string
  caption: string
}

const GalleryContext = createContext<{
  items: GalleryItem[]
  openAt: (src: string) => void
} | null>(null)

function useGallery() {
  const value = useContext(GalleryContext)
  if (!value) throw new Error('GalleryPhoto must be used inside ProjectGallery')
  return value
}

export function ProjectGallery({ items, children }: { items: GalleryItem[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null)

  const openAt = useCallback(
    (src: string) => {
      const next = items.findIndex((item) => item.src === src)
      if (next >= 0) setIndex(next)
    },
    [items],
  )

  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (delta: number) => {
      setIndex((current) => {
        if (current === null || !items.length) return current
        return (current + delta + items.length) % items.length
      })
    },
    [items.length],
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [index, close, step])

  const value = useMemo(() => ({ items, openAt }), [items, openAt])
  const active = index === null ? null : items[index]

  return (
    <GalleryContext.Provider value={value}>
      {children}
      {active && index !== null ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 text-surface"
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-cta">
              {String(index + 1).padStart(2, '0')} {copy.of} {String(items.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-surface hover:text-cta"
            >
              {copy.close}
              <EditorialIcon name="close" className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              src={active.src}
              alt={active.caption}
              fill
              sizes="100vw"
              quality={92}
              priority
              className="object-contain p-12 sm:p-16"
            />
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-surface hover:text-cta sm:left-4"
              aria-label={copy.prev}
            >
              <EditorialIcon name="chevron-left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-surface hover:text-cta sm:right-4"
              aria-label={copy.next}
            >
              <EditorialIcon name="chevron-right" className="h-5 w-5" />
            </button>
          </div>

          <p className="px-5 pb-6 text-center text-[10.5px] uppercase tracking-[0.2em] text-muted sm:px-8">
            {active.caption}
          </p>
        </div>
      ) : null}
    </GalleryContext.Provider>
  )
}

export function GalleryPhoto({
  src,
  alt,
  sizes,
  ratio,
  priority = false,
}: {
  src: string
  alt: string
  sizes: string
  ratio: string
  priority?: boolean
}) {
  const { openAt } = useGallery()

  return (
    <button
      type="button"
      onClick={() => openAt(src)}
      className={`relative block min-w-0 w-full cursor-zoom-in overflow-hidden bg-hairline ${ratio}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={90}
        className="object-cover object-center"
      />
    </button>
  )
}
