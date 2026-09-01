import type { Lead } from '@studio/backend'

const now = new Date()

function isoDaysAgo(days: number): string {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const DEMO_LEADS: Lead[] = [
  {
    id: 'sample-lead-1',
    tenant_id: 'demo',
    name: 'Ananya Sharma',
    phone: '+919876543210',
    email: 'ananya@example.com',
    locality: 'Indiranagar',
    project_type: 'Residential renovation',
    budget_band: 'Rs 12L - Rs 20L',
    timeline: 'Next 3 months',
    message: 'Looking for a full living room and kitchen refresh before Diwali.',
    source: 'estimate',
    source_page: '/estimate',
    status: 'new',
    notes: null,
    created_at: isoDaysAgo(1),
    contacted_at: null,
  },
  {
    id: 'sample-lead-2',
    tenant_id: 'demo',
    name: 'Vikram Malhotra',
    phone: '+919123456780',
    email: 'vikram@example.com',
    locality: 'Whitefield',
    project_type: 'Office interiors',
    budget_band: 'Rs 20L+',
    timeline: 'This quarter',
    message: 'Need a practical design direction and site execution estimate.',
    source: 'whatsapp',
    source_page: '/',
    status: 'contacted',
    notes: null,
    created_at: isoDaysAgo(4),
    contacted_at: isoDaysAgo(3),
  },
  {
    id: 'sample-lead-3',
    tenant_id: 'demo',
    name: 'Priya Nair',
    phone: '+918888777766',
    email: 'priya@example.com',
    locality: 'Koramangala',
    project_type: 'Modular kitchen',
    budget_band: 'Rs 6L - Rs 10L',
    timeline: 'Within 45 days',
    message: 'Comparing options and wants a clean quote.',
    source: 'form',
    source_page: '/contact',
    status: 'quoted',
    notes: null,
    created_at: isoDaysAgo(10),
    contacted_at: isoDaysAgo(9),
  },
]

export const DEMO_ANALYTICS = {
  enquiryStats: { thisMonth: 14, lastMonth: 9 },
  monthlyTrend: [
    { month: monthOffset(-5), count: 3 },
    { month: monthOffset(-4), count: 5 },
    { month: monthOffset(-3), count: 4 },
    { month: monthOffset(-2), count: 8 },
    { month: monthOffset(-1), count: 9 },
    { month: monthOffset(0), count: 14 },
  ],
  sourceBreakdown: [
    { source: 'whatsapp', label: 'WhatsApp', count: 7 },
    { source: 'estimate', label: 'Estimate calculator', count: 4 },
    { source: 'form', label: 'Contact form', count: 3 },
  ],
  visitStats: { thisMonth: 486, lastMonth: 312 },
  topProjects: [
    { slug: 'forest-sanctuary', title: 'Forest Sanctuary Apartment', views: 128 },
    { slug: 'penthouse-overhaul', title: 'Penthouse Overhaul', views: 96 },
    { slug: 'compact-family-home', title: 'Compact Family Home', views: 74 },
  ],
}

function monthOffset(offset: number): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}
