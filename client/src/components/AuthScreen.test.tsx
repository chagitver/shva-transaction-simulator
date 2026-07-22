import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messages } from '../i18n'
import { AuthScreen } from './AuthScreen'

describe('AuthScreen', () => {
  it('switches between localized login and signup forms', () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <AuthScreen text={messages.en} />
      </QueryClientProvider>,
    )

    expect(screen.queryByLabelText(messages.en.name)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: messages.en.signup }))
    expect(screen.getByLabelText(messages.en.name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: messages.en.signup })).toBeInTheDocument()
  })
})
