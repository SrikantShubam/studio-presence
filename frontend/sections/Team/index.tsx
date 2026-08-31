import Image from 'next/image'
import Link from 'next/link'
import type { SectionComponentProps } from '@/sections/registry'
import { chromeCopy, localeRoleClass, publicLocaleFromSite } from '@/lib/i18n-client'

export function Team({ config, site }: SectionComponentProps<'team'>) {
  if (!config?.enabled || !config.members?.length) return null
  const locale = publicLocaleFromSite(site)
  const copy = chromeCopy[locale].team

  return (
    <section className="border-t border-accent bg-surface px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="ai-type-testimonial-heading m-0 max-w-xl break-words font-display font-light uppercase leading-[0.9]">
          {copy.title}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {config.members.map((member) => (
            <article className="group min-w-0 border-t border-accent pt-5" key={member.slug ?? member.name}>
              {member.image && (
                <div className="relative mb-5 aspect-[4/5] overflow-hidden border border-hairline bg-muted/10">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <h5 className={`m-0 font-normal text-muted ${localeRoleClass(locale, 'label')}`}>{member.role}</h5>
              {config.detailPages && member.slug ? (
                <Link
                  href={`/team/${member.slug}`}
                  className="ai-type-team-member-name mt-4 inline-block break-words font-display font-light uppercase leading-none text-muted transition-colors hover:text-accent"
                >
                  {member.name}
                </Link>
              ) : (
                <h3 className="ai-type-team-member-name mt-4 break-words font-display font-light uppercase leading-none">
                  {member.name}
                </h3>
              )}
              {member.bio && <p className={`mt-5 text-pretty leading-7 text-muted ${localeRoleClass(locale, 'body')}`}>{member.bio}</p>}
              {config.detailPages && member.slug && (
                <Link
                  className={`mt-6 inline-flex min-h-11 items-center border border-accent bg-surface px-5 py-3 text-ink transition-colors hover:bg-ink hover:text-surface ${localeRoleClass(locale, 'button')}`}
                  href={`/team/${member.slug}`}
                >
                  {copy.viewMore}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
