import type { Strapi5Error } from '@nuxtjs/strapi'

export interface StrapiValidationError {
  path: string[]
  message: string
  name: string
}

export type StrapiFieldErrors = Record<string, string>

export interface ParsedStrapiError {
  name: string | undefined
  message: string
  fieldErrors: StrapiFieldErrors
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.'

export function parseStrapiError(error: unknown): ParsedStrapiError {
  const strapiError = error as Strapi5Error | undefined
  const details = strapiError?.error?.details

  const fieldErrors: StrapiFieldErrors = {}
  if (details && Array.isArray(details.errors)) {
    for (const err of details.errors as StrapiValidationError[]) {
      const field = err.path?.[0]
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = err.message
      }
    }
  }

  const message = strapiError?.error?.message || DEFAULT_MESSAGE

  return { name: strapiError?.error?.name, message, fieldErrors }
}
