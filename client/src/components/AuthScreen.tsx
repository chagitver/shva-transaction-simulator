import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login, register } from '../api'
import type { Messages } from '../i18n'
import type { User } from '../types'

interface Props {
  text: Messages
}

export function AuthScreen({ text }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => mode === 'login' ? login(email, password) : register(displayName, email, password),
    onSuccess: (user: User) => {
      queryClient.setQueryData(['auth', 'me'], user)
      queryClient.invalidateQueries({ queryKey: ['transactions', 'approved'] })
    },
  })

  const switchMode = () => {
    setMode((current) => current === 'login' ? 'signup' : 'login')
    mutation.reset()
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-mark" aria-hidden="true">S</div>
        <h1 id="auth-title">{text.welcome}</h1>
        <p>{text.authIntro}</p>
        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); mutation.reset() }}>{text.login}</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); mutation.reset() }}>{text.signup}</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}>
          {mode === 'signup' && (
            <label>
              <span>{text.name}</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={80} required autoComplete="name" />
            </label>
          )}
          <label>
            <span>{text.email}</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label>
            <span>{text.password}</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            <small>{text.passwordHint}</small>
          </label>
          {mutation.isError && <p className="auth-error" role="alert">{text.authError}</p>}
          <button className="auth-submit" disabled={mutation.isPending} type="submit">
            {mode === 'login' ? text.login : text.signup}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? text.noAccount : text.hasAccount}{' '}
          <button type="button" onClick={switchMode}>{mode === 'login' ? text.signup : text.login}</button>
        </p>
      </section>
    </main>
  )
}
