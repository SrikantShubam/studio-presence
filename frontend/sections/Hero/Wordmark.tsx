/**
 * Splits a business name into stacked lines for the nav/hero wordmark — "Ashish
 * Interiors" becomes two lines, one per word. Not hardcoded: the reference
 * mockups show "ASHISH" / "INTERIORS" because that IS this client's name, not
 * because the component knows this client. A studio with a three-word name
 * gets three lines; a one-word name gets one. That's the actual rule the
 * mockup is an instance of.
 */
export function wordmarkLines(businessName: string): string[] {
  const words = businessName.trim().split(/\s+/).filter(Boolean)
  return words.length > 0 ? words : [businessName]
}

export function Wordmark({ businessName, className }: { businessName: string; className?: string }) {
  return (
    <span className={className}>
      {wordmarkLines(businessName).map((line, i) => (
        <span key={i} className="block">
          {line.toUpperCase()}
        </span>
      ))}
    </span>
  )
}
