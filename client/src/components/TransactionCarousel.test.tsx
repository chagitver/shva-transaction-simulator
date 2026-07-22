import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n'
import { TransactionCarousel } from './TransactionCarousel'

const transactions = [
  {
    id: 'newest', regionCode: 'IL', regionName: { en: 'Israel', he: 'ישראל' },
    timeZoneId: 'Asia/Jerusalem', submittedAtUtc: '2026-07-22T09:00:00Z',
    localDateTime: '2026-07-22T12:00:00+03:00', localTime: '12:00', status: 'Approved' as const,
  },
  {
    id: 'older', regionCode: 'FR', regionName: { en: 'France', he: 'צרפת' },
    timeZoneId: 'Europe/Paris', submittedAtUtc: '2026-07-22T08:00:00Z',
    localDateTime: '2026-07-22T10:00:00+02:00', localTime: '10:00', status: 'Approved' as const,
  },
]

describe('TransactionCarousel', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('uses RTL order and brings the newest SQL transaction into view', () => {
    const { container } = render(<TransactionCarousel transactions={transactions} locale="he" text={messages.he} />)

    expect(container.querySelector('.carousel-shell')).toHaveAttribute('dir', 'rtl')
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('12:00')
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('ישראל')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  })
})
