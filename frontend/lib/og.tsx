import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ReactElement } from 'react'
import { ImageResponse } from 'next/og'
import { loadPublicClientConfig } from '@studio/backend'
import type { ClientConfig } from '@studio/backend'
import { getTokenSet } from '@/lib/tokens'

export const ogSize = { width: 1200, height: 630 }

async function fileDataUrl(publicPath: string | undefined): Promise<string | undefined> {
  if (!publicPath?.startsWith('/')) return undefined
  try {
    const bytes = await readFile(join(process.cwd(), 'public', publicPath.slice(1)))
    const ext = publicPath.split('.').pop()?.toLowerCase()
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    return `data:${mime};base64,${bytes.toString('base64')}`
  } catch {
    return undefined
  }
}

function splitName(name: string): { lead: string; rest: string } {
  const parts = name.trim().toUpperCase().split(/\s+/).filter(Boolean)
  return { lead: parts[0] ?? name.toUpperCase(), rest: parts.slice(1).join(' ') }
}

function inkAlpha(ink: string, alpha: number): string {
  const hex = ink.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export async function homePhoto(site: ClientConfig) {
  return (await fileDataUrl(site.sections.hero?.image)) ?? (await fileDataUrl(site.brand.ogImage))
}

export function OgHomeCard({ site, photo }: { site: ClientConfig; photo?: string }) {
  const colors = getTokenSet(site.template).colors
  const { lead, rest } = splitName(site.business.name)
  const city = site.business.address.city?.toUpperCase()
  const founded = site.business.yearFounded

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        background: colors.ink,
        color: colors.surface,
        fontFamily: 'Archivo',
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          width={1200}
          height={630}
          style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          background: `linear-gradient(90deg, ${inkAlpha(colors.ink, 0.9)} 0%, ${inkAlpha(colors.ink, 0.78)} 42%, ${inkAlpha(colors.ink, 0.12)} 78%, ${inkAlpha(colors.ink, 0)} 100%)`,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 80,
          top: 96,
          width: 700,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 96,
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>{lead}</div>
          {rest ? <div style={{ display: 'flex' }}>{rest}</div> : null}
        </div>
        <div style={{ display: 'flex', width: 120, height: 4, marginTop: 38, background: colors.cta }} />
        <div style={{ display: 'flex', marginTop: 34, fontSize: 30, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {`INTERIOR DESIGN${city ? ` · ${city}` : ''}`}
        </div>
      </div>
      {founded ? (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 80,
            bottom: 76,
            fontSize: 24,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          {`EST. ${founded}`}
        </div>
      ) : null}
    </div>
  )
}

export async function projectPhoto(site: ClientConfig, image?: string) {
  return (await fileDataUrl(image)) ?? (await homePhoto(site))
}

export function OgProjectCard({
  site,
  title,
  meta,
  photo,
}: {
  site: ClientConfig
  title: string
  meta: string
  photo?: string
}) {
  const colors = getTokenSet(site.template).colors

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        background: colors.ink,
        color: colors.surface,
        fontFamily: 'Archivo',
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          width={1200}
          height={630}
          style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          background: `linear-gradient(180deg, ${inkAlpha(colors.ink, 0.55)} 0%, ${inkAlpha(colors.ink, 0.1)} 26%, ${inkAlpha(colors.ink, 0.1)} 46%, ${inkAlpha(colors.ink, 0.88)} 100%)`,
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 80,
          top: 72,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
        }}
      >
        {site.business.name.toUpperCase()}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 80,
          bottom: 80,
          width: 1040,
        }}
      >
        <div
          style={{
            display: 'flex',
            maxWidth: 900,
            fontSize: 78,
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', width: 120, height: 4, marginTop: 34, background: colors.cta }} />
        {meta ? (
          <div style={{ display: 'flex', marginTop: 30, fontSize: 28, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function OgEstimateCard({ site }: { site: ClientConfig }) {
  const colors = getTokenSet(site.template).colors

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        background: colors.ink,
        color: colors.surface,
        fontFamily: 'Archivo',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: 64,
          top: 40,
          fontSize: 300,
          fontWeight: 300,
          lineHeight: 0.8,
          letterSpacing: '-0.04em',
          color: inkAlpha(colors.surface, 0.13),
        }}
      >
        Rs
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 80,
          top: 104,
          width: 920,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 84,
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>CALCULATE YOUR</div>
          <div style={{ display: 'flex', marginLeft: 46, color: colors.cta }}>INTERIOR ESTIMATE</div>
        </div>
        <div style={{ display: 'flex', width: 120, height: 4, marginTop: 44, background: colors.cta }} />
        <div
          style={{
            display: 'flex',
            marginTop: 34,
            fontSize: 28,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.86,
          }}
        >
          THREE INPUTS · HONEST RANGE
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 80,
          bottom: 76,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
        }}
      >
        {site.business.name.toUpperCase()}
      </div>
    </div>
  )
}

export async function ogFonts() {
  try {
    // Satori (ImageResponse) only accepts TTF/OTF — not the site's woff2 files.
    const data = await readFile(join(process.cwd(), 'public/fonts/archivo/archivo-og.ttf'))
    return [{ name: 'Archivo', data, style: 'normal' as const, weight: 400 as const }]
  } catch {
    return undefined
  }
}

async function renderOg(element: ReactElement) {
  const fonts = await ogFonts()
  try {
    return new ImageResponse(element, { ...ogSize, fonts })
  } catch {
    return new ImageResponse(element, ogSize)
  }
}

export async function homeOgResponse(tenant: string) {
  const site = await loadPublicClientConfig(tenant)
  const photo = await homePhoto(site)
  return renderOg(<OgHomeCard site={site} photo={photo} />)
}

export async function estimateOgResponse(tenant: string) {
  const site = await loadPublicClientConfig(tenant)
  return renderOg(<OgEstimateCard site={site} />)
}

export async function projectOgResponse(tenant: string, slug: string) {
  const site = await loadPublicClientConfig(tenant)
  const project = site.sections.portfolio.projects.find((item) => item.slug === slug)
  const meta = [project?.location, project?.duration].filter(Boolean).join(' · ')
  const photo = await projectPhoto(site, project?.cover)
  return renderOg(<OgProjectCard site={site} title={project?.title ?? slug} meta={meta} photo={photo} />)
}
