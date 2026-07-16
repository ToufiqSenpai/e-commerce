/**
 * address service
 */

import { factories } from '@strapi/strapi'
import type { WilayahIdArea } from '../types/wilayah-id'

const WILAYAH_BASE_URL = 'https://wilayah.id/api'
const FETCH_TIMEOUT_MS = 5000

export class InvalidAreaIdError extends Error {}

const AREA_ID_PATTERNS: Record<'province' | 'regency' | 'district', RegExp> = {
  province: /^\d{2}$/,
  regency: /^\d{2}\.\d{2}$/,
  district: /^\d{2}\.\d{2}\.\d{2}$/,
}

function assertValidAreaId(id: string, level: 'province' | 'regency' | 'district'): void {
  if (!AREA_ID_PATTERNS[level].test(id)) {
    throw new InvalidAreaIdError(`Invalid ${level} id`)
  }
}

async function fetchWilayahAreas(path: string): Promise<{ data: WilayahIdArea[] }> {
  let response: Response
  try {
    response = await fetch(`${WILAYAH_BASE_URL}/${path}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch {
    throw new Error('Failed to reach the regional data service')
  }

  if (!response.ok) {
    throw new Error('The regional data service returned an error')
  }

  const json = (await response.json()) as { data: WilayahIdArea[] }
  return { data: json.data }
}

export default factories.createCoreService('api::address.address', () => ({
  async getProvinces(): Promise<{ data: WilayahIdArea[] }> {
    return fetchWilayahAreas('provinces.json')
  },
  async getRegencies(provincesId: string): Promise<{ data: WilayahIdArea[] }> {
    assertValidAreaId(provincesId, 'province')
    return fetchWilayahAreas(`regencies/${provincesId}.json`)
  },
  async getDistricts(regenciesId: string): Promise<{ data: WilayahIdArea[] }> {
    assertValidAreaId(regenciesId, 'regency')
    return fetchWilayahAreas(`districts/${regenciesId}.json`)
  },
}))
