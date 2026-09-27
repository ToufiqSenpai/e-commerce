/**
 * shipping router
 */

import { factories } from '@strapi/strapi'

const coreRouter = factories.createCoreRouter('api::shipping.shipping')

const customRoutes = [
  {
    method: 'POST',
    path: '/shipping/rates',
    handler: 'shipping.getRates',
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
