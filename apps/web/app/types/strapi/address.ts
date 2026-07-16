import type { StrapiDocument } from './common'

export interface Address extends StrapiDocument {
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  postalCode: string
  address: string
  latitude: number
  longitude: number
  isDefault: boolean | null
  users_permissions_user?:
    | {
        id: number | string
        documentId: string
        username: string
        email: string
        provider: string
        confirmed: boolean | null
        blocked: boolean | null
        createdAt?: string
        updatedAt?: string
        publishedAt?: string
      }
    | string
    | null
}

export interface AreaResponse {
  data: Area[]
}

export interface Area {
  code: string
  name: string
}
