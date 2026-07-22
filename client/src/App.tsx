import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApprovedTransactions, getCurrentUser, getRegions, logout, simulateTransaction } from './api'
import { messages } from './i18n'
import type { Locale, Transaction } from './types'
import { RegionCombobox } from './components/RegionCombobox'
import { TimePicker } from './components/TimePicker'
import { TransactionCarousel } from './components/TransactionCarousel'
import { AuthScreen } from './components/AuthScreen'

function currentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function selectedTimeToIso(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  const moment = new Date()
  moment.setHours(hours, minutes, 0, 0)
  return moment.toISOString()
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('shva-locale') === 'he' ? 'he' : 'en')
  const [regionCode, setRegionCode] = useState('')
  const [time, setTime] = useState(currentTime)
  const [result, setResult] = useState<Transaction | null>(null)
  const queryClient = useQueryClient()
  const text = messages[locale]

  const authQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: getCurrentUser, retry: false })
  const regionsQuery = useQuery({ queryKey: ['regions'], queryFn: getRegions })
  const approvedQuery = useQuery({
    queryKey: ['transactions', 'approved'],
    queryFn: getApprovedTransactions,
    enabled: Boolean(authQuery.data),
  })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null)
      queryClient.removeQueries({ queryKey: ['transactions'] })
      setResult(null)
    },
  })
  const mutation = useMutation({
    mutationFn: (selectedTime: string) => simulateTransaction(regionCode, selectedTimeToIso(selectedTime)),
    onSuccess: (transaction) => {
      setResult(transaction)
      if (transaction.status === 'Approved') {
        queryClient.invalidateQueries({ queryKey: ['transactions', 'approved'] })
      }
    },
  })

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr'
    localStorage.setItem('shva-locale', locale)
  }, [locale])

  useEffect(() => {
    if (!regionCode && regionsQuery.data?.length) setRegionCode(regionsQuery.data[0].code)
  }, [regionCode, regionsQuery.data])

  const resultCopy = useMemo(() => result?.status === 'Approved'
    ? { title: text.approved, detail: text.approvedDetail }
    : { title: text.rejected, detail: text.rejectedDetail }, [result?.status, text])

  const confirmTime = (selectedTime: string) => {
    setTime(selectedTime)
    setResult(null)
    mutation.mutate(selectedTime)
  }

  const loadingError = authQuery.isError || regionsQuery.isError || approvedQuery.isError

  return (
    <div className="app-shell">
      <header className="site-header">
        <img src="/assets/shva-logo-transparent.png" alt="Shva" className="brand-logo" />
        <div className="header-actions">
          {authQuery.data && (
            <div className="user-menu">
              <span>{text.hello}, {authQuery.data.displayName}</span>
              <button type="button" onClick={() => logoutMutation.mutate()}>{text.logout}</button>
            </div>
          )}
          <div className="language-switch" role="group" aria-label="Language">
            <button className={locale === 'en' ? 'active' : ''} type="button" onClick={() => setLocale('en')}>ENG</button>
            <button className={locale === 'he' ? 'active' : ''} type="button" onClick={() => setLocale('he')}>עברית</button>
          </div>
        </div>
      </header>

      {authQuery.isLoading ? (
        <div className="auth-loading" aria-label="Loading" />
      ) : !authQuery.data ? (
        <AuthScreen text={text} />
      ) : <main>
        <section className="hero-section">
          <div className="hero-heading">
            <span>{text.simulator}</span>
            <h1>{text.question}</h1>
          </div>

          {loadingError ? (
            <div className="global-error" role="alert">{text.loadError}</div>
          ) : (
            <div className="simulator-stage">
              <div className="simulator-form">
                <RegionCombobox
                  regions={regionsQuery.data ?? []}
                  value={regionCode}
                  locale={locale}
                  text={text}
                  onChange={(nextRegion) => {
                    setRegionCode(nextRegion)
                    setResult(null)
                  }}
                />
                <TimePicker
                  value={time}
                  text={text}
                  disabled={!regionCode || mutation.isPending}
                  onConfirm={confirmTime}
                />
                {mutation.isError && <p className="form-error" role="alert">{text.submitError}</p>}
                {result && (
                  <div className={`result-banner ${result.status.toLowerCase()}`} role="status">
                    <span className="result-icon" aria-hidden="true">{result.status === 'Approved' ? '✓' : '!'}</span>
                    <div>
                      <strong>{resultCopy.title}</strong>
                      <p>{resultCopy.detail} <bdi>{result.localTime}</bdi> · {result.regionName[locale]}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="artwork-wrap" aria-hidden="true">
                <img src="/assets/shva-hero-transparent.png" alt="" />
              </div>
            </div>
          )}
        </section>

        {!loadingError && (
          <TransactionCarousel transactions={approvedQuery.data ?? []} locale={locale} text={text} />
        )}
      </main>}
    </div>
  )
}
