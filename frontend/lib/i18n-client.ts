export type PublicLocale = 'en' | 'hi'

export function localeHref(href: string, locale: PublicLocale): string {
  if (locale === 'en') return href === '/hi' ? '/' : href.replace(/^\/hi(?=\/|$)/, '') || '/'
  if (href === '/') return '/hi'
  if (href.startsWith('/hi/')) return href
  if (href === '/hi') return href
  return `/hi${href.startsWith('/') ? href : `/${href}`}`
}

export function publicLocaleFromSite(site: { i18n?: { defaultLocale?: string } }): PublicLocale {
  return site.i18n?.defaultLocale === 'hi' ? 'hi' : 'en'
}

export function isHindi(locale: PublicLocale): boolean {
  return locale === 'hi'
}

export function localeTextClass(locale: PublicLocale, latinTracking = 'uppercase tracking-[0.18em]'): string {
  return locale === 'hi' ? 'tracking-normal' : latinTracking
}

export const chromeCopy = {
  en: {
    nav: {
      home: 'HOME',
      services: 'SERVICES',
      about: 'ABOUT',
      portfolio: 'PORTFOLIO',
      contact: 'CONTACT',
      openServices: 'Open services menu',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      languageLabel: 'Hindi',
      languageShort: 'HI',
    },
    services: {
      titleLead: 'Our',
      titleAccent: 'Services',
      readMore: 'Read more',
      estimate: 'Calculate the estimate',
    },
    quickActions: {
      whatsapp: 'WHATSAPP',
      call: 'CALL',
      directions: 'DIRECTIONS',
      instagram: 'INSTAGRAM',
      fastestReply: 'FASTEST REPLY',
    },
    portfolio: {
      titleLead: 'Our',
      titleAccent: 'Portfolio',
      eyebrowLabel: 'Completed sites,',
      viewAll: 'VIEW ALL PROJECTS',
      viewMore: 'View more',
      showing: 'Showing',
      of: 'of',
      projectsWord: 'projects',
      loadMore: 'Show 12 more',
      filters: {
        all: 'All',
        residential: 'Residential',
        commercial: 'Commercial',
        hospitality: 'Hospitality',
        retail: 'Retail',
      },
      listingCta: {
        eyebrow: ['Seen something', 'close to yours?'],
        titleLead: 'Start',
        titleAccent: 'Your own',
        action: 'Calculate the estimate',
      },
      detail: {
        selected: 'Selected work,',
        caseStudy: 'Case study',
        number: 'No.',
        back: 'All projects',
        meta: {
          location: 'location',
          roomType: 'room type',
          budget: 'budget range',
          duration: 'duration',
        },
        briefLead: 'The',
        briefAccent: 'Brief',
        approachLead: 'Our',
        approachAccent: 'Approach',
        outcomeLead: 'The',
        outcomeAccent: 'Outcome',
        ctaEyebrow: ['Same flat size?', 'Similar budget?'],
        ctaTitleLead: 'Start',
        ctaTitleAccent: 'Your own',
        ctaAction: 'Discuss your project on WhatsApp',
        previous: 'Previous project',
        next: 'Next project',
        galleryOf: 'of',
      },
    },
  },
  hi: {
    nav: {
      home: 'होम',
      services: 'सेवाएं',
      about: 'परिचय',
      portfolio: 'पोर्टफोलियो',
      contact: 'संपर्क',
      openServices: 'सेवाओं का मेन्यू खोलें',
      openMenu: 'मेन्यू खोलें',
      closeMenu: 'मेन्यू बंद करें',
      languageLabel: 'English',
      languageShort: 'EN',
    },
    services: {
      titleLead: 'हमारी',
      titleAccent: 'सेवाएं',
      readMore: 'और जानें',
      estimate: 'अनुमान निकालें',
    },
    quickActions: {
      whatsapp: 'व्हाट्सऐप',
      call: 'कॉल',
      directions: 'दिशा',
      instagram: 'इंस्टाग्राम',
      fastestReply: 'सबसे तेज जवाब',
    },
    portfolio: {
      titleLead: 'हमारा',
      titleAccent: 'पोर्टफोलियो',
      eyebrowLabel: 'पूरी हुई साइटें,',
      viewAll: 'सभी प्रोजेक्ट देखें',
      viewMore: 'और देखें',
      showing: 'दिखा रहे हैं',
      of: 'में से',
      projectsWord: 'प्रोजेक्ट',
      loadMore: '12 और दिखाएं',
      filters: {
        all: 'सभी',
        residential: 'घर',
        commercial: 'कमर्शियल',
        hospitality: 'हॉस्पिटैलिटी',
        retail: 'रिटेल',
      },
      listingCta: {
        eyebrow: ['ऐसा काम देखा?', 'अपने घर से मिलता-जुलता?'],
        titleLead: 'शुरू करें',
        titleAccent: 'अपना प्रोजेक्ट',
        action: 'अनुमान निकालें',
      },
      detail: {
        selected: 'चुना हुआ काम,',
        caseStudy: 'केस स्टडी',
        number: 'नं.',
        back: 'सभी प्रोजेक्ट',
        meta: {
          location: 'स्थान',
          roomType: 'प्रोजेक्ट प्रकार',
          budget: 'बजट रेंज',
          duration: 'समय',
        },
        briefLead: 'प्रोजेक्ट',
        briefAccent: 'ब्रीफ',
        approachLead: 'हमारा',
        approachAccent: 'तरीका',
        outcomeLead: 'अंतिम',
        outcomeAccent: 'नतीजा',
        ctaEyebrow: ['ऐसा ही घर?', 'मिलता-जुलता बजट?'],
        ctaTitleLead: 'शुरू करें',
        ctaTitleAccent: 'अपना काम',
        ctaAction: 'WhatsApp पर बात करें',
        previous: 'पिछला प्रोजेक्ट',
        next: 'अगला प्रोजेक्ट',
        galleryOf: 'में से',
      },
    },
  },
} as const
