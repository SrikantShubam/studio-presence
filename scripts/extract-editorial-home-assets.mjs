/* global Buffer, console */

import fs from 'node:fs'
import path from 'node:path'

const referencePath = path.resolve('design/reference/editorial/home.html')
const html = fs.readFileSync(referencePath, 'utf8')
const manifestMatch = html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/)

if (!manifestMatch) throw new Error('Reference bundle manifest not found.')

const manifest = JSON.parse(manifestMatch[1])
const outputRoot = path.resolve('frontend/public/clients/ashish-interiors/editorial')
const fontRoot = path.resolve('frontend/public/fonts/archivo')
fs.mkdirSync(outputRoot, { recursive: true })
fs.mkdirSync(fontRoot, { recursive: true })

const imageIds = [
  'fb9eaa17-9c87-47ad-a2cb-10a113fc9bd1',
  'e6ec483b-46ce-4cba-a137-8c7eb4a24417',
  '59d3d47f-e0fd-4d79-9595-a4ab8afa4edd',
  '1e00e6ca-46a4-4c94-acaf-65439946bb57',
  '4c649b9c-9e24-4abd-ac21-aba66eeea946',
  '9a2fee84-9c8b-4ab3-b94f-d822dcc71f8d',
  'c9a73a14-a545-4219-b986-581661b806b4',
  '1d28b249-0b36-4ce6-8862-4c0d2471557b',
  'c45fa8a4-73f9-4d6d-951e-e5db4a595b99',
  'd277c5d3-d963-45ee-8e6d-dc1db4e5c921',
  '8c57e4d3-fe7e-4d61-8b8b-358daf637325',
  'c3b474f9-be70-46e6-863c-2a3895cd0aa3',
  '4c3360f1-e6e1-4c9e-8219-065545d4d421',
  'dbe06273-01d0-4f3b-8ecd-beb44418a57b',
  '599ee956-26ef-4176-8c4d-9c863d3410e8',
]

const imageNames = [
  'hero.jpg',
  'trust-01.jpg',
  'trust-02.jpg',
  'trust-03.jpg',
  'service-01.jpg',
  'service-02.jpg',
  'portfolio-01.jpg',
  'portfolio-02.jpg',
  'portfolio-03.jpg',
  'portfolio-04.jpg',
  'instagram-01.jpg',
  'instagram-02.jpg',
  'instagram-03.jpg',
  'instagram-04.jpg',
  'testimonial-01.jpg',
]

for (const [index, id] of imageIds.entries()) {
  const entry = manifest[id]
  if (!entry || entry.mime !== 'image/jpeg') throw new Error(`Missing image asset ${id}.`)
  fs.writeFileSync(path.join(outputRoot, imageNames[index]), Buffer.from(entry.data, 'base64'))
}

const fontIds = {
  'archivo-latin.woff2': 'c5d1da40-aa63-4dd3-a0b2-d094d43ef9b2',
  'archivo-latin-ext.woff2': 'fb5aba34-1741-4b83-9cc8-4edd725ca131',
  'archivo-vietnamese.woff2': 'ebf726ec-275d-402f-9644-d8a726ebe096',
}

for (const [name, id] of Object.entries(fontIds)) {
  const entry = manifest[id]
  if (!entry || entry.mime !== 'font/woff2') throw new Error(`Missing font asset ${id}.`)
  fs.writeFileSync(path.join(fontRoot, name), Buffer.from(entry.data, 'base64'))
}

console.log(`Extracted ${imageIds.length} images and ${Object.keys(fontIds).length} font files.`)
