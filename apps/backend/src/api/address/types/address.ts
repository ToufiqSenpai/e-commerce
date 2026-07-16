import type { Data, Core } from '@strapi/types'
import type { Context } from 'koa'
import type { ApiAddressAddress } from '../../../../types/generated/contentTypes'

export type Address = Data.ContentType<'api::address.address'>

export type AddressInput = Omit<
  ApiAddressAddress['attributes'],
  'users_permissions_user' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'createdBy' | 'updatedBy'
>

interface ContentTypeControllerBase {
  transformResponse<TData>(data: TData, meta?: object): unknown
  sanitizeOutput<TData>(data: TData, ctx: Context): Promise<TData>
  sanitizeInput<TData>(data: TData, ctx: Context): Promise<TData>
  sanitizeQuery(ctx: Context): Promise<Record<string, unknown>>
  validateInput<TData>(data: TData, ctx: Context): Promise<void>
  validateQuery(ctx: Context): Promise<void>
}

export type AddressController = ContentTypeControllerBase & Core.Controller
