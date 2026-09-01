import assert from 'node:assert/strict'
import {
  applyI18nOverlay,
  i18nCompletion,
  loadI18nSeed,
  validateI18nPatch,
} from '../backend/src/services/i18n'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadClientConfig } from '../backend/src/config/load'

const base = loadClientConfig('ashish-interiors')
const service = base.sections.services?.items.find((item) => item.slug === 'interior-design')
assert.ok(service, 'expected interior-design service in Ashish config')

assert.throws(
  () =>
    validateI18nPatch({
      sections: {
        services: {
          items: [{ slug: 'bad-slug', title: 'इंटीरियर डिजाइन' }],
        },
      },
    }),
  /sections\.services\.items\[0\]\.slug/,
  'Hindi overlay must reject service slug changes',
)

const overlay = validateI18nPatch({
  seo: {
    title: 'पटना में इंटीरियर डिजाइन',
    description: 'पटना के घरों के लिए हिंदी इंटीरियर डिजाइन जानकारी।',
  },
  sections: {
    hero: {
      headline: 'घर जो आपकी तरह रहता है',
      sub: 'पटना में माप, बजट और साइट की सच्चाई के साथ डिजाइन।',
    },
    services: {
      items: [
        {
          title: 'इंटीरियर डिजाइन',
          blurb: 'घर के हर कमरे के लिए स्पष्ट लेआउट, मूडबोर्ड और ड्रॉइंग।',
        },
      ],
    },
  },
})

const localized = applyI18nOverlay(base, overlay)
const localizedService = localized.sections.services?.items.find((item) => item.slug === 'interior-design')
assert.ok(localizedService, 'localized service should preserve service list')
assert.equal(localized.seo.title, 'पटना में इंटीरियर डिजाइन')
assert.equal(localized.sections.hero.headline, 'घर जो आपकी तरह रहता है')
assert.equal(localizedService.title, 'इंटीरियर डिजाइन')
assert.equal(localizedService.slug, service.slug)
assert.equal(localizedService.image, service.image)
assert.equal(localized.business.phone, base.business.phone)

const kitchen = base.sections.services?.items.find((item) => item.slug === 'modular-kitchens')
assert.ok(kitchen, 'expected modular-kitchens service in Ashish config')
const kitchenLocalized = applyI18nOverlay(base, {
  sections: {
    services: {
      items: [
        {},
        {},
        {},
        {
          intro: ['हिंदी परिचय एक', 'हिंदी परिचय दो'],
          faq: [{ q: 'हिंदी सवाल', a: 'हिंदी जवाब' }],
        },
      ],
    },
  },
})
const localizedKitchen = kitchenLocalized.sections.services?.items.find((item) => item.slug === 'modular-kitchens')
assert.ok(localizedKitchen, 'localized modular kitchen service should exist')
assert.deepEqual(
  localizedKitchen.intro,
  ['हिंदी परिचय एक', 'हिंदी परिचय दो'],
  'Hindi primitive arrays must replace the English array instead of preserving English tail items',
)
assert.equal(localizedKitchen.faq.length, 1, 'Hindi nested content arrays must not preserve English FAQ tail items')
assert.equal(localizedKitchen.faq[0]?.q, 'हिंदी सवाल')
assert.equal(localizedKitchen.slug, kitchen.slug, 'structure fields should still be preserved while content arrays truncate')

assert.doesNotThrow(
  () =>
    validateI18nPatch({
      legal: {
        dataRetentionNote: 'लीड डेटा सीमित समय तक रखा जाता है।',
        privacyPolicyDoc: {
          lead: 'हम केवल जरूरी जानकारी लेते हैं।',
          updated: 'अगस्त 2026',
          sections: [{ title: 'क्या लेते हैं', paragraphs: ['नाम और संपर्क।'], bullets: ['फोन', 'ईमेल'] }],
        },
        termsDoc: {
          lead: 'काम लिखित अनुमान से शुरू होता है।',
          updated: 'अगस्त 2026',
          sections: [{ title: 'भुगतान', paragraphs: ['किश्तों में भुगतान।'], bullets: ['एडवांस'] }],
        },
      },
      sections: {
        footer: {
          reassuranceLine: 'माप और बजट भेजें, जवाब उसी दिन मिलेगा।',
          socials: [{ label: 'इंस्टाग्राम' }],
        },
        locations: {
          offices: [
            {
              name: 'बोरिंग रोड स्टूडियो',
              address: { line1: 'दूसरी मंजिल', city: 'पटना' },
              hours: { weekday: 'सोमवार से शनिवार', note: 'अपॉइंटमेंट से आएं' },
              photo: { caption: 'स्टूडियो प्रवेश' },
              findNote: 'लैंडमार्क से बाएं मुड़ें',
              about: {
                lead: 'मुख्य स्टूडियो',
                body: ['यहीं ब्रीफ और सामग्री चर्चा होती है।'],
                stats: [{ value: '20', label: 'टीम सदस्य' }],
              },
              team: [{ name: 'आशीष', role: 'फाउंडर' }],
            },
          ],
          otherLocationsNote: 'बाकी शहरों में साइट विजिट अपॉइंटमेंट से।',
        },
        journal: {
          intro: 'ड्रॉइंग और सामग्री पर नोट्स।',
          topics: ['प्लाई', 'किचन'],
          posts: [
            {
              title: 'प्लाई कैसे चुनें',
              excerpt: 'गीले क्षेत्रों में क्या लगाएं।',
              topic: 'सामग्री',
              author: { name: 'टीम' },
              displayTitle: { lead: 'प्लाई', accent: 'चुनना' },
              body: [
                { type: 'h2', lead: 'BWP', accent: 'कहां लगाएं' },
                { type: 'p', text: 'सिंक के नीचे BWP रखें।' },
                { type: 'pullquote', text: 'गीला क्षेत्र अलग नियम मांगता है।' },
              ],
            },
          ],
        },
        news: {
          press: [
            {
              publication: 'स्थानीय पत्रिका',
              publicationShort: 'पत्रिका',
              headline: 'पटना का व्यावहारिक घर',
              quote: 'काम बजट में रहा।',
            },
          ],
          items: [
            {
              title: 'वर्कशॉप अपडेट',
              headline: 'नई कटिंग बेंच',
              summary: 'जॉइनरी क्षमता बढ़ी।',
              category: 'स्टूडियो',
            },
          ],
        },
        careers: {
          intro: ['हम साइट सुपरवाइजर खोज रहे हैं।'],
          studioPhoto: { caption: 'वर्कशॉप टीम' },
          lookFor: [{ title: 'माप समझना', body: 'साइट की सच्चाई पढ़ना।' }],
          emptyState: { title: 'अभी कोई भूमिका नहीं', body: 'नई भूमिका आने पर यहां दिखेगी।' },
          applyProcess: {
            title: 'आवेदन कैसे करें',
            sendTo: 'jobs@example.com',
            subject: 'साइट सुपरवाइजर आवेदन',
            sendItems: ['रिज्यूमे'],
            next: 'अगला कदम',
            nextBody: ['हम कॉल करेंगे।'],
          },
          roles: [
            {
              title: 'साइट सुपरवाइजर',
              type: 'फुल टाइम',
              location: 'पटना',
              body: 'साइट कैलेंडर संभालना।',
              standfirst: 'काम साइट पर है।',
              reportsTo: 'ऑपरेशंस',
              salary: 'अनुभव के अनुसार',
              starts: 'तुरंत',
              duties: ['मटेरियल चेक'],
              requirements: ['दो साल अनुभव'],
              months: [{ span: 'पहला महीना', text: 'चलती साइट समझना।' }],
              apply: 'ईमेल करें।',
            },
          ],
        },
      },
    }),
  'Hindi overlay should accept all existing schema-safe owner content surfaces',
)

const seed = loadI18nSeed('ashish-interiors', 'hi')
assert.ok(seed, 'Ashish Hindi seed content should exist')
const status = i18nCompletion(seed)
assert.equal(status.locale, 'hi')
assert.ok(status.translated > 0, 'Hindi seed should count translated text fields')
assert.ok(status.total >= status.translated, 'completion totals should be monotonic')

const aboutDir = join(process.cwd(), 'design', 'reference', 'editorial', 'about')
const aboutFiles = existsSync(aboutDir) ? readdirSync(aboutDir).filter((name) => name.endsWith('.html')).sort() : []
assert.deepEqual(
  aboutFiles,
  ['01-about-overview.html', '02-about-founder.html', '03-about-team.html', '04-about-workshop-process.html'],
  'About references must be exactly the four requested HTML pages',
)
for (const file of aboutFiles) {
  const body = readFileSync(join(aboutDir, file), 'utf8')
  assert.doesNotMatch(body, /studio reference|About reference|owner \/ studio photograph|generic/i, `${file} must not contain the rejected placeholder/reference copy`)
}

console.log('i18n contract tests passed')
