/**
 * order controller
 */

import { factories } from '@strapi/strapi'

const UID = 'api::order.order'

export default factories.createCoreController(UID, ({ strapi }) => ({
  async checkout(ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized('Authentication required')

    const { addressId, shipping } = ctx.request.body as {
      addressId: string
      shipping: {
        courierId: string
        courierName: string
        serviceId: string
        serviceName: string
        price: number
        etdMin: number
        etdMax: number
      }
    }

    if (!addressId || !shipping) {
      return ctx.badRequest('addressId and shipping are required')
    }

    try {
      const origin = ctx.get('Origin') || ctx.request.origin
      ctx.body = await strapi.service(UID).checkout({ addressId, shipping }, user.id, origin)
    } catch (e: any) {
      return ctx.badRequest(e.message)
    }
  },

  async webhook(ctx) {
    const payload = ctx.request.body

    strapi.log.info(`[webhook] received: ${JSON.stringify(payload)}`)

    if (!payload) {
      return ctx.badRequest('No payload')
    }

    try {
      ctx.body = await strapi.service(UID).handleWebhook(payload)
    } catch (e: any) {
      strapi.log.error(`[webhook] failed: ${e.message}`)
      return ctx.badRequest(e.message)
    }
  },

  async createShipment(ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized('Authentication required')

    const { id } = ctx.params as { id: string }

    try {
      ctx.body = await strapi.service(UID).createShipment(id, user.id)
    } catch (e: any) {
      return ctx.badRequest(e.message)
    }
  },

  async tracking(ctx) {
    const { user } = ctx.state
    if (!user) return ctx.unauthorized('Authentication required')

    const { id } = ctx.params as { id: string }

    try {
      ctx.body = await strapi.service(UID).getTracking(id, user.id)
    } catch (e: any) {
      return ctx.badRequest(e.message)
    }
  },
}))
