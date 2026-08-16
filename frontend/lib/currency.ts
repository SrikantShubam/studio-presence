/** Formats a rupee range as e.g. "₹8.4 – 10.2 lakh" or "₹1.2 – 1.5 crore". */
export function formatInrRange(low: number, high: number): string {
  const a = splitAmount(low)
  const b = splitAmount(high)
  return a.unit === b.unit ? `₹${a.v} – ${b.v} ${b.unit}` : `₹${a.v} ${a.unit} – ${b.v} ${b.unit}`
}

function splitAmount(n: number): { v: string; unit: string } {
  const cr = n / 10_000_000
  if (cr >= 1) {
    return { v: trimDec(cr < 10 ? cr.toFixed(2) : cr.toFixed(1)), unit: 'crore' }
  }
  const l = n / 100_000
  return { v: trimDec(l < 10 ? l.toFixed(2) : l.toFixed(1)), unit: 'lakh' }
}

function trimDec(value: string): string {
  return value.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}
