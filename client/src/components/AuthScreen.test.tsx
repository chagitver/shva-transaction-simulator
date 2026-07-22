import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n'
import { AuthScreen } from './AuthScreen'

describe('AuthScreen', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('switches between localized login and signup forms', () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <AuthScreen text={messages.en} />
      </QueryClientProvider>,
    )

    expect(screen.queryByLabelText(messages.en.name)).not.toBeInTheDocument()
    expect(screen.getByLabelText(messages.en.email)).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText(messages.en.password, { exact: false })).toHaveAttribute('autocomplete', 'current-password')
    fireEvent.click(screen.getByRole('tab', { name: messages.en.signup }))
    expect(screen.getByLabelText(messages.en.name)).toBeInTheDocument()
    expect(screen.getByLabelText(messages.en.password, { exact: false })).toHaveAttribute('autocomplete', 'new-password')
    expect(screen.getByRole('button', { name: messages.en.signup })).toBeInTheDocument()
  })

  it('shows a specific message when the email is already registered', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      title: 'An account with this email already exists.',
      status: 409,
      code: 'duplicate_email',
    }), { status: 409, headers: { 'Content-Type': 'application/problem+json' } })))
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <AuthScreen text={messages.en} />
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getByRole('tab', { name: messages.en.signup }))
    fireEvent.change(screen.getByLabelText(messages.en.name), { target: { value: 'Existing User' } })
    fireEvent.change(screen.getByLabelText(messages.en.email), { target: { value: 'existing@example.com' } })
    fireEvent.change(screen.getByLabelText(messages.en.password, { exact: false }), { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: messages.en.signup }))

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.en.emailExists)
  })
})
