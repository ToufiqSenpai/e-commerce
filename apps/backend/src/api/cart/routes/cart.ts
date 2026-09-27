/**
 * cart router
 */

import { factories } from '@strapi/strapi'

const coreRouter = factories.createCoreRouter('api::cart.cart')

export default {
  type: coreRouter.type,
  prefix: coreRouter.prefix,
  get routes() {
    const coreRoutes = typeof coreRouter.routes === 'function' ? coreRouter.routes() : coreRouter.routes
    return coreRoutes
  },
}
