import type { ClientConfig } from '@studio/backend'

export type Office = NonNullable<ClientConfig['sections']['locations']>['offices'][number]

export interface LocationSeoMeta {
  metaTitle: string
  metaDescription: string
  targetKeywords: string[]
  geoCoordinates: { latitude: number; longitude: number }
  neighborhoodsServed: string[]
}

export const FIVE_LOCATIONS: Office[] = [
  {
    slug: 'patna-studio',
    name: 'Boring Road Atelier & Studio',
    address: {
      line1: '2nd Floor, Shivam Complex, Boring Road Crossing',
      locality: 'Boring Road',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800001',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:00 – 19:00',
      saturday: '10:00 – 19:00',
      sunday: 'By appointment',
      note: 'Saturday mornings are the busiest — client consultations and material selections take place at the sample table.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/locations/studio.jpg',
      caption: 'THE SAMPLE RACKS, SECOND FLOOR — WHERE EVERY PROJECT STARTS',
    },
    findNote: 'Above the Raymond showroom, staircase beside the SBI ATM. Rear service lane parking available.',
    about: {
      lead: 'Our central design studio established in 2016 at Boring Road Crossing. The primary hub where architectural space planning, 2D drawings, and material approvals happen.',
      body: [
        'The Boring Road floor houses our full materials library: IS:710 Marine Grade BWP ply cross-sections, imported acrylic swatches, quartz samples, and Hafele hardware displays.',
        'Clients sit with Ashish Kumar and lead designers to review exact floor plans and electrical layouts before a single board of wood is ordered.',
      ],
      stats: [
        { value: '2016', label: 'STUDIO OPENED' },
        { value: '280+', label: 'HOMES PLANNED' },
        { value: '100%', label: 'IN-HOUSE CREW' },
      ],
    },
    team: [
      {
        name: 'ASHISH KUMAR',
        role: 'FOUNDER & PRINCIPAL DESIGNER',
        image: '/clients/ashish-interiors/editorial/team/principal-01.jpg',
      },
      {
        name: 'SUNITA RAJ',
        role: 'PARTNER, DESIGN',
        image: '/clients/ashish-interiors/editorial/team/principal-02.jpg',
      },
    ],
    projectSlugs: ['boring-road-kitchen', 'patliputra-duplex'],
  },
  {
    slug: 'digha-ghat',
    name: 'Digha Ghat Cabinet Workshop',
    address: {
      line1: 'Plot 14, Industrial Run, Near Ganga Path',
      locality: 'Digha Ghat',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800011',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '09:00 – 18:00',
      saturday: '09:00 – 17:00',
      sunday: 'Closed',
      note: 'Clients are welcome to inspect raw joinery cutting and hot-melt edge banding by appointment on weekdays.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/team/workshop-01.jpg',
      caption: 'PANEL SAWS & EDGE BANDING LINE — DIGHA GHAT WORKSHOP',
    },
    findNote: '5 minutes from JP Ganga Path connector, adjacent to the industrial lumber storage yard.',
    about: {
      lead: 'Our dedicated 3,200 sq ft joinery and pre-fit facility where raw BWR/BWP plywood is machined, edge-banded, and dry-assembled prior to apartment delivery.',
      body: [
        'To prevent noise, saw dust, and delays inside client homes, all carcass cutting is executed on precision sliding table saws at Digha Ghat.',
        'Every edge cut is sealed with moisture-resistant hot-melt PUR edge banding specifically calibrated for Patna monsoon humidity.',
      ],
      stats: [
        { value: '3,200 SQ FT', label: 'FACILITY SIZE' },
        { value: '0 DUST', label: 'SITE CUTTING POLICY' },
        { value: '45 DAYS', label: 'TURNOVER CYCLE' },
      ],
    },
    team: [
      {
        name: 'MANOJ SHARMA',
        role: 'WORKSHOP LEAD & MASTER JOINER',
        image: '/clients/ashish-interiors/editorial/team/workshop-02.jpg',
      },
    ],
    projectSlugs: ['boring-road-kitchen'],
  },
  {
    slug: 'kankarbagh',
    name: 'Kankarbagh Consultation Desk',
    address: {
      line1: '1st Floor, Near Tiwari Bechar, Old Bypass Road',
      locality: 'Kankarbagh',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800020',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:30 – 19:30',
      saturday: '10:30 – 19:30',
      sunday: 'By appointment',
      note: 'Evening consultation slots available for doctors and busy working families in South Patna.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/kankarbagh/cover.jpg',
      caption: 'KANKARBAGH RESIDENTIAL CONSULTATION DESK',
    },
    findNote: 'Right across Tiwari Bechar sweets on Old Bypass Road, 3 minutes from Kumhrar park.',
    about: {
      lead: 'Established to directly serve South Patna residential hubs including Kankarbagh Colony, Rajendra Nagar, Hanuman Nagar, and Kumhrar.',
      body: [
        'Dedicated to complete renovation of older duplex homes and government quarters, converting traditional layouts into modern open-plan living and modular storage.',
        'Features physical swatches for laminate palettes, hardware pulls, and moisture-resistant false ceiling sections.',
      ],
      stats: [
        { value: '85+', label: 'SOUTH PATNA HOMES' },
        { value: '24 HRS', label: 'SURVEY DISPATCH' },
        { value: '10 YR', label: 'HARDWARE WARRANTY' },
      ],
    },
    team: [
      {
        name: 'VIKRAM VERMA',
        role: 'SITE SUPERVISOR, SOUTH PATNA',
        image: '/clients/ashish-interiors/editorial/team/site-01.jpg',
      },
    ],
    projectSlugs: ['kankarbagh'],
  },
  {
    slug: 'danapur',
    name: 'Bailey Road & Danapur Hub',
    address: {
      line1: '3rd Floor, Corporate Plaza, Near Saguna More, Bailey Road',
      locality: 'Danapur',
      city: 'Patna',
      state: 'Bihar',
      pincode: '801503',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:00 – 19:00',
      saturday: '10:00 – 19:00',
      sunday: '11:00 – 16:00',
      note: 'Weekend walk-ins welcome for new apartment owners along the Bailey Road expansion corridor.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/patliputra-duplex/cover.jpg',
      caption: 'WEST PATNA APARTMENT INTERIORS SUITE',
    },
    findNote: 'Near Saguna More flyover junction, easy parking and lift access from ground floor.',
    about: {
      lead: 'Strategically positioned at Saguna More to manage turnkey interior handovers in high-rise residential towers across West Patna.',
      body: [
        'Specializing in 3BHK and 4BHK society flats in RPS More, Saguna More, Gola Road, and Danapur Cantt.',
        'Full acoustic wall paneling, modular sliding wardrobes, and built-in appliance cabinetry designed specifically for modern builder floor plates.',
      ],
      stats: [
        { value: '120+', label: 'APARTMENTS HANDED OVER' },
        { value: '45 DAYS', label: 'SPEED EXECUTION' },
        { value: 'IS:710', label: 'CERTIFIED MARINE PLY' },
      ],
    },
    team: [
      {
        name: 'PRIYA SAHAY',
        role: 'APARTMENT ARCHITECTURAL LEAD',
        image: '/clients/ashish-interiors/editorial/team/design-01.jpg',
      },
    ],
    projectSlugs: ['patliputra-duplex'],
  },
  {
    slug: 'hajipur',
    name: 'Hajipur Regional Site Office',
    address: {
      line1: 'Station Road, Near Ramashis Chowk',
      locality: 'Hajipur',
      city: 'Hajipur',
      state: 'Bihar',
      pincode: '844101',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:00 – 18:00',
      saturday: '10:00 – 18:00',
      sunday: '10:00 – 15:00',
      note: 'Regional site supervisor present on Tuesdays, Thursdays, and Saturdays.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/hero.jpg',
      caption: 'HAJIPUR & VAISHALI REGIONAL RESIDENCE PROJECT',
    },
    findNote: 'Close to Ramashis Chowk intersection, on the main connecting road toward Vaishali.',
    about: {
      lead: 'Our North Bihar coordination office handling standalone bungalow commissions, ancestral home renovations, and commercial estates across Hajipur and Sonpur.',
      body: [
        'Maintains dedicated site supervisors who reside in Hajipur, guaranteeing daily attendance and mason coordination without transit delay across the Ganga bridge.',
        'All custom cabinetry continues to be fabricated at our Digha workshop and transported via scheduled container trucks.',
      ],
      stats: [
        { value: '150 KM', label: 'CORE WORKING RADIUS' },
        { value: 'DAILY', label: 'SITE SUPERVISION' },
        { value: '35+', label: 'VILLAS DELIVERED' },
      ],
    },
    team: [
      {
        name: 'AMIT KUMAR',
        role: 'REGIONAL SITE ENGINEER',
        image: '/clients/ashish-interiors/editorial/team/site-02.jpg',
      },
    ],
    projectSlugs: ['patliputra-duplex'],
  },
]

const HI_TRANSLATIONS: Record<string, { name: string; findNote: string }> = {
  'patna-studio': {
    name: 'बोरिंग रोड डिज़ाइन स्टूडियो',
    findNote: 'रेमंड शोरूम के ऊपर, एसबीआई एटीएम के बगल में सीढ़ी। पीछे सर्विस लेन में पार्किंग की सुविधा।',
  },
  'digha-ghat': {
    name: 'दीघा घाट कैबिनेट वर्कशॉप',
    findNote: 'जेपी गंगा पथ से 5 मिनट की दूरी पर, इंडस्ट्रियल टिंबर यार्ड के पास।',
  },
  kankarbagh: {
    name: 'कंकड़बाग कंसल्टेशन डेस्क',
    findNote: 'ओल्ड बाईपास रोड पर तिवारी बेचार स्वीट्स के ठीक सामने, कुम्हरार पार्क से 3 मिनट।',
  },
  danapur: {
    name: 'बेली रोड एवं दानापुर स्टूडियो',
    findNote: 'सगुना मोड़ फ्लाईओवर के पास, लिफ्ट और सुगम पार्किंग उपलब्ध।',
  },
  hajipur: {
    name: 'हाजीपुर रीजनल साइट ऑफिस',
    findNote: 'रामाशीष चौक के पास, वैशाली मुख्य मार्ग पर।',
  },
}

export const FIVE_LOCATIONS_HI: Office[] = FIVE_LOCATIONS.map((loc) => {
  const t = HI_TRANSLATIONS[loc.slug]
  return t ? { ...loc, name: t.name, findNote: t.findNote } : loc
})

export const SEO_DATA: Record<string, LocationSeoMeta> = {
  'patna-studio': {
    metaTitle: 'Interior Designer in Boring Road Patna | Ashish Interiors Studio',
    metaDescription:
      'Visit Ashish Interiors Boring Road Studio at Shivam Complex. Best interior designer in Patna for luxury residential flats, modular kitchens, and architectural floor planning.',
    targetKeywords: [
      'Interior designer in Boring Road Patna',
      'Best interior designer in Patna',
      'Home interior designers Boring Road',
      'Turnkey interior contractors Patna',
      'Modular kitchen design Boring Road',
    ],
    geoCoordinates: { latitude: 25.6178, longitude: 85.1234 },
    neighborhoodsServed: ['Boring Road', 'Boring Canal Road', 'Patliputra Colony', 'Sri Krishna Puri', 'Kidwaipuri'],
  },
  'digha-ghat': {
    metaTitle: 'Modular Furniture & Cabinet Workshop Digha Ghat Patna | In-House Carpentry',
    metaDescription:
      'Inspect genuine IS:710 Marine Grade BWP plywood cutting, hot-melt PUR edge banding, and pre-fit modular assembly at Ashish Interiors Digha Ghat joinery workshop.',
    targetKeywords: [
      'Modular kitchen manufacturer Patna',
      'Cabinet carpentry workshop Digha Patna',
      'In-house joinery furniture Patna',
      'BWP plywood edge banding Patna',
      'Custom wardrobe factory Patna',
    ],
    geoCoordinates: { latitude: 25.6512, longitude: 85.0982 },
    neighborhoodsServed: ['Digha', 'Kurji', 'Digha Ghat', 'Ganga Path Corridor', 'Patna City Industrial'],
  },
  kankarbagh: {
    metaTitle: 'Interior Designers in Kankarbagh Patna | Home Renovation & Joinery',
    metaDescription:
      'Consultation desk in Kankarbagh Old Bypass Road. Complete 3BHK flat interior renovation, modular storage, and false ceiling execution for South Patna.',
    targetKeywords: [
      'Interior designers in Kankarbagh Patna',
      'Home interior designers Old Bypass Kankarbagh',
      'House renovation Kankarbagh Rajendra Nagar',
      'Modular kitchen Kankarbagh Patna',
      'False ceiling contractors Kankarbagh',
    ],
    geoCoordinates: { latitude: 25.5941, longitude: 85.1582 },
    neighborhoodsServed: ['Kankarbagh', 'Rajendra Nagar', 'Hanuman Nagar', 'Kumhrar', 'Lohia Nagar'],
  },
  danapur: {
    metaTitle: 'Apartment Interior Designers Bailey Road & Saguna More Danapur Patna',
    metaDescription:
      'Turnkey flat interior solutions for high-rise societies on Bailey Road, Saguna More, and Danapur. 45-day guaranteed completion with factory-finished woodwork.',
    targetKeywords: [
      'Interior designers Bailey Road Patna',
      'Apartment interior designers Saguna More',
      'Flat interior design Danapur Patna',
      '3BHK interiors RPS More Bailey Road',
      'Turnkey home interiors Danapur Cantt',
    ],
    geoCoordinates: { latitude: 25.6128, longitude: 85.0475 },
    neighborhoodsServed: ['Saguna More', 'Bailey Road', 'RPS More', 'Gola Road', 'Danapur Cantt', 'Khagaul'],
  },
  hajipur: {
    metaTitle: 'Interior Designer in Hajipur Vaishali | Turnkey Villa & Home Interiors',
    metaDescription:
      'Local site office at Ramashis Chowk, Hajipur. Residential bungalow renovations, villa interior design, and dedicated daily site supervision across North Bihar.',
    targetKeywords: [
      'Interior designer Hajipur Vaishali',
      'Best interior designer in Hajipur',
      'Bungalow interior design North Bihar',
      'Home interior contractor Hajipur Sonpur',
      'Turnkey residence design Vaishali',
    ],
    geoCoordinates: { latitude: 25.6881, longitude: 85.2144 },
    neighborhoodsServed: ['Hajipur', 'Ramashis Chowk', 'Sonpur', 'Vaishali', 'Lalganj Corridor'],
  },
}

export function resolveOffice(
  site: ClientConfig,
  slug: string,
  locale: 'en' | 'hi' = 'en',
): Office | undefined {
  const offices = locale === 'hi' ? FIVE_LOCATIONS_HI : FIVE_LOCATIONS

  // Check direct slug
  let target = offices.find((o) => o.slug === slug)

  // Check aliases
  if (!target && (slug === 'boring-road' || slug === 'studio')) {
    target = offices[0]
  }
  if (!target && slug === 'workshop') {
    target = offices[1]
  }
  if (!target && (slug === 'bailey-road' || slug === 'saguna-more')) {
    target = offices[3]
  }

  // Check site config
  if (!target) {
    target = site.sections.locations?.offices.find((o) => o.slug === slug) || offices[0]
  }

  if (!target) return undefined

  // Dynamically attach client config business phone without hardcoding
  return {
    ...target,
    phone: target.phone || site.business.phone,
  }
}

export function generateLocationsJsonLd(offices: Office[], fallbackPhone?: string) {
  const defaultSeo = SEO_DATA['patna-studio']!
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: offices.map((office, idx) => {
      const seo = SEO_DATA[office.slug] ?? defaultSeo
      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'HomeGoodsStore',
          '@id': `https://ashishinteriors.in/locations/${office.slug}`,
          name: `Ashish Interiors — ${office.name}`,
          description: seo.metaDescription,
          url: `https://ashishinteriors.in/locations/${office.slug}`,
          telephone: office.phone || fallbackPhone || '',
          priceRange: '₹₹₹',
          address: {
            '@type': 'PostalAddress',
            streetAddress: office.address.line1,
            addressLocality: office.address.locality || 'Patna',
            addressRegion: office.address.state || 'Bihar',
            postalCode: office.address.pincode || '800001',
            addressCountry: 'IN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: seo.geoCoordinates.latitude,
            longitude: seo.geoCoordinates.longitude,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              opens: '10:00',
              closes: '19:00',
            },
          ],
          areaServed: seo.neighborhoodsServed.map((area) => ({
            '@type': 'AdministrativeArea',
            name: area,
          })),
        },
      }
    }),
  }
}
