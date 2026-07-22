import { useEffect, useRef } from 'react'
import type { Messages } from '../i18n'
import type { Locale, Transaction } from '../types'

interface Props {
  transactions: Transaction[]
  locale: Locale
  text: Messages
}

export function TransactionCarousel({ transactions, locale, text }: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const newestId = transactions[0]?.id
  const scroll = (direction: number) => listRef.current?.scrollBy({
    left: direction * 310 * (locale === 'he' ? -1 : 1),
    behavior: 'smooth',
  })

  useEffect(() => {
    const newest = listRef.current?.firstElementChild
    newest?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }, [newestId, locale])

  return (
    <section className="approved-section" aria-labelledby="approved-heading">
      <h2 id="approved-heading">{text.approvedTransactions}</h2>
      {transactions.length === 0 ? (
        <p className="empty-state">{text.empty}</p>
      ) : (
        <div className="carousel-shell" dir={locale === 'he' ? 'rtl' : 'ltr'}>
          <button className="carousel-arrow previous" type="button" aria-label={text.previous} onClick={() => scroll(-1)}>{locale === 'he' ? '›' : '‹'}</button>
          <div className="transaction-list" ref={listRef} dir={locale === 'he' ? 'rtl' : 'ltr'}>
            {transactions.map((transaction) => (
              <article className="transaction-card" key={transaction.id} dir={locale === 'he' ? 'rtl' : 'ltr'}>
                <strong>{text.timeLabel}: <bdi>{transaction.localTime}</bdi></strong>
                <span>{text.timeZone}: {transaction.regionName[locale]}</span>
              </article>
            ))}
          </div>
          <button className="carousel-arrow next" type="button" aria-label={text.next} onClick={() => scroll(1)}>{locale === 'he' ? '‹' : '›'}</button>
        </div>
      )}
    </section>
  )
}
