import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n'
import { RegionCombobox } from './RegionCombobox'

const regions = [
  { code: 'FR', name: { en: 'France', he: 'צרפת' }, timeZoneId: 'Europe/Paris' },
  { code: 'JP', name: { en: 'Japan', he: 'יפן' }, timeZoneId: 'Asia/Tokyo' },
]

describe('RegionCombobox', () => {
  it('filters and selects a region', () => {
    const onChange = vi.fn()
    render(<RegionCombobox regions={regions} value="FR" locale="en" text={messages.en} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: messages.en.region }))
    fireEvent.change(screen.getByLabelText(messages.en.searchRegion), { target: { value: 'jap' } })

    expect(screen.queryByRole('option', { name: /France/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Asia/Tokyo')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: /Japan/ }))
    expect(onChange).toHaveBeenCalledWith('JP')
  })
})
