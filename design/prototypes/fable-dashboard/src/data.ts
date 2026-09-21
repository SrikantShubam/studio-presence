export interface Lead {
  id: string;
  name: string;
  phone: string;
  locality: string;
  city: string;
  projectType: string;
  budgetMin: number;
  budgetMax: number;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  source: 'WhatsApp CTA' | 'Digital QR Card' | 'Estimate Calculator' | 'Website Form' | 'Walk-in';
  createdAt: string;
  timeline: string;
  notes: string;
  brief: string;
  carpetArea: number;
  homeType: string;
  contacted: boolean;
}

export interface TrafficData {
  month: string;
  visitors: number;
  enquiries: number;
}

export interface CityData {
  name: string;
  x: number;
  y: number;
  visits: number;
  leads: number;
  isHQ: boolean;
  stateId: string;
}

export interface ProjectData {
  name: string;
  views: number;
  leads: number;
  image: string;
}

export const leads: Lead[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    phone: '919876543210',
    locality: 'Boring Road',
    city: 'Patna',
    projectType: 'Full Home Interior',
    budgetMin: 1800000,
    budgetMax: 2500000,
    status: 'new',
    source: 'WhatsApp CTA',
    createdAt: '2026-01-18',
    timeline: '3-4 months',
    notes: '',
    brief: 'Looking for complete 3BHK interior with modular kitchen. Budget flexible for premium finishes.',
    carpetArea: 1450,
    homeType: '3 BHK',
    contacted: false,
  },
  {
    id: '2',
    name: 'Priya Verma',
    phone: '919812345678',
    locality: 'Gomti Nagar',
    city: 'Lucknow',
    projectType: 'Kitchen & Living',
    budgetMin: 800000,
    budgetMax: 1200000,
    status: 'contacted',
    source: 'Estimate Calculator',
    createdAt: '2026-01-17',
    timeline: '2 months',
    notes: 'Called on 17th evening. Interested in modular kitchen with island counter.',
    brief: 'Want a modern modular kitchen with breakfast counter and open shelving. Living room needs TV unit and crockery display.',
    carpetArea: 1100,
    homeType: '2 BHK',
    contacted: true,
  },
  {
    id: '3',
    name: 'Amit Kumar Singh',
    phone: '919834567890',
    locality: 'Kanke Road',
    city: 'Ranchi',
    projectType: 'Full Home Interior',
    budgetMin: 2500000,
    budgetMax: 4000000,
    status: 'quoted',
    source: 'Digital QR Card',
    createdAt: '2026-01-15',
    timeline: '4-5 months',
    notes: 'Quotation sent on 16th. Following up on 20th. High-value client, owns 2 properties.',
    brief: 'New 4BHK flat possession in March. Want complete turnkey interior with premium Italian marble, modular kitchen, and custom wardrobes.',
    carpetArea: 2200,
    homeType: '4 BHK',
    contacted: true,
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    phone: '919856789012',
    locality: 'Bistupur',
    city: 'Jamshedpur',
    projectType: 'Bedroom & Wardrobe',
    budgetMin: 400000,
    budgetMax: 600000,
    status: 'new',
    source: 'Website Form',
    createdAt: '2026-01-18',
    timeline: '1 month',
    notes: '',
    brief: 'Master bedroom renovation. Need walk-in wardrobe and false ceiling with cove lighting.',
    carpetArea: 250,
    homeType: '1 BHK',
    contacted: false,
  },
  {
    id: '5',
    name: 'Vikash Thakur',
    phone: '919878901234',
    locality: 'Kankarbagh',
    city: 'Patna',
    projectType: 'Full Home Interior',
    budgetMin: 1500000,
    budgetMax: 2000000,
    status: 'won',
    source: 'Walk-in',
    createdAt: '2026-01-10',
    timeline: '3 months',
    notes: 'Token amount received. Site visit scheduled for 22nd Jan. Finalizing wood finishes.',
    brief: 'Complete 2BHK interior with focus on storage. Wife wants pooja room with traditional touches.',
    carpetArea: 1050,
    homeType: '2 BHK',
    contacted: true,
  },
  {
    id: '6',
    name: 'Neha Jaiswal',
    phone: '919890123456',
    locality: 'Hazratganj',
    city: 'Lucknow',
    projectType: 'Office Interior',
    budgetMin: 300000,
    budgetMax: 500000,
    status: 'contacted',
    source: 'WhatsApp CTA',
    createdAt: '2026-01-16',
    timeline: '6 weeks',
    notes: 'Owns a boutique. Wants to renovate the ground floor display area and checkout counter.',
    brief: 'Small office space 400 sqft. Need reception, 2 cabins, and a small meeting area. Modern minimalist look.',
    carpetArea: 400,
    homeType: 'Studio',
    contacted: true,
  },
  {
    id: '7',
    name: 'Deepak Mishra',
    phone: '919801234567',
    locality: 'Civil Lines',
    city: 'Patna',
    projectType: 'Modular Kitchen',
    budgetMin: 600000,
    budgetMax: 900000,
    status: 'new',
    source: 'Estimate Calculator',
    createdAt: '2026-01-18',
    timeline: '1 month',
    notes: '',
    brief: 'L-shaped modular kitchen with chimney, hob, and tall unit. Prefer matte finish in grey tones.',
    carpetArea: 120,
    homeType: '3 BHK',
    contacted: false,
  },
  {
    id: '8',
    name: 'Ankita Roy',
    phone: '919811122233',
    locality: 'Salt Lake',
    city: 'Kolkata',
    projectType: 'Full Home Interior',
    budgetMin: 2000000,
    budgetMax: 3000000,
    status: 'contacted',
    source: 'Website Form',
    createdAt: '2026-01-14',
    timeline: '4 months',
    notes: 'Video call done on 15th. Liked our Boring Road project portfolio. Wants similar aesthetic.',
    brief: '3BHK new flat. Want Scandinavian style interior with lots of natural light, plants corner, and open kitchen concept.',
    carpetArea: 1600,
    homeType: '3 BHK',
    contacted: true,
  },
  {
    id: '9',
    name: 'Saurabh Patel',
    phone: '919822233344',
    locality: 'Vijay Nagar',
    city: 'Indore',
    projectType: 'Living & Dining',
    budgetMin: 700000,
    budgetMax: 1100000,
    status: 'quoted',
    source: 'Digital QR Card',
    createdAt: '2026-01-12',
    timeline: '6 weeks',
    notes: 'Quotation shared. Comparing with local vendor. Emphasized our warranty and post-install service.',
    brief: 'Living and dining area renovation. Want marble TV unit, crockery cabinet, and ceiling work with indirect lighting.',
    carpetArea: 650,
    homeType: '3 BHK',
    contacted: true,
  },
  {
    id: '10',
    name: 'Kavita Sharma',
    phone: '919833344455',
    locality: 'Connaught Place',
    city: 'Delhi',
    projectType: 'Full Home Interior',
    budgetMin: 5000000,
    budgetMax: 8000000,
    status: 'new',
    source: 'WhatsApp CTA',
    createdAt: '2026-01-18',
    timeline: '6 months',
    notes: '',
    brief: 'Luxurious 4BHK penthouse in Delhi. Looking for a studio that can deliver a resort-like feel with premium imported materials.',
    carpetArea: 3200,
    homeType: '4 BHK',
    contacted: false,
  },
  {
    id: '11',
    name: 'Rohit Ranjan',
    phone: '919844455566',
    locality: 'Bailey Road',
    city: 'Patna',
    projectType: 'Bedroom Suite',
    budgetMin: 350000,
    budgetMax: 550000,
    status: 'won',
    source: 'Walk-in',
    createdAt: '2026-01-08',
    timeline: '3 weeks',
    notes: 'Completed installation on 16th. Happy with the result. Willing to give testimonial.',
    brief: 'Guest bedroom furniture set with study table, wardrobe, and bedside units. Prefers walnut wood finish.',
    carpetArea: 180,
    homeType: '1 BHK',
    contacted: true,
  },
  {
    id: '12',
    name: 'Meena Devi',
    phone: '919855566677',
    locality: 'Harmu',
    city: 'Ranchi',
    projectType: 'Modular Kitchen',
    budgetMin: 450000,
    budgetMax: 700000,
    status: 'contacted',
    source: 'Estimate Calculator',
    createdAt: '2026-01-16',
    timeline: '3 weeks',
    notes: 'Spoke to husband. Will visit the Patna studio this weekend for material samples.',
    brief: 'U-shaped kitchen with breakfast counter. Needs appliance garage and pull-out pantry units.',
    carpetArea: 100,
    homeType: '2 BHK',
    contacted: true,
  },
];

export const trafficData: TrafficData[] = [
  { month: 'Aug', visitors: 680, enquiries: 8 },
  { month: 'Sep', visitors: 820, enquiries: 11 },
  { month: 'Oct', visitors: 940, enquiries: 14 },
  { month: 'Nov', visitors: 1050, enquiries: 16 },
  { month: 'Dec', visitors: 1180, enquiries: 18 },
  { month: 'Jan', visitors: 1248, enquiries: 24 },
];

export const cityData: CityData[] = [
  { name: 'Patna', x: 359, y: 278, visits: 612, leads: 14, isHQ: true, stateId: 'br' },
  { name: 'Ranchi', x: 361, y: 329, visits: 128, leads: 3, isHQ: false, stateId: 'jh' },
  { name: 'Varanasi', x: 312, y: 284, visits: 84, leads: 2, isHQ: false, stateId: 'up' },
  { name: 'Kolkata', x: 429, y: 346, visits: 96, leads: 1, isHQ: false, stateId: 'wb' },
  { name: 'Delhi NCR', x: 188, y: 210, visits: 142, leads: 3, isHQ: false, stateId: 'dl' },
  { name: 'Bengaluru', x: 196, y: 563, visits: 54, leads: 1, isHQ: false, stateId: 'ka' },
];

export const topProjects: ProjectData[] = [
  { name: 'Boring Road Modular Kitchen', views: 342, leads: 6, image: '🏠' },
  { name: 'Gomti Nagar 3BHK Turnkey', views: 278, leads: 4, image: '🏡' },
  { name: 'Kanke Road Luxe Villa', views: 215, leads: 3, image: '🏢' },
  { name: 'Bailey Road Studio Apartment', views: 189, leads: 2, image: '🏗️' },
  { name: 'Salt Lake Scandinavian Home', views: 156, leads: 2, image: '🏠' },
];

export const attributionChannels = [
  { name: 'WhatsApp CTA', value: 38, color: '#25D366' },
  { name: 'Estimate Calculator', value: 28, color: '#71717a' },
  { name: 'Website Form', value: 18, color: '#a1a1aa' },
  { name: 'Digital QR Card', value: 10, color: '#d4d4d8' },
  { name: 'Walk-in', value: 6, color: '#e4e4e7' },
];

export const teamMembers = [
  { name: 'Ashish Kumar', email: 'ashish@ashish-interiors.in', role: 'Owner' as const, avatar: 'AK' },
  { name: 'Ravi Prasad', email: 'ravi@ashish-interiors.in', role: 'Editor' as const, avatar: 'RP' },
  { name: 'Sunita Devi', email: 'sunita@ashish-interiors.in', role: 'Viewer' as const, avatar: 'SD' },
];

export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

export const formatCurrencyFull = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'contacted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'quoted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'won': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getSourceIcon = (source: string): string => {
  switch (source) {
    case 'WhatsApp CTA': return 'MessageCircle';
    case 'Digital QR Card': return 'QrCode';
    case 'Estimate Calculator': return 'Calculator';
    case 'Website Form': return 'Globe';
    case 'Walk-in': return 'UserRound';
    default: return 'HelpCircle';
  }
};