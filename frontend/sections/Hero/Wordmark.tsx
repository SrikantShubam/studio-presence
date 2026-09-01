import { Fragment } from 'react'

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

type WordmarkTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export function Wordmark({
  businessName,
  className,
  as: Tag = 'h2',
}: {
  businessName: string
  className?: string
  as?: WordmarkTag
}) {
  return (
    <Tag className={className}>
      {wordmarkLines(businessName).map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line.toUpperCase()}
        </Fragment>
      ))}
    </Tag>
  )
}
