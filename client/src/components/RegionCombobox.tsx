import { useEffect, useRef, useState } from 'react'
import type { Locale, Region } from '../types'
import type { Messages } from '../i18n'

interface Props {
  regions: Region[]
  value: string
  locale: Locale
  text: Messages
  onChange: (code: string) => void
}

export function RegionCombobox({ regions, value, locale, text, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = regions.find((region) => region.code === value)
  const filtered = regions.filter((region) =>
    `${region.name.en} ${region.name.he}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  )

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return (
    <div className="field region-field" ref={rootRef}>
      <label id="region-label">{text.region}</label>
      <button
        type="button"
        className="select-trigger"
        aria-labelledby="region-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.name[locale] ?? text.region}</span>
        <span className="chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="region-popover">
          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchRegion}
              aria-label={text.searchRegion}
            />
            {query && (
              <button type="button" aria-label={text.close} onClick={() => setQuery('')}>×</button>
            )}
          </div>
          <ul role="listbox" aria-labelledby="region-label">
            {filtered.map((region) => (
              <li key={region.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={region.code === value}
                  onClick={() => {
                    onChange(region.code)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  <span>{region.name[locale]}</span>
                  <small>{region.timeZoneId}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
