import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const outDir = join(process.cwd(), 'frontend', 'public', 'samples')
mkdirSync(outDir, { recursive: true })

const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#18181b"/>
  <!-- Elegant geometric monogram / architectural emblem -->
  <polygon points="256,70 420,410 92,410" fill="none" stroke="#fafafa" stroke-width="16" stroke-linejoin="round"/>
  <polygon points="256,160 370,410 142,410" fill="none" stroke="#fafafa" stroke-width="12" stroke-linejoin="round"/>
  <line x1="256" y1="70" x2="256" y2="410" stroke="#fafafa" stroke-width="8" stroke-dasharray="12 10"/>
  <circle cx="256" cy="285" r="28" fill="#fafafa"/>
</svg>`

const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" width="800" height="240">
  <rect width="800" height="240" fill="#18181b"/>
  <text x="400" y="105" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700" letter-spacing="8" fill="#fafafa" text-anchor="middle">
    ATELIER STUDIO
  </text>
  <line x1="240" y1="130" x2="560" y2="130" stroke="#a1a1aa" stroke-width="2"/>
  <text x="400" y="165" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="500" letter-spacing="6" fill="#a1a1aa" text-anchor="middle">
    ARCHITECTURE &amp; INTERIORS
  </text>
</svg>`

writeFileSync(join(outDir, 'sample-studio-emblem.svg'), emblemSvg, 'utf8')
writeFileSync(join(outDir, 'sample-studio-wordmark.svg'), wordmarkSvg, 'utf8')

await sharp(Buffer.from(emblemSvg)).png().toFile(join(outDir, 'sample-studio-emblem.png'))
console.log('Created sample-studio-emblem.png')

await sharp(Buffer.from(wordmarkSvg)).png().toFile(join(outDir, 'sample-studio-wordmark.png'))
console.log('Created sample-studio-wordmark.png')
