/**
 * cart controller
 */

import { factories } from '@strapi/strapi'
import type { CartController, CartInput } from '../types/cart'

const UID = 'api::cart.cart'

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(this: CartController, ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized(`You're not logged in!`)

    await this.validateQuery(ctx)
    const sanitizedQuery = (await this.sanitizeQuery(ctx)) as Record<string, unknown>

    const { results, pagination } = await strapi.service(UID).find({
      ...sanitizedQuery,
      filters: { ...(sanitizedQuery.filters as Record<string, unknown>), users_permissions_user: user.id },
    })

    const sanitizedResults = await this.sanitizeOutput(results, ctx)
    return this.transformResponse(sanitizedResults, { pagination })
  },

  async findOne(this: CartController, ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized(`You're not logged in!`)

    const { id } = ctx.params
    await this.validateQuery(ctx)
    const sanitizedQuery = (await this.sanitizeQuery(ctx)) as Record<string, unknown>

    const entity = await strapi.service(UID).findOne(id, {
      ...sanitizedQuery,
      filters: { users_permissions_user: user.id },
    })

    if (!entity) return ctx.notFound('Cart item not found')

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
    return this.transformResponse(sanitizedEntity)
  },

  async create(this: CartController, ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized(`You're not logged in!`)

    await this.validateQuery(ctx)
    const sanitizedQuery = (await this.sanitizeQuery(ctx)) as Record<string, unknown>

    const { body } = ctx.request
    if (!body || !body.data) {
      return ctx.badRequest('Missing "data" payload in the request body')
    }

    await this.validateInput(body.data, ctx)
    const sanitizedInputData = (await this.sanitizeInput(body.data, ctx)) as CartInput

    const entity = await strapi.service(UID).create({
      ...sanitizedQuery,
      data: { ...sanitizedInputData, users_permissions_user: user.id },
    })

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
    ctx.status = 201
    return this.transformResponse(sanitizedEntity)
  },

  async update(this: CartController, ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized(`You're not logged in!`)

    const { id } = ctx.params
    await this.validateQuery(ctx)
    const sanitizedQuery = (await this.sanitizeQuery(ctx)) as Record<string, unknown>

    const { body } = ctx.request
    if (!body || !body.data) {
      return ctx.badRequest('Missing "data" payload in the request body')
    }

    const existing = await strapi.service(UID).findOne(id, {
      filters: { users_permissions_user: user.id },
    })
    if (!existing) return ctx.notFound('Cart item not found')

    await this.validateInput(body.data, ctx)
    const sanitizedInputData = (await this.sanitizeInput(body.data, ctx)) as CartInput

    const entity = await strapi.service(UID).update(id, {
      ...sanitizedQuery,
      data: { ...sanitizedInputData, users_permissions_user: user.id },
    })

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
    return this.transformResponse(sanitizedEntity)
  },

  async delete(this: CartController, ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized(`You're not logged in!`)

    const { id } = ctx.params
    await this.validateQuery(ctx)
    const sanitizedQuery = (await this.sanitizeQuery(ctx)) as Record<string, unknown>

    const existing = await strapi.service(UID).findOne(id, {
      filters: { users_permissions_user: user.id },
    })
    if (!existing) return ctx.notFound('Cart item not found')

    await strapi.service(UID).delete(id, sanitizedQuery)
    ctx.status = 204
  },
}))
