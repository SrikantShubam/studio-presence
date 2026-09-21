import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeIndianPhone, csvCell, calculateQuote, dashboardMode } from '../../../frontend/app/[tenant]/(admin)/dashboard/components/types'

test('walk-in lead accepts Indian mobile numbers and rejects incomplete or foreign numbers', () => {
  assert.equal(normalizeIndianPhone('9876543210'), '919876543210')
  assert.equal(normalizeIndianPhone('+91 98765 43210'), '919876543210')
  for (const value of ['12345', '1234567890', '+1 9876543210', '987654321x']) {
    assert.equal(normalizeIndianPhone(value), null)
  }
})

test('CSV export preserves commas and quotes without executing spreadsheet formulas', () => {
  assert.equal(csvCell('A, "B"'), '"A, ""B"""')
  assert.equal(csvCell(' =HYPERLINK("x")'), '"\' =HYPERLINK(""x"")"')
})

test('quote uses configured low and high rates and BHK factor', () => {
  assert.deepEqual(calculateQuote(1000, 1200, 1600, 1.1), { low: 1320000, high: 1760000 })
})

test('turning samples off never substitutes demo leads for unavailable live data', () => {
  assert.equal(dashboardMode('0', false), 'unavailable')
  assert.equal(dashboardMode('0', true), 'live')
  assert.equal(dashboardMode('1', true), 'demo')
  assert.equal(dashboardMode(undefined, false), 'demo')
})
