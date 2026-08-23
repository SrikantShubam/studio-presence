'use client'

import { useMemo, useState } from 'react'
import type { ClientConfig } from '@studio/backend'
import { localeTextClass, type PublicLocale } from '@/lib/i18n-client'
import { EditorialIcon } from '@/lib/icons'
import { formatInrRange } from '@/lib/currency'

type Estimate = NonNullable<ClientConfig['sections']['estimate']>

const copy = {
  en: {
    areaTitle: 'Carpet area',
    homeTitle: 'Home type',
    finishTitle: 'Finish level',
    sqFt: 'sq ft',
    finishWord: 'finish',
    messagePrefix: 'Indicative range',
    result: {
      eyebrow: 'Indicative estimate',
      rate: 'Rate applied',
      duration: 'Typical duration',
      supervision: 'Site supervision',
      supervisionValue: 'Included',
      perSqft: '/ sq ft',
      whatsapp: 'Get an exact quote on WhatsApp',
      orCall: 'Or call the studio directly —',
    },
  },
  hi: {
    areaTitle: 'कार्पेट एरिया',
    homeTitle: 'घर का प्रकार',
    finishTitle: 'फिनिश लेवल',
    sqFt: 'वर्ग फुट',
    finishWord: 'फिनिश',
    messagePrefix: 'अनुमानित रेंज',
    result: {
      eyebrow: 'अनुमानित खर्च',
      rate: 'लागू दर',
      duration: 'सामान्य समय',
      supervision: 'साइट सुपरविजन',
      supervisionValue: 'शामिल',
      perSqft: '/ वर्ग फुट',
      whatsapp: 'WhatsApp पर सही कोट लें',
      orCall: 'या सीधे स्टूडियो को कॉल करें —',
    },
  },
}

function whatsappHref(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function EstimateCalc({ estimate, phone, hours, locale = 'en' }: { estimate: Estimate; phone: string; hours?: string; locale?: PublicLocale }) {
  const rates = estimate.ratePerSqft
  const text = copy[locale]
  const homeTypes = estimate.homeTypes
  const finishLevels = estimate.finishLevels
  const area = estimate.area

  const [areaValue, setAreaValue] = useState(area?.default ?? area?.min ?? 1000)
  const [homeId, setHomeId] = useState(homeTypes[Math.floor(homeTypes.length / 2)]?.id)
  const [finishId, setFinishId] = useState(finishLevels[Math.min(1, finishLevels.length - 1)]?.id)

  const home = homeTypes.find((item) => item.id === homeId) ?? homeTypes[0]
  const finish = finishLevels.find((item) => item.id === finishId) ?? finishLevels[0]

  const { low, high, rateLow, rateHigh } = useMemo(() => {
    if (!rates || !home || !finish) return { low: 0, high: 0, rateLow: 0, rateHigh: 0 }
    const base = rates[finish.id as 'basic' | 'standard' | 'premium'] ?? rates.standard
    const rateLow = Math.round(base * (finish.low ?? 1) * home.factor)
    const rateHigh = Math.round(base * (finish.high ?? 1) * home.factor)
    return { low: areaValue * rateLow, high: areaValue * rateHigh, rateLow, rateHigh }
  }, [areaValue, rates, finish, home])

  if (!rates || !area || !homeTypes.length || !finishLevels.length || !home || !finish) return null

  const rangeLabel = formatInrRange(low, high)
  const areaLabel = areaValue.toLocaleString('en-IN')
  const summary = `${home.label} · ${areaLabel} ${text.sqFt} · ${finish.label} ${text.finishWord}`
  const rateLabel = `₹${rateLow.toLocaleString('en-IN')} – ${rateHigh.toLocaleString('en-IN')} ${text.result.perSqft}`
  const message = `${summary}. ${text.messagePrefix} ${rangeLabel}.`
  const wa = whatsappHref(phone, message)

  return (
    <div className="grid grid-cols-1 border border-accent min-[1080px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="grid content-start gap-[clamp(40px,5vw,64px)] border-b border-accent p-[clamp(28px,4vw,56px)] min-[1080px]:border-b-0 min-[1080px]:border-r">
        <div className="flex items-start gap-[clamp(16px,2.4vw,28px)]">
          <span className="shrink-0 font-display text-[clamp(38px,4.4vw,60px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
            01
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className={`m-0 text-[clamp(15px,1.7vw,19px)] font-normal ${localeTextClass(locale, 'uppercase tracking-[0.06em]')}`}>{text.areaTitle}</h2>
              <span className="text-[clamp(24px,3vw,38px)] font-normal leading-none tracking-[-0.02em]">
                {areaLabel} <span className={`text-[11px] font-medium text-accent ${localeTextClass(locale, 'tracking-[0.2em]')}`}>{text.sqFt}</span>
              </span>
            </div>
            <div className="mt-[clamp(24px,3vw,34px)]">
              <input
                type="range"
                min={area.min}
                max={area.max}
                step={area.step ?? 10}
                value={areaValue}
                aria-label={text.areaTitle}
                onChange={(event) => setAreaValue(Number(event.target.value))}
                className="h-px w-full cursor-grab appearance-none bg-ink accent-ink [&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-ink"
              />
              <div className={`mt-3.5 flex justify-between text-[10.5px] text-muted ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}>
                <span>{area.min.toLocaleString('en-IN')}</span>
                <span>{area.max.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-[clamp(16px,2.4vw,28px)] border-t border-hairline pt-[clamp(28px,3.5vw,40px)]">
          <span className="shrink-0 font-display text-[clamp(38px,4.4vw,60px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
            02
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={`m-0 text-[clamp(15px,1.7vw,19px)] font-normal ${localeTextClass(locale, 'uppercase tracking-[0.06em]')}`}>{text.homeTitle}</h2>
            <div className="mt-[clamp(20px,2.6vw,28px)] grid grid-cols-2 gap-2.5 min-[720px]:grid-cols-4">
              {homeTypes.map((item) => {
                const active = item.id === home.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHomeId(item.id)}
                    className={`min-h-11 px-2 py-[18px] text-[clamp(11px,1.2vw,13px)] font-medium ${localeTextClass(locale, 'uppercase tracking-[0.12em]')} ${
                      active ? 'border border-ink bg-ink text-surface' : 'border border-hairline bg-transparent text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-[clamp(16px,2.4vw,28px)] border-t border-hairline pt-[clamp(28px,3.5vw,40px)]">
          <span className="shrink-0 font-display text-[clamp(38px,4.4vw,60px)] font-light leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
            03
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={`m-0 text-[clamp(15px,1.7vw,19px)] font-normal ${localeTextClass(locale, 'uppercase tracking-[0.06em]')}`}>{text.finishTitle}</h2>
            <div className="mt-[clamp(20px,2.6vw,28px)] grid grid-cols-1 gap-2.5 min-[720px]:grid-cols-3">
              {finishLevels.map((item) => {
                const active = item.id === finish.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFinishId(item.id)}
                    className={`grid gap-2 px-4 py-[18px] text-left ${
                      active ? 'border border-ink bg-ink text-surface' : 'border border-hairline bg-transparent text-ink'
                    }`}
                  >
                    <span className={`text-[clamp(12px,1.3vw,14px)] font-medium ${localeTextClass(locale, 'uppercase tracking-[0.14em]')}`}>{item.label}</span>
                    {item.note && <span className={`text-[11px] leading-normal ${active ? 'text-surface/70' : 'text-muted'}`}>{item.note}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid content-start gap-[clamp(28px,3.5vw,44px)] bg-panel p-[clamp(28px,4vw,56px)]">
        <div className="grid gap-3.5">
          <span className={`text-[10.5px] font-medium text-accent ${localeTextClass(locale, 'uppercase tracking-[0.24em]')}`}>{text.result.eyebrow}</span>
          <span className="font-display text-[clamp(34px,5.4vw,72px)] font-light leading-[0.95] tracking-[-0.035em]">{rangeLabel}</span>
          <span className={`text-[11px] text-muted ${localeTextClass(locale, 'uppercase tracking-[0.16em]')}`}>{summary}</span>
        </div>
        <div className="grid gap-4 border-t border-accent pt-[clamp(24px,3vw,32px)] text-[13.5px] text-body">
          <div className="flex justify-between gap-4">
            <span>{text.result.rate}</span>
            <span className="text-ink">{rateLabel}</span>
          </div>
          {finish.weeks && (
            <div className="flex justify-between gap-4">
              <span>{text.result.duration}</span>
              <span className="text-ink">{finish.weeks}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span>{text.result.supervision}</span>
            <span className="text-ink">{text.result.supervisionValue}</span>
          </div>
        </div>
        {estimate.resultNote && <p className="m-0 text-pretty text-[13px] leading-[1.7] text-body">{estimate.resultNote}</p>}
        {wa ? (
          <a
            href={wa}
            className={`inline-flex min-h-11 items-center justify-between gap-3.5 bg-cta px-[30px] py-[22px] text-[clamp(10.5px,1.1vw,12px)] font-medium text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-22px)_100%,0_100%)] hover:bg-ink hover:text-cta ${localeTextClass(locale, 'uppercase tracking-[0.18em]')}`}
          >
            {text.result.whatsapp}
            <EditorialIcon name="arrow-up-right" className="h-3.5 w-3.5" />
          </a>
        ) : null}
        <p className="m-0 text-xs leading-[1.6] text-muted">
          {text.result.orCall} {phone}
          {hours ? `, ${hours}` : ''}.
        </p>
      </div>
    </div>
  )
}
