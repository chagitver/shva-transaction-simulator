import { useEffect, useRef, useState } from 'react'
import type { Messages } from '../i18n'

interface Props {
  value: string
  text: Messages
  onChange: (value: string) => void
}

function splitTime(value: string) {
  const [hour = '00', minute = '00'] = value.split(':')
  return { hour, minute }
}

export function TimePicker({ value, text, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(splitTime(value))
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => setDraft(splitTime(value)), [value])

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const editValue = (raw: string) => raw.replace(/\D/g, '').slice(0, 2)
  const normalize = (raw: string, maximum: number) =>
    String(Math.min(Number(raw || '0'), maximum)).padStart(2, '0')

  const adjustWithArrow = (raw: string, maximum: number, direction: number) => {
    const current = Number(raw || '0')
    const next = (current + direction + maximum + 1) % (maximum + 1)
    return String(next).padStart(2, '0')
  }

  return (
    <div className="field time-field" ref={rootRef}>
      <label id="time-label">{text.time}</label>
      <button
        type="button"
        className="time-trigger"
        aria-labelledby="time-label"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">◷</span>
        <strong dir="ltr">{value}</strong>
      </button>
      {open && (
        <div className="time-popover" role="dialog" aria-label={text.time}>
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
          <div className="time-actions">
            <button type="button" onClick={() => { setDraft(splitTime(value)); setOpen(false) }}>{text.cancel}</button>
            <button
              type="button"
              onClick={() => {
                const hour = normalize(draft.hour, 23)
                const minute = normalize(draft.minute, 59)
                onChange(`${hour}:${minute}`)
                setOpen(false)
              }}
            >{text.ok}</button>
          </div>
        </div>
      )}
    </div>
  )
}
