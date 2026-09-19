import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PanelScopeError, validateEditablePatch } from '../backend/src/services/panel'
import { heading, fail } from './_report'

function rejects(label: string, changes: Record<string, unknown>) {
  let rejected = false
  try {
    validateEditablePatch(changes)
  } catch (error) {
    rejected = error instanceof PanelScopeError
  }
  assert.equal(rejected, true, label)
}

function accepts(label: string, changes: Record<string, unknown>) {
  assert.doesNotThrow(() => validateEditablePatch(changes), label)
}

function main() {
  heading('test:admin-redesign')

  accepts('owner can edit homepage hero content', {
    'sections.hero.headline': 'New headline',
    'sections.hero.sub': 'New subtext',
    'sections.hero.ctaLabel': 'Book a consultation',
  })

  accepts('owner can edit settings content used by CTAs and socials', {
    'cta.whatsappMessage': 'Hi, I want to discuss interiors.',
    'sections.footer.socials': [{ label: 'Instagram', href: 'https://instagram.com/example' }],
  })

  accepts('owner can edit T3 content collections when they exist for the tenant', {
    'sections.locations.offices': [],
    'sections.journal.posts': [],
    'sections.news.items': [],
    'sections.careers.roles': [],
  })

  accepts('owner can manage estimate calculator availability and formula fields', {
    'sections.estimate.enabled': false,
    'sections.estimate.ratePerSqft': { basic: 1200, standard: 1800, premium: 2600 },
    'sections.estimate.homeTypes': [{ id: '2bhk', label: '2BHK', factor: 1 }],
    'sections.estimate.finishLevels': [{ id: 'standard', label: 'Standard', low: 0.95, high: 1.1 }],
  })

  rejects('owner cannot change tier', { tier: 't3' })
  rejects('owner cannot change template', { template: 'premium' })
  rejects('owner cannot change palette', { 'brand.palette': { ink: '#000000' } })
  rejects('owner cannot invent arbitrary paths', { 'sections.notReal.items': [] })

  const root = process.cwd()
  const adminRoot = join(root, 'frontend', 'app', '[tenant]', '(admin)')
  const dashboardTabs = readFile(join(adminRoot, 'dashboard', 'DashboardTabs.tsx'))
  const adminChrome = readFile(join(adminRoot, 'AdminChrome.tsx'))
  const panelLayout = readFile(join(adminRoot, 'panel', 'layout.tsx'))
  const panelPage = readFile(join(adminRoot, 'panel', 'page.tsx'))
  const dashboardPage = readFile(join(adminRoot, 'dashboard', 'page.tsx'))
  const settingsPage = readFile(join(adminRoot, 'dashboard', 'settings', 'page.tsx'))
  const editor = readFile(join(adminRoot, 'panel', 'PanelEditor.tsx'))
  const analytics = readFile(join(adminRoot, 'dashboard', 'analytics', 'AnalyticsDashboard.tsx'))
  const dashboardLayout = readFile(join(adminRoot, 'dashboard', 'layout.tsx'))
  const themeToggle = readFile(join(adminRoot, 'ThemeToggle.tsx'))

  assert.ok(existsSync(join(adminRoot, 'dashboard', 'enquiries', 'page.tsx')), 'enquiries must be a real dashboard route')
  assert.ok(existsSync(join(adminRoot, 'dashboard', 'content', 'page.tsx')), 'website content must be a real dashboard route')
  assert.ok(existsSync(join(adminRoot, 'dashboard', 'settings', 'page.tsx')), 'settings must be a real dashboard route')

  assert.match(dashboardTabs, /href:\s*'\/dashboard\/enquiries'/, 'Enquiries nav must not be a dashboard hash link')
  assert.match(dashboardTabs, /href:\s*'\/dashboard\/content'/, 'Website Content nav must not point at /panel')
  assert.match(dashboardTabs, /href:\s*'\/dashboard\/settings'/, 'Settings nav must not be a panel hash link')
  assert.doesNotMatch(dashboardTabs, /#enquiries|#settings|\/panel'/, 'admin nav must use real dashboard routes')

  assert.match(adminChrome, /ProfileMenu/, 'dashboard shell must render the signed-in profile in the header')
  assert.doesNotMatch(adminChrome, /mt-auto[\s\S]*ProfileAvatar/, 'dashboard shell must not put the profile at the bottom of the side nav')
  assert.match(panelLayout, /DashboardLayout/, 'panel route must reuse the shared dashboard shell for compatibility')
  assert.match(panelPage, /redirect\('\/dashboard\/content'\)/, '/panel must redirect to the real content manager route')
  assert.match(adminChrome, /Welcome[\s\S]*profile\.name[\s\S]*businessName/, 'admin chrome must welcome the user to the tenant project')
  assert.doesNotMatch(adminChrome, /PLATFORM_BRAND|Studio Presence by Vector Veda/, 'admin chrome must not headline platform branding')

  for (const label of ['Locations', 'Case studies', 'Journal', 'News', 'Careers', 'Footer', 'Legal']) {
    assert.match(editor, new RegExp(label), `content manager must expose ${label}`)
  }
  assert.doesNotMatch(editor, /Preview panel/, 'content manager must not own the live preview')
  assert.match(dashboardPage, /Live website preview|<iframe/, 'dashboard overview must own the live preview')
  assert.match(editor, /English[\s\S]*Hindi|Hindi[\s\S]*English/, 'content manager must expose normal language switching')
  assert.match(editor, /data-content-manager/, 'content manager must be identifiable for browser verification')

  assert.doesNotMatch(settingsPage, /ContentManagerPage/, 'settings must be a minimal settings page, not the full content manager')
  assert.match(settingsPage, /META_APP_ID[\s\S]*META_APP_SECRET/, 'settings must explain Meta credential ownership')
  assert.match(settingsPage, /UMAMI_API_URL[\s\S]*UMAMI_USERNAME[\s\S]*UMAMI_PASSWORD/, 'settings must explain Umami credential ownership')
  assert.match(settingsPage, /No client API keys are collected/, 'settings must not ask owners for platform secrets')

  assert.match(analytics, /Visitor data unavailable|Umami unavailable/, 'analytics must show an honest unavailable state')
  for (const question of ['How many people visited', 'Which pages got attention', 'Where did enquiries come from', 'What should I follow up on']) {
    assert.match(analytics, new RegExp(question), `analytics must answer: ${question}`)
  }
  assert.match(analytics, /tabular-nums/, 'analytics bars must be paired with readable numeric values')

  assert.match(dashboardTabs, /aria-label="Primary navigation"/, 'dashboard shell must label its primary navigation')
  assert.match(dashboardLayout, /DashboardTabs orientation="side"/, 'dashboard shell must expose desktop side navigation')
  assert.match(dashboardLayout, /DashboardTabs orientation="top"/, 'dashboard shell must expose mobile navigation')
  assert.match(themeToggle, /system/, 'theme control must expose an explicit system preference')
  assert.match(themeToggle, /removeAttribute\('data-admin-theme'\)/, 'system theme must clear the explicit document override')

  console.log('\x1b[32mPASS\x1b[0m  admin content boundary checks\n')
}

function readFile(path: string): string {
  return readFileSync(path, 'utf8')
}

try {
  main()
} catch (error) {
  fail('test:admin-redesign', (error as Error).message)
}
