/**
 * Emit `clients/client.schema.json` from the Zod contract.
 *
 * Generated, never hand-edited. A JSON Schema maintained alongside a Zod schema
 * by hand diverges within weeks, and the moment it does the editor autocomplete
 * and the build validator start disagreeing about what a valid config is.
 *
 * Also the artifact that will constrain the demo assembler's structured output
 * later, which is the other reason it has to be exact.
 *
 *   npm run gen:schema
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { clientConfigSchema, defaultClientsDir } from '../backend/src/config/index'

const jsonSchema = z.toJSONSchema(clientConfigSchema, {
  target: 'draft-7',
  io: 'input',
  unrepresentable: 'any',
})

const out = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Studio Presence client config',
  description:
    'GENERATED from backend/src/config/schema.ts by `npm run gen:schema`. Do not edit by hand.',
  ...jsonSchema,
}

const target = join(defaultClientsDir(), 'client.schema.json')
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`, 'utf8')

console.log(`Wrote ${target}`)
