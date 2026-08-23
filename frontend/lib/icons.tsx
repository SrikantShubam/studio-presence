'use client'

import { config, type IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
  faBars,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faLocationDot,
  faPhone,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import '@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false

export type EditorialIconName =
  | 'message-circle'
  | 'phone'
  | 'map-pin'
  | 'instagram'
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
  instagram: faInstagram,
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
  return <FontAwesomeIcon icon={icons[name]} className={className} aria-hidden />
}
