import type { StrapiDocument } from './common'
import type { StrapiUser } from './user'

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
  users_permissions_user?: StrapiUser | string | null
}

export interface AreaResponse {
  data: Area[]
}

export interface Area {
  code: string
  name: string
}
