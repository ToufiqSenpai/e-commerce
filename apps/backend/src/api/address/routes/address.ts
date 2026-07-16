/**
 * address router
 */

import { factories } from '@strapi/strapi'
import * as z from 'zod/v4'

const areaResponse = z.object({
  data: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
    }),
  ),
})

const coreRouter = factories.createCoreRouter('api::address.address')

const customRoutes = [
  {
    method: 'GET',
    path: '/addresses/provinces',
    handler: 'address.getProvinces',
    config: {
      policies: [],
    },
    response: areaResponse,
  },
  {
    method: 'GET',
    path: '/addresses/regencies/:provincesId',
    handler: 'address.getRegencies',
    config: {
      policies: [],
    },
    response: areaResponse,
  },
  {
    method: 'GET',
    path: '/addresses/districts/:regenciesId',
    handler: 'address.getDistricts',
    config: {
      policies: [],
    },
    response: areaResponse,
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
