import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

const approvedChrome = readFile('frontend/lib/i18n-client.ts')
assert.match(approvedChrome, /serviceDetail:/, 'service detail chrome must live in chromeCopy')
assert.match(approvedChrome, /contact:/, 'contact chrome must live in chromeCopy')
assert.match(approvedChrome, /footer:/, 'footer chrome must live in chromeCopy')
assert.match(approvedChrome, /journal:/, 'journal chrome must live in chromeCopy')
assert.match(approvedChrome, /news:/, 'news chrome must live in chromeCopy')
assert.match(approvedChrome, /locations:/, 'locations chrome must live in chromeCopy')
assert.match(approvedChrome, /about:/, 'about chrome must live in chromeCopy')

const forbiddenByFile: Array<[string, RegExp, string]> = [
  ['frontend/sections/About/index.tsx', /Learn more|About the|Founded in/, 'About section chrome must not be local constants'],
  ['frontend/sections/Contact/index.tsx', /const COPY\s*=/, 'Contact chrome must not be local component copy'],
  ['frontend/sections/Footer/index.tsx', /const COPY\s*=/, 'Footer chrome must not be local component copy'],
  ['frontend/app/[tenant]/(site)/services/[slug]/ServiceDetail.tsx', /const serviceDetailCopy\s*=/, 'Service detail chrome must not be local component copy'],
  ['frontend/app/[tenant]/(site)/journal/JournalBrowser.tsx', /const copy\s*=/, 'Journal chrome must not be local component copy'],
  ['frontend/app/[tenant]/(site)/news/NewsBrowser.tsx', /const copy\s*=/, 'News chrome must not be local component copy'],
  ['frontend/app/[tenant]/(site)/locations/LocationOffice.tsx', /const copy\s*=/, 'Location chrome must not be local component copy'],
  ['frontend/app/[tenant]/(site)/team/TeamIndex.tsx', /const copy\s*=/, 'Team chrome must not be local component copy'],
]

for (const [path, pattern, message] of forbiddenByFile) {
  const body = readFile(path)
  assert.doesNotMatch(body, pattern, message)
}

const htmlDir = join(root, 'design', 'reference', 'editorial', 'about')
const htmlFiles = existsSync(htmlDir) ? [] : ['missing']
if (existsSync(htmlDir)) {
  htmlFiles.push(...readdirSync(htmlDir).filter((name) => name.endsWith('.html')).sort())
}
assert.deepEqual(
  htmlFiles,
  ['01-about-overview.html', '02-about-founder.html', '03-about-team.html', '04-about-workshop-process.html'],
  'exactly four requested about references must exist',
)

console.log('public hardcoded content checks passed')

function readFile(path: string): string {
  return readFileSync(join(root, path), 'utf8')
}
