import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve('frontend/public/clients')
const WIDTHS = { sm: 480, md: 800, lg: 1200 }

function walk(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'variants') walk(next, found)
      continue
    }
    if (/\.(jpe?g|png|webp)$/i.test(entry.name)) found.push(next)
  }
  return found
}

async function main() {
  const files = fs.existsSync(ROOT) ? walk(ROOT) : []
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    const parsed = path.parse(rel)
    const source = sharp(file)
    for (const [size, width] of Object.entries(WIDTHS)) {
      const destDir = path.join(ROOT, parsed.dir, 'variants', size)
      fs.mkdirSync(destDir, { recursive: true })
      await source
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(destDir, `${parsed.name}.webp`))
    }
  }
}

await main()
