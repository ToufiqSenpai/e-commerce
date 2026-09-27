/**
 * shipping service
 */

import { factories } from '@strapi/strapi'

interface BiteshipBaseResponse {
  success: boolean
  object: string
}

interface BiteshipRatePricing {
  courier_code: string
  courier_name: string
  courier_service_code: string
  courier_service_name: string
  shipping_fee: number
  shipment_duration_range: string
  shipment_duration_unit: string
}

interface BiteshipRatesResponse extends BiteshipBaseResponse {
  object: 'courier_pricing'
  pricing: BiteshipRatePricing[]
}

interface ShippingRate {
  courierId: string
  courierName: string
  serviceId: string
  serviceName: string
  price: number
  etdMin: number
  etdMax: number
}

const BITESHIP_BASE_URL = 'https://api.biteship.com/v1'
const ORIGIN_LATITUDE = -6.1751
const ORIGIN_LONGITUDE = 106.8650
const COURIERS = 'jne,jnt,sicepat'

function parseDurationRange(range: string): { etdMin: number; etdMax: number } {
  const parts = range.split('-').map((s) => parseInt(s.trim(), 10))
  return {
    etdMin: parts[0] || 0,
    etdMax: parts[parts.length - 1] || 0,
  }
}

export default factories.createCoreService('api::shipping.shipping', () => ({
  async getRates(addressId: string, userId: number): Promise<ShippingRate[]> {
    const apiKey = process.env.BITESHIP_API_KEY

    const [address, carts] = await Promise.all([
      strapi.documents('api::address.address').findOne({ documentId: addressId }),
      strapi.documents('api::cart.cart').findMany({
        filters: { users_permissions_user: { id: userId } },
        populate: ['product'],
      }),
    ])

    if (!address) {
      throw new Error('Address not found')
    }

    const destinationLatitude = Number(address.latitude)
    const destinationLongitude = Number(address.longitude)

    const items = carts.map((cart: any) => ({
      name: cart.product?.name || 'Item',
      value: cart.price,
      weight: cart.product?.weight || 1000,
      quantity: cart.quantity,
    }))

    const response = await fetch(`${BITESHIP_BASE_URL}/rates/couriers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        origin_latitude: ORIGIN_LATITUDE,
        origin_longitude: ORIGIN_LONGITUDE,
        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,
        couriers: COURIERS,
        items,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Biteship API error: ${response.status} ${response.statusText} — ${errorBody}`)
    }

    const data = (await response.json()) as BiteshipRatesResponse

    return data.pricing.map((p): ShippingRate => {
      const { etdMin, etdMax } = parseDurationRange(p.shipment_duration_range)
      return {
        courierId: p.courier_code,
        courierName: p.courier_name,
        serviceId: p.courier_service_code,
        serviceName: p.courier_service_name,
        price: p.shipping_fee,
        etdMin,
        etdMax,
      }
    })
  },
}))
