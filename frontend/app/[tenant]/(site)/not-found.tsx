import type { Metadata } from 'next'
import { NotFoundView } from './NotFoundView'

export const metadata: Metadata = {
  title: 'Nothing built here',
  description: 'This page is not on the site.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Nothing built here',
    description: 'This page is not on the site.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nothing built here',
    images: ['/opengraph-image'],
  },
}

export default function SiteNotFound() {
  return <NotFoundView />
}
