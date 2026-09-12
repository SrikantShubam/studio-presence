import type { ClientConfig } from '@studio/backend'

export type Office = NonNullable<ClientConfig['sections']['locations']>['offices'][number]

export interface LocationSeoMeta {
  metaTitle: string
  metaDescription: string
  targetKeywords: string[]
  geoCoordinates: { latitude: number; longitude: number }
  neighborhoodsServed: string[]
}

export interface TerritoryZone {
  regionName: string
  provinceState: string
  keyCities: string[]
  surveyResponse: string
  supervisionModel: string
  officeSlug: string
  officeName: string
  regionNameHi?: string
  provinceStateHi?: string
  surveyResponseHi?: string
}

export const MULTI_CITY_LOCATIONS: Office[] = [
  {
    slug: 'patna-studio',
    name: 'Boring Road Atelier & Material Library',
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
    slug: 'ranchi-studio',
    name: 'Ashok Nagar Studio & Consultation Suite',
    address: {
      line1: '1st Floor, Radhe Complex, Main Road, Ashok Nagar',
      locality: 'Ashok Nagar',
      city: 'Ranchi',
      state: 'Jharkhand',
      pincode: '834002',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:00 – 19:00',
      saturday: '10:00 – 18:30',
      sunday: '11:00 – 16:00',
      note: 'Dedicated regional consultation hub for executive bungalows and duplex residences across Jharkhand.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/patliputra-duplex/cover.jpg',
      caption: 'RANCHI REGIONAL RESIDENCE CONSULTATION SUITE',
    },
    findNote: 'Directly on Main Road Ashok Nagar, 5 minutes from Birsa Munda Airport connector.',
    about: {
      lead: 'Our dedicated Jharkhand regional studio delivering turnkey residential interiors and architectural renovations in Ranchi, Jamshedpur, and Dhanbad.',
      body: [
        'Specializing in spacious 4BHK apartments, standalone villas, and executive company quarters with heavy focus on moisture-resilient BWP cabinetry.',
        'Resident architectural leads coordinate directly with local masons and electrical teams while all custom joinery arrives factory-cut from our central workshop.',
      ],
      stats: [
        { value: '65+', label: 'HOMES DELIVERED' },
        { value: '48 HRS', label: 'SITE SURVEY RESPONSE' },
        { value: '10 YR', label: 'HARDWARE WARRANTY' },
      ],
    },
    team: [
      {
        name: 'RAKESH SEN',
        role: 'REGIONAL DESIGN DIRECTOR',
        image: '/clients/ashish-interiors/editorial/team/design-01.jpg',
      },
    ],
    projectSlugs: ['patliputra-duplex'],
  },
  {
    slug: 'varanasi-studio',
    name: 'Sigra Atelier & Heritage Renovation Desk',
    address: {
      line1: '2nd Floor, Kuber Plaza, Sigra - Maldahiya Road',
      locality: 'Sigra',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221002',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:30 – 19:30',
      saturday: '10:30 – 19:00',
      sunday: 'By appointment',
      note: 'Walk-ins welcome for heritage residence structural remodeling and modern apartment conversions.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/kankarbagh/cover.jpg',
      caption: 'PURVANCHAL RESIDENTIAL & HERITAGE DESIGN DESK',
    },
    findNote: 'Near Kuber Plaza crossing, 10 minutes from Varanasi Cantt Railway Station.',
    about: {
      lead: 'Our Purvanchal regional hub catering to residential clients in Varanasi, Prayagraj, and Mirzapur requiring architectural honesty in historical urban fabrics.',
      body: [
        'Bridging the gap between historic masonry structures and modern climate-proof modular interiors.',
        'We engineer deep custom storage, concealed ducting, and water-sealed utility spaces that fit older townhouses and new multi-storey complexes alike.',
      ],
      stats: [
        { value: '40+', label: 'COMPLETED RESIDENCES' },
        { value: '100%', label: 'DIRECT SITE OVERSIGHT' },
        { value: 'ZERO', label: 'SUB-CONTRACTED CARPENTRY' },
      ],
    },
    team: [
      {
        name: 'ANANYA MISHRA',
        role: 'ARCHITECTURAL CONSERVATOR & LEAD',
        image: '/clients/ashish-interiors/editorial/team/principal-02.jpg',
      },
    ],
    projectSlugs: ['kankarbagh'],
  },
  {
    slug: 'kolkata-studio',
    name: 'Salt Lake Sector V Studio & Archive',
    address: {
      line1: '4th Floor, Technopolis Hub, Sector V, Salt Lake',
      locality: 'Salt Lake',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:00 – 19:00',
      saturday: '10:00 – 18:00',
      sunday: 'Closed',
      note: 'Studio consultations scheduled in advance for floor plan analysis and finishes walkthroughs.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/hero.jpg',
      caption: 'EASTERN METROPOLITAN RESIDENTIAL ATELIER',
    },
    findNote: 'Near Technopolis intersection, adjacent to Ring Road with underground parking.',
    about: {
      lead: 'Our Eastern metropolitan atelier coordinating turnkey high-rise flats, penthouses, and architectural joinery in Kolkata and New Town.',
      body: [
        'Engineered specifically for high-humidity coastal climates with zero-expansion marine ply cores, anti-fungal laminate sealing, and Blum hardware.',
        'Equipped with 1:1 joinery details so homeowners can examine drawer runners, fluted acoustic panels, and concealed LED profiles.',
      ],
      stats: [
        { value: '50+', label: 'METRO FLATS HANDED OVER' },
        { value: '45 DAYS', label: 'PROJECT DURATION' },
        { value: 'IS:710', label: 'MARINE GRADE ASSURANCE' },
      ],
    },
    team: [
      {
        name: 'SUBHASHIS BOSE',
        role: 'SENIOR PROJECT ARCHITECT',
        image: '/clients/ashish-interiors/editorial/team/design-01.jpg',
      },
    ],
    projectSlugs: ['boring-road-kitchen'],
  },
  {
    slug: 'lucknow-studio',
    name: 'Gomti Nagar Atelier & Design Hub',
    address: {
      line1: '3rd Floor, Vibhuti Khand, Gomti Nagar',
      locality: 'Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=sample',
    },
    hours: {
      weekday: '10:00 – 19:00',
      saturday: '10:00 – 19:00',
      sunday: '11:00 – 16:00',
      note: 'Full materials sample lounge open for homeowner appointments and site drawing discussions.',
    },
    photo: {
      image: '/clients/ashish-interiors/editorial/locations/studio.jpg',
      caption: 'LUCKNOW AWADH RESIDENTIAL ATELIER',
    },
    findNote: 'Near Vibhuti Khand commercial plaza, convenient road access and lift.',
    about: {
      lead: 'Our Central Uttar Pradesh studio serving luxury kothis, builder floors, and high-rise apartments across Lucknow and Kanpur.',
      body: [
        'Dedicated to calm, durable interiors designed around real family routines, eliminating superficial decorative gimmicks.',
        'On-site supervisors manage daily mason, tile, and plumbing sequences, keeping the construction schedule transparent from day one.',
      ],
      stats: [
        { value: '55+', label: 'HOMES COMPLETED' },
        { value: 'WEEKLY', label: 'SITE PHOTO REVIEWS' },
        { value: 'FIXED', label: 'PRICE GUARANTEE' },
      ],
    },
    team: [
      {
        name: 'TARIQ KHAN',
        role: 'PRINCIPAL ARCHITECT, AWADH',
        image: '/clients/ashish-interiors/editorial/team/site-01.jpg',
      },
    ],
    projectSlugs: ['patliputra-duplex'],
  },
  {
    slug: 'digha-ghat',
    name: 'Central Joinery & Machine Fabrication Facility',
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
      caption: 'PRECISION SLIDING TABLE SAWS & EDGE BANDING LINE',
    },
    findNote: '5 minutes from JP Ganga Path connector, adjacent to the industrial lumber storage yard.',
    about: {
      lead: 'Our dedicated 3,200 sq ft joinery and pre-fit facility where raw BWR/BWP plywood is machined, edge-banded, and dry-assembled prior to apartment dispatch across all regional territories.',
      body: [
        'To eliminate saw dust, noise, and delays inside client homes, all cabinet carcass cutting is executed on computerized sliding table saws.',
        'Every edge cut is sealed with moisture-resistant hot-melt PUR edge banding specifically calibrated for Indian monsoon humidity.',
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
]

export const FIVE_LOCATIONS = MULTI_CITY_LOCATIONS.slice(0, 5)

const HI_TRANSLATIONS: Record<string, { name: string; findNote: string }> = {
  'patna-studio': {
    name: 'बोरिंग रोड डिज़ाइन स्टूडियो एवं मटीरियल लाइब्रेरी',
    findNote: 'रेमंड शोरूम के ऊपर, एसबीआई एटीएम के बगल में सीढ़ी। पीछे सर्विस लेन में पार्किंग की सुविधा।',
  },
  'ranchi-studio': {
    name: 'अशोक नगर स्टूडियो एवं कंसल्टेशन सुइट (रांची)',
    findNote: 'मेन रोड अशोक नगर पर, बिरसा मुंडा एयरपोर्ट कनेक्टर से 5 मिनट की दूरी पर।',
  },
  'varanasi-studio': {
    name: 'सिगरा एटेलियर एवं हेरिटेज रेनोवेशन डेस्क (वाराणसी)',
    findNote: 'कुबेर प्लाजा क्रॉसिंग के पास, वाराणसी कैंट स्टेशन से 10 मिनट।',
  },
  'kolkata-studio': {
    name: 'सॉल्ट लेक सेक्टर 5 स्टूडियो एवं आर्काइव (कोलकाता)',
    findNote: 'टेक्नोपोलिस चौराहे के पास, अंडरग्राउंड पार्किंग सुविधा उपलब्ध।',
  },
  'lucknow-studio': {
    name: 'गोमती नगर एटेलियर एवं डिज़ाइन हब (लखनऊ)',
    findNote: 'विभूति खंड कमर्शियल प्लाजा के पास, सुविधाजनक सड़क एवं लिफ्ट सुविधा।',
  },
  'digha-ghat': {
    name: 'सेंट्रल जॉइनरी एवं मशीन फैब्रिकेशन यूनिट',
    findNote: 'जेपी गंगा पथ से 5 मिनट की दूरी पर, इंडस्ट्रियल टिंबर यार्ड के पास।',
  },
}

export const MULTI_CITY_LOCATIONS_HI: Office[] = MULTI_CITY_LOCATIONS.map((loc) => {
  const t = HI_TRANSLATIONS[loc.slug]
  return t ? { ...loc, name: t.name, findNote: t.findNote } : loc
})

export const FIVE_LOCATIONS_HI = MULTI_CITY_LOCATIONS_HI.slice(0, 5)

export const TERRITORY_DIRECTORY: TerritoryZone[] = [
  {
    regionName: 'Bihar & Central Plains',
    provinceState: 'Bihar',
    keyCities: ['Patna', 'Danapur', 'Hajipur', 'Muzaffarpur', 'Gaya'],
    surveyResponse: 'Same-day survey dispatch (2–4 hrs)',
    supervisionModel: 'Daily resident site supervisor',
    officeSlug: 'patna-studio',
    officeName: 'Boring Road Atelier & Material Library',
    regionNameHi: 'बिहार एवं मध्य मैदानी क्षेत्र',
    provinceStateHi: 'बिहार',
    surveyResponseHi: 'समान-दिन सर्वे डिस्पैच (2–4 घंटे)',
  },
  {
    regionName: 'Jharkhand & Chota Nagpur',
    provinceState: 'Jharkhand',
    keyCities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
    surveyResponse: 'Within 24–48 hours',
    supervisionModel: 'Dedicated territory supervisor',
    officeSlug: 'ranchi-studio',
    officeName: 'Ashok Nagar Studio & Consultation Suite',
    regionNameHi: 'झारखंड एवं छोटा नागपुर पठार',
    provinceStateHi: 'झारखंड',
    surveyResponseHi: '24–48 घंटे के भीतर सर्वे',
  },
  {
    regionName: 'Purvanchal & Heritage Belt',
    provinceState: 'Uttar Pradesh',
    keyCities: ['Varanasi', 'Prayagraj', 'Mirzapur', 'Gorakhpur'],
    surveyResponse: 'Scheduled site architect (48 hrs)',
    supervisionModel: 'Architectural team oversight',
    officeSlug: 'varanasi-studio',
    officeName: 'Sigra Atelier & Heritage Renovation Desk',
    regionNameHi: 'पूर्वांचल एवं हेरिटेज बेल्ट',
    provinceStateHi: 'उत्तर प्रदेश',
    surveyResponseHi: 'आर्किटेक्ट साइट विजिट (48 घंटे)',
  },
  {
    regionName: 'Awadh & Central UP Hub',
    provinceState: 'Uttar Pradesh',
    keyCities: ['Lucknow', 'Kanpur', 'Ayodhya', 'Barabanki'],
    surveyResponse: 'Within 24–48 hours',
    supervisionModel: 'Awadh residential atelier team',
    officeSlug: 'lucknow-studio',
    officeName: 'Gomti Nagar Atelier & Design Hub',
    regionNameHi: 'अवध एवं मध्य उत्तर प्रदेश हब',
    provinceStateHi: 'उत्तर प्रदेश',
    surveyResponseHi: '24–48 घंटे में परामर्श',
  },
  {
    regionName: 'Eastern Metropolitan Area',
    provinceState: 'West Bengal',
    keyCities: ['Kolkata', 'Salt Lake', 'New Town', 'Howrah'],
    surveyResponse: 'Next-day laser measurement',
    supervisionModel: 'Turnkey site engineering crew',
    officeSlug: 'kolkata-studio',
    officeName: 'Salt Lake Sector V Studio & Archive',
    regionNameHi: 'पूर्वी महानगर एवं साल्ट लेक रीजन',
    provinceStateHi: 'पश्चिम बंगाल',
    surveyResponseHi: 'अगले दिन लेजर मापन',
  },
  {
    regionName: 'Central Fabrication Facility',
    provinceState: 'Bihar',
    keyCities: ['Digha Ghat', 'Ganga Path Industrial Run', 'Pre-Fit Yard'],
    surveyResponse: 'Workshop walkthrough by appointment',
    supervisionModel: 'Precision CNC & edge-banding facility',
    officeSlug: 'digha-ghat',
    officeName: 'Central Joinery & Machine Facility',
    regionNameHi: 'केंद्रीय जॉइनरी एवं फैब्रिकेशन यूनिट',
    provinceStateHi: 'बिहार',
    surveyResponseHi: 'अपॉइंटमेंट द्वारा वर्कशॉप वॉकथ्रू',
  },
]

export const SEO_DATA: Record<string, LocationSeoMeta> = {
  'patna-studio': {
    metaTitle: 'Interior Designer in Boring Road Patna | Ashish Interiors Studio',
    metaDescription:
      'Visit Ashish Interiors Boring Road Studio at Shivam Complex. Best interior designer in Patna for luxury residential flats, modular kitchens, and architectural space planning.',
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
  'ranchi-studio': {
    metaTitle: 'Interior Designers in Ranchi Jharkhand | Turnkey Bungalow & Flat Design',
    metaDescription:
      'Ashish Interiors Ashok Nagar studio in Ranchi. Turnkey residential architectural interiors, modular wardrobes, and moisture-sealed kitchen cabinets across Jharkhand.',
    targetKeywords: [
      'Interior designer in Ranchi Jharkhand',
      'Home interior designers Ashok Nagar Ranchi',
      'Modular kitchen in Ranchi',
      'Turnkey residential interior Ranchi',
      'Duplex bungalow interior designer Ranchi',
    ],
    geoCoordinates: { latitude: 23.3441, longitude: 85.3096 },
    neighborhoodsServed: ['Ashok Nagar', 'Main Road', 'Harmu Housing Colony', 'Morabadi', 'Kanke Road'],
  },
  'varanasi-studio': {
    metaTitle: 'Interior Designers in Varanasi UP | Heritage & Modern Home Renovation',
    metaDescription:
      'Consult our Sigra Varanasi studio for turnkey home remodeling, luxury modular joinery, and architectural restoration in Purvanchal and Eastern Uttar Pradesh.',
    targetKeywords: [
      'Interior designer in Varanasi',
      'Best interior designers Sigra Varanasi',
      'Home renovation contractors Varanasi',
      'Modular kitchen showroom Varanasi',
      'Turnkey residence design UP East',
    ],
    geoCoordinates: { latitude: 25.3176, longitude: 82.9739 },
    neighborhoodsServed: ['Sigra', 'Maldahiya', 'Mahmoorganj', 'Bhelupur', 'Varanasi Cantt'],
  },
  'kolkata-studio': {
    metaTitle: 'Interior Designers Salt Lake Kolkata | Turnkey High-Rise Apartment Interiors',
    metaDescription:
      'Visit Ashish Interiors Sector V Salt Lake studio. Premium turnkey flat interiors, zero-expansion marine ply cabinetry, and modern interior architecture in Kolkata.',
    targetKeywords: [
      'Interior designers Salt Lake Kolkata',
      'Turnkey apartment interior design Sector V',
      'Modular kitchen manufacturer Kolkata',
      'New Town home interior contractors',
      'Bespoke luxury flats Kolkata',
    ],
    geoCoordinates: { latitude: 22.5804, longitude: 88.4378 },
    neighborhoodsServed: ['Salt Lake Sector V', 'Action Area New Town', 'Rajarhat', 'EM Bypass', 'Lake Town'],
  },
  'lucknow-studio': {
    metaTitle: 'Interior Designers in Gomti Nagar Lucknow | Turnkey Kothi & Flat Interiors',
    metaDescription:
      'Ashish Interiors Gomti Nagar studio in Lucknow. Bespoke turnkey residential interior design, custom woodwork, and transparent site execution across Uttar Pradesh.',
    targetKeywords: [
      'Interior designers Gomti Nagar Lucknow',
      'Luxury home interiors Lucknow',
      'Turnkey flat interior decorator Vibhuti Khand',
      'Modular kitchen designers Lucknow',
      'Bungalow interior architects Lucknow',
    ],
    geoCoordinates: { latitude: 26.8532, longitude: 80.9992 },
    neighborhoodsServed: ['Gomti Nagar', 'Vibhuti Khand', 'Indira Nagar', 'Hazratganj', 'Sushant Golf City'],
  },
  'digha-ghat': {
    metaTitle: 'Modular Furniture & Cabinet Workshop Digha Ghat Patna | In-House Carpentry',
    metaDescription:
      'Inspect genuine IS:710 Marine Grade BWP plywood cutting, hot-melt PUR edge banding, and pre-fit modular assembly at Ashish Interiors central joinery facility.',
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
  // Backward compatibility aliases
  kankarbagh: {
    metaTitle: 'Interior Designers in Kankarbagh Patna | Home Renovation & Joinery',
    metaDescription:
      'Consultation desk in Kankarbagh Old Bypass Road. Complete 3BHK flat interior renovation, modular storage, and false ceiling execution for South Patna.',
    targetKeywords: [
      'Interior designers in Kankarbagh Patna',
      'Home interior designers Old Bypass Kankarbagh',
    ],
    geoCoordinates: { latitude: 25.5941, longitude: 85.1582 },
    neighborhoodsServed: ['Kankarbagh', 'Rajendra Nagar', 'Hanuman Nagar'],
  },
  danapur: {
    metaTitle: 'Apartment Interior Designers Bailey Road & Saguna More Danapur Patna',
    metaDescription:
      'Turnkey flat interior solutions for high-rise societies on Bailey Road, Saguna More, and Danapur. 45-day guaranteed completion with factory-finished woodwork.',
    targetKeywords: [
      'Interior designers Bailey Road Patna',
      'Apartment interior designers Saguna More',
    ],
    geoCoordinates: { latitude: 25.6128, longitude: 85.0475 },
    neighborhoodsServed: ['Saguna More', 'Bailey Road', 'RPS More'],
  },
  hajipur: {
    metaTitle: 'Interior Designer in Hajipur Vaishali | Turnkey Villa & Home Interiors',
    metaDescription:
      'Local site office at Ramashis Chowk, Hajipur. Residential bungalow renovations, villa interior design, and dedicated daily site supervision across North Bihar.',
    targetKeywords: [
      'Interior designer Hajipur Vaishali',
      'Bungalow interior design North Bihar',
    ],
    geoCoordinates: { latitude: 25.6881, longitude: 85.2144 },
    neighborhoodsServed: ['Hajipur', 'Ramashis Chowk', 'Sonpur'],
  },
}

export function resolveOffice(
  site: ClientConfig,
  slug: string,
  locale: 'en' | 'hi' = 'en',
): Office | undefined {
  const offices = locale === 'hi' ? MULTI_CITY_LOCATIONS_HI : MULTI_CITY_LOCATIONS

  // Check direct slug
  let target = offices.find((o) => o.slug === slug)

  // Check aliases
  if (!target && (slug === 'boring-road' || slug === 'studio')) {
    target = offices[0]
  }
  if (!target && slug === 'workshop') {
    target = offices.find((o) => o.slug === 'digha-ghat')
  }
  if (!target && (slug === 'ranchi' || slug === 'ashok-nagar')) {
    target = offices.find((o) => o.slug === 'ranchi-studio')
  }
  if (!target && (slug === 'varanasi' || slug === 'sigra' || slug === 'banaras')) {
    target = offices.find((o) => o.slug === 'varanasi-studio')
  }
  if (!target && (slug === 'kolkata' || slug === 'salt-lake' || slug === 'calcutta')) {
    target = offices.find((o) => o.slug === 'kolkata-studio')
  }
  if (!target && (slug === 'lucknow' || slug === 'gomti-nagar')) {
    target = offices.find((o) => o.slug === 'lucknow-studio')
  }
  if (!target && (slug === 'bailey-road' || slug === 'danapur' || slug === 'saguna-more')) {
    target = offices[0] // fallback to primary or closest
  }
  if (!target && (slug === 'kankarbagh' || slug === 'hajipur')) {
    target = offices[0]
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
            addressLocality: office.address.locality || office.address.city,
            addressRegion: office.address.state,
            postalCode: office.address.pincode || '',
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
