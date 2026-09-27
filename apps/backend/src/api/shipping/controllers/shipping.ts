/**
 * shipping controller
 */

import { factories } from '@strapi/strapi'

const UID = 'api::shipping.shipping'

export default factories.createCoreController(UID, ({ strapi }) => ({
  async getRates(ctx) {
    const { addressId } = ctx.request.body as { addressId: string }
    const userId = ctx.state.user?.id

    if (!addressId) {
      return ctx.badRequest('addressId is required')
    }
    if (!userId) {
      return ctx.unauthorized('Authentication required')
    }

    ctx.body = await strapi.service(UID).getRates(addressId, userId)
  },
}))
