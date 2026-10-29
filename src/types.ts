export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
}

export interface RecentLink {
  code: string
  shortUrl: string
  originalUrl: string
  createdAt: string
}

export interface ShortenedLink {
  code: string
  shortUrl: string
  originalUrl: string
}
