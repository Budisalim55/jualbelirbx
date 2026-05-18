export type Listing = {
  id: string
  seller_id: string
  title: string
  description: string
  category: string // 'limited', 'robux', 'account', 'gamepass', 'other'
  price_idr: number
  image_url: string | null
  status: 'active' | 'sold' | 'paused'
  created_at: string
  seller?: Profile
}

export type Profile = {
  id: string
  username: string
  whatsapp: string | null
  discord: string | null
  avatar_url: string | null
  rating_avg: number
  rating_count: number
  created_at: string
}

export const CATEGORIES = [
  { id: 'limited', label: 'Limited Item' },
  { id: 'robux', label: 'Robux' },
  { id: 'gamepass', label: 'Gamepass' },
  { id: 'account', label: 'Akun Roblox' },
  { id: 'other', label: 'Lainnya' },
] as const
