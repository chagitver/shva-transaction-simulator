import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n'
import { TimePicker } from './TimePicker'

describe('TimePicker', () => {
  it('applies valid hour and minute values', () => {
    const onChange = vi.fn()
    render(<TimePicker value="14:24" text={messages.en} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: messages.en.time }))
    fireEvent.change(screen.getByLabelText(messages.en.hour), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText(messages.en.minute), { target: { value: '05' } })
    fireEvent.click(screen.getByRole('button', { name: messages.en.ok }))

    expect(onChange).toHaveBeenCalledWith('20:05')
  })

  it('does not apply draft values when cancelled', () => {
    const onChange = vi.fn()
    render(<TimePicker value="14:24" text={messages.en} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: messages.en.time }))
    fireEvent.change(screen.getByLabelText(messages.en.hour), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: messages.en.cancel }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('allows backspace, clearing, and retyping without moving the cursor', () => {
    const onChange = vi.fn()
    render(<TimePicker value="20:30" text={messages.en} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: messages.en.time }))
    const hour = screen.getByLabelText(messages.en.hour)

    fireEvent.change(hour, { target: { value: '2' } })
    expect(hour).toHaveValue('2')
    fireEvent.change(hour, { target: { value: '' } })
    expect(hour).toHaveValue('')
    fireEvent.change(hour, { target: { value: '9' } })
    expect(hour).toHaveValue('9')
    fireEvent.click(screen.getByRole('button', { name: messages.en.ok }))

    expect(onChange).toHaveBeenCalledWith('09:30')
  })

  it('supports arrow-key adjustment', () => {
    const onChange = vi.fn()
    render(<TimePicker value="23:00" text={messages.en} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: messages.en.time }))
    const hour = screen.getByLabelText(messages.en.hour)
    fireEvent.keyDown(hour, { key: 'ArrowUp' })
    expect(hour).toHaveValue('00')
  })
})
