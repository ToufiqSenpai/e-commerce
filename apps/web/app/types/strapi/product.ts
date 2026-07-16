import type { StrapiDocument, StrapiMedia, StrapiRichTextField } from './common'

export interface ProductCategory extends StrapiDocument {
  name: string
  slug: string
  icon: StrapiMedia | null
}

export interface Product extends StrapiDocument {
  name: string
  slug: string
  description: StrapiRichTextField // Blocks type in Strapi v5
  price: number
  stock: number
  weight: number
  width: number
  height: number
  length: number
  images: StrapiMedia[]
  product_category: ProductCategory | null // Relation field name in backend
}
