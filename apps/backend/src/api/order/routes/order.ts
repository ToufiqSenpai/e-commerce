/**
 * order router
 */

import { factories } from '@strapi/strapi'

const coreRouter = factories.createCoreRouter('api::order.order')

const customRoutes = [
  {
    method: 'POST',
    path: '/orders/checkout',
    handler: 'order.checkout',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/orders/webhook',
    handler: 'order.webhook',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/orders/:id/shipment',
    handler: 'order.createShipment',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/orders/:id/tracking',
    handler: 'order.tracking',
    config: {
      policies: [],
    },
  },
]

export default {
  type: coreRouter.type,
  prefix: coreRouter.prefix,
  get routes() {
    const coreRoutes = typeof coreRouter.routes === 'function' ? coreRouter.routes() : coreRouter.routes
    return [...customRoutes, ...coreRoutes]
  },
}
