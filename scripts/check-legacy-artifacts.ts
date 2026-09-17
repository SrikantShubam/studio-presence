import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const forbidden = ['qa', 'owner'].join('-')
const scanRoots = ['clients', 'frontend/app', 'frontend/lib', 'backend/src']
const ignored = new Set(['.next', 'node_modules'])
const matches: string[] = []

function visit(directory: string): void {
  for (const name of readdirSync(directory)) {
    if (ignored.has(name)) continue
    const path = join(directory, name)
    if (statSync(path).isDirectory()) {
      visit(path)
      continue
    }

    const contents = readFileSync(path, 'utf8')
    if (contents.includes(forbidden)) matches.push(relative(root, path))
  }
}

for (const scanRoot of scanRoots) visit(join(root, scanRoot))

if (matches.length > 0) {
  console.error(`Legacy tenant artifact found in deployable source: ${matches.join(', ')}`)
  process.exit(1)
}

console.log('Legacy tenant artifact check passed')
