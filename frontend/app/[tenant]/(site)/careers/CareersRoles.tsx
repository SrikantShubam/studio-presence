'use client'

import { useState } from 'react'
import type { ClientConfig } from '@studio/backend'
import { EditorialIcon } from '@/lib/icons'

/** Fixed UI framing, identical for every client — not content, so not config. */
const copy = {
  close: 'Close',
  view: 'View details',
  reportsTo: 'Reports to',
  salary: 'Salary',
  starts: 'Starts',
  duties: 'What you would do',
  need: 'What you need',
  firstSix: 'The first six months',
  how: 'How to apply for this role',
  apply: 'Apply for this role',
}

type Role = NonNullable<ClientConfig['sections']['careers']>['roles'][number]

function mailto(email: string, title: string) {
  return `mailto:${email}?subject=${encodeURIComponent(title)}`
}

function RoleRow({
  role,
  index,
  open,
  onToggle,
  email,
}: {
  role: Role
  index: number
  open: boolean
  onToggle: () => void
  email?: string
}) {
  const numeral = String(index + 1).padStart(2, '0')

  return (
    <div className="border-t border-accent">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-1 items-center gap-[clamp(14px,2.4vw,32px)] py-[clamp(24px,3vw,34px)] text-left text-ink min-[720px]:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_auto]"
      >
        <span className="text-[clamp(19px,2.4vw,30px)] font-normal uppercase leading-[1.15] tracking-[-0.01em]">
          {role.title}
        </span>
        {role.type && <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">{role.type}</span>}
        <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">{role.location}</span>
        <span className="inline-flex items-center gap-2.5 justify-self-start text-[11px] font-medium uppercase tracking-[0.2em] min-[720px]:justify-self-end">
          {open ? copy.close : copy.view}
          <span className="text-lg font-light leading-none text-accent">{open ? '−' : '+'}</span>
        </span>
      </button>

      {open ? (
        <div className="pb-[clamp(36px,4.5vw,56px)]">
          <div className="grid grid-cols-1 gap-[clamp(28px,4vw,56px)] border-t border-hairline pt-[clamp(8px,1.4vw,14px)] min-[1080px]:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]">
            <div className="grid content-start gap-4 pt-[clamp(22px,3vw,30px)]">
              <span className="font-display text-[clamp(46px,5.4vw,76px)] font-light leading-[0.82] text-transparent [-webkit-text-stroke:1px_var(--color-hairline)]">
                {numeral}
              </span>
              {role.standfirst && (
                <span className="max-w-[22em] text-[11px] font-medium uppercase leading-[1.7] tracking-[0.2em] text-accent">
                  {role.standfirst}
                </span>
              )}
              <div className="mt-2 grid gap-3 text-[13.5px] leading-[1.6] text-body">
                {role.reportsTo && (
                  <span className="grid gap-1">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{copy.reportsTo}</span>
                    <span>{role.reportsTo}</span>
                  </span>
                )}
                {role.salary && (
                  <span className="grid gap-1">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{copy.salary}</span>
                    <span>{role.salary}</span>
                  </span>
                )}
                {role.starts && (
                  <span className="grid gap-1">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{copy.starts}</span>
                    <span>{role.starts}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid max-w-[44em] gap-[clamp(28px,3.4vw,40px)] pt-[clamp(22px,3vw,30px)]">
              {role.duties.length > 0 && (
                <div className="grid gap-3.5">
                  <h3 className="m-0 text-[clamp(15px,1.6vw,18px)] font-normal uppercase tracking-[0.06em]">{copy.duties}</h3>
                  <ul className="m-0 grid list-disc gap-2.5 pl-[1.1em] text-[15px] leading-[1.7] text-body">
                    {role.duties.map((item) => (
                      <li key={item.slice(0, 32)} className="text-pretty">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {role.requirements.length > 0 && (
                <div className="grid gap-3.5">
                  <h3 className="m-0 text-[clamp(15px,1.6vw,18px)] font-normal uppercase tracking-[0.06em]">{copy.need}</h3>
                  <ul className="m-0 grid list-disc gap-2.5 pl-[1.1em] text-[15px] leading-[1.7] text-body">
                    {role.requirements.map((item) => (
                      <li key={item.slice(0, 32)} className="text-pretty">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {role.months.length > 0 && (
                <div className="grid gap-3.5">
                  <h3 className="m-0 text-[clamp(15px,1.6vw,18px)] font-normal uppercase tracking-[0.06em]">{copy.firstSix}</h3>
                  <div className="grid gap-4">
                    {role.months.map((month) => (
                      <div
                        key={month.span}
                        className="grid grid-cols-1 gap-[clamp(12px,2vw,24px)] border-t border-hairline pt-3.5 min-[720px]:grid-cols-[120px_minmax(0,1fr)]"
                      >
                        <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">{month.span}</span>
                        <span className="max-w-[34em] text-pretty text-[14.5px] leading-[1.7] text-body">{month.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-3.5 border-t border-accent pt-[clamp(18px,2.4vw,26px)]">
                {role.apply && (
                  <>
                    <h3 className="m-0 text-[clamp(15px,1.6vw,18px)] font-normal uppercase tracking-[0.06em]">{copy.how}</h3>
                    <p className="m-0 max-w-[38em] text-pretty text-[15px] leading-[1.7] text-body">{role.apply}</p>
                  </>
                )}
                <a
                  href={email ? mailto(email, role.title) : '#apply'}
                  className="group mt-1.5 inline-flex min-h-11 items-center justify-self-start gap-3 bg-cta px-7 py-[17px] text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%-18px)_100%,0_100%)] hover:bg-ink hover:text-cta"
                >
                  {copy.apply}
                  <EditorialIcon name="arrow-up-right" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function CareersRoles({ roles, email }: { roles: Role[]; email?: string }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {roles.map((role, index) => (
        <RoleRow
          key={role.slug}
          role={role}
          index={index}
          open={open === index}
          onToggle={() => setOpen((current) => (current === index ? null : index))}
          email={email}
        />
      ))}
      <div className="border-t border-accent" />
    </div>
  )
}
