import { useEffect, useState } from 'react'
import type { Messages } from '../i18n'

interface Props {
  value: string
  text: Messages
  disabled?: boolean
  onConfirm: (value: string) => void
}

function splitTime(value: string) {
  const [hour = '00', minute = '00'] = value.split(':')
  return { hour, minute }
}

export function TimePicker({ value, text, disabled = false, onConfirm }: Props) {
  const [draft, setDraft] = useState(splitTime(value))

  useEffect(() => setDraft(splitTime(value)), [value])

  const editValue = (raw: string) => raw.replace(/\D/g, '').slice(0, 2)
  const normalize = (raw: string, maximum: number) =>
    String(Math.min(Number(raw || '0'), maximum)).padStart(2, '0')

  const adjustWithArrow = (raw: string, maximum: number, direction: number) => {
    const current = Number(raw || '0')
    const next = (current + direction + maximum + 1) % (maximum + 1)
    return String(next).padStart(2, '0')
  }

  return (
    <div className="time-field">
      <div className="time-picker" role="group" aria-label={text.time}>
        <p>{text.time}</p>
        <div className="time-inputs" dir="ltr">
          <div>
            <input
              value={draft.hour}
              inputMode="numeric"
              maxLength={2}
              aria-label={text.hour}
              onFocus={(event) => event.target.select()}
              onChange={(event) => setDraft((current) => ({ ...current, hour: editValue(event.target.value) }))}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  setDraft((current) => ({ ...current, hour: adjustWithArrow(current.hour, 23, event.key === 'ArrowUp' ? 1 : -1) }))
                }
              }}
            />
            <small>{text.hour}</small>
          </div>
          <b>:</b>
          <div>
            <input
              value={draft.minute}
              inputMode="numeric"
              maxLength={2}
              aria-label={text.minute}
              onFocus={(event) => event.target.select()}
              onChange={(event) => setDraft((current) => ({ ...current, minute: editValue(event.target.value) }))}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  setDraft((current) => ({ ...current, minute: adjustWithArrow(current.minute, 59, event.key === 'ArrowUp' ? 1 : -1) }))
                }
              }}
            />
            <small>{text.minute}</small>
          </div>
        </div>
        <div className="time-footer" dir="ltr">
          <span className="time-mode-icon" aria-hidden="true">◷</span>
          <div className="time-actions">
            <button type="button" onClick={() => setDraft(splitTime(value))}>{text.cancel}</button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const hour = normalize(draft.hour, 23)
                const minute = normalize(draft.minute, 59)
                const nextValue = `${hour}:${minute}`
                setDraft(splitTime(nextValue))
                onConfirm(nextValue)
              }}
            >{text.ok}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
