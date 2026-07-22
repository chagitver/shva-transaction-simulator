export type Locale = 'en' | 'he'

export interface LocalizedName {
  en: string
  he: string
}

export interface Region {
  code: string
  name: LocalizedName
  timeZoneId: string
}

export interface Transaction {
  id: string
  regionCode: string
  regionName: LocalizedName
  timeZoneId: string
  submittedAtUtc: string
  localDateTime: string
  localTime: string
  status: 'Approved' | 'Rejected'
}

export interface User {
  id: string
  email: string
  displayName: string
}
