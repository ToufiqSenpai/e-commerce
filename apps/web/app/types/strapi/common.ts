export interface StrapiDocument {
  id: number | string
  documentId: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface StrapiMediaFormat {
  name: string
  hash: string
  ext: string
  mime: string
  path: string | null
  width: number
  height: number
  size: number
  sizeInBytes: number
  url: string
}

export interface StrapiMedia extends StrapiDocument {
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: {
    thumbnail?: StrapiMediaFormat
    small?: StrapiMediaFormat
    medium?: StrapiMediaFormat
    large?: StrapiMediaFormat
  } | null
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: unknown | null
}

export interface StrapiInlineTextNode {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export interface StrapiInlineLinkNode {
  type: 'link'
  url: string
  children: StrapiInlineTextNode[]
}

export type StrapiInlineNode = StrapiInlineTextNode | StrapiInlineLinkNode

export interface StrapiParagraphBlock {
  type: 'paragraph'
  children: StrapiInlineNode[]
}

export interface StrapiHeadingBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: StrapiInlineNode[]
}

export interface StrapiQuoteBlock {
  type: 'quote'
  children: StrapiInlineNode[]
}

export interface StrapiCodeBlock {
  type: 'code'
  children: StrapiInlineTextNode[]
}

export interface StrapiListItemBlock {
  type: 'list-item'
  children: StrapiInlineNode[]
}

export interface StrapiListBlock {
  type: 'list'
  format: 'ordered' | 'unordered'
  children: StrapiListItemBlock[]
}

export interface StrapiImageBlock {
  type: 'image'
  image: {
    name: string
    alternativeText: string | null
    url: string
    width: number
    height: number
    size?: number
    mime?: string
    formats?: unknown
  }
  children: StrapiInlineTextNode[]
}

export type StrapiBlockNode =
  | StrapiParagraphBlock
  | StrapiHeadingBlock
  | StrapiQuoteBlock
  | StrapiCodeBlock
  | StrapiListBlock
  | StrapiListItemBlock
  | StrapiImageBlock

export type StrapiRichTextField = StrapiBlockNode[]
