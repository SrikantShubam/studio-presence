import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
  faBars,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faClock,
  faEnvelope,
  faLocationDot,
  faLanguage,
  faPhone,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

export type EditorialIconName =
  | 'message-circle'
  | 'phone'
  | 'map-pin'
  | 'email'
  | 'clock'
  | 'instagram'
  | 'facebook'
  | 'language'
  | 'arrow-up-right'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'bars'
  | 'close'

const icons: Record<EditorialIconName, IconDefinition> = {
  'message-circle': faWhatsapp,
  phone: faPhone,
  'map-pin': faLocationDot,
  email: faEnvelope,
  clock: faClock,
  instagram: faInstagram,
  facebook: faFacebookF,
  language: faLanguage,
  'arrow-up-right': faArrowUpRightFromSquare,
  'arrow-down': faArrowDown,
  'arrow-left': faArrowLeft,
  'arrow-right': faArrowRight,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight,
  'chevron-down': faChevronDown,
  bars: faBars,
  close: faXmark,
}

export function EditorialIcon({
  name,
  className,
}: {
  name: EditorialIconName
  className?: string
}) {
  const iconDef = icons[name]
  if (!iconDef) return null

  const [width, height, , , svgPathData] = iconDef.icon
  const path = typeof svgPathData === 'string' ? svgPathData : svgPathData[0]

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="currentColor"
    >
      <path d={path} />
    </svg>
  )
}
