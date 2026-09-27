import type { StrapiDocument } from './common'

export interface StrapiUser extends StrapiDocument {
  username: string
  email: string
  provider: string
  confirmed: boolean | null
  blocked: boolean | null
}
