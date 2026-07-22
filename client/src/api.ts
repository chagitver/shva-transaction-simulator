import type { Region, Transaction, User } from './types'

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    const fieldMessage = problem?.errors && Object.values(problem.errors).flat().find((value) => typeof value === 'string')
    throw new ApiError(
      response.status,
      fieldMessage ?? problem?.detail ?? problem?.title ?? 'The request could not be completed.',
      problem?.code,
    )
  }

  return response.json() as Promise<T>
}

export const getRegions = () => request<Region[]>('/api/regions')
export const getApprovedTransactions = () => request<Transaction[]>('/api/transactions/approved')
export const simulateTransaction = (regionCode: string, submittedAtUtc: string) =>
  request<Transaction>('/api/transactions/simulate', {
    method: 'POST',
    body: JSON.stringify({ regionCode, submittedAtUtc }),
  })

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await request<User>('/api/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export const register = (displayName: string, email: string, password: string) =>
  request<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ displayName, email, password }),
  })

export const login = (email: string, password: string) =>
  request<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export async function logout() {
  const response = await fetch('/api/auth/logout', { method: 'POST', body: '', credentials: 'include' })
  if (!response.ok) throw new ApiError(response.status, 'Logout failed.')
}
