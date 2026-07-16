import type { StrapiDocument, StrapiMedia } from './common'

export interface GlobalSettings extends StrapiDocument {
  siteName: string
  siteDescription: string | null
  favicon: StrapiMedia | null
}
