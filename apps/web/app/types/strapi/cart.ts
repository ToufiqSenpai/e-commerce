import type { StrapiDocument } from './common'
import type { Product } from './product'
import type { StrapiUser } from './user'

export interface Cart extends StrapiDocument {
  quantity: number
  price: number
  product?: Product | string | null
  users_permissions_user?: StrapiUser | string | null
}
