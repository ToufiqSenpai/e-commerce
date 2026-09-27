/**
 * Biteship API integration service
 * Handles order creation and tracking retrieval
 */

const BITESHIP_BASE_URL = 'https://api.biteship.com/v1'

interface BiteshipItem {
  name: string
  description?: string
  value: number
  quantity: number
  weight: number
  height?: number
  length?: number
  width?: number
}

interface BiteshipCreateOrderPayload {
  shipper_contact_name?: string
  shipper_contact_phone?: string
  shipper_contact_email?: string
  shipper_organization?: string
  origin_contact_name: string
  origin_contact_phone: string
  origin_address: string
  origin_note?: string
  origin_coordinate: { latitude: number; longitude: number }
  destination_contact_name: string
  destination_contact_phone: string
  destination_address: string
  destination_coordinate: { latitude: number; longitude: number }
  courier_company: string
  courier_type: string
  delivery_type: 'now' | 'scheduled'
  reference_id?: string
  items: BiteshipItem[]
}

interface BiteshipCourier {
  tracking_id: string
  waybill_id: string
  company: string
  type: string
  history?: Array<{
    service_type: string
    status: string
    note: string
    updated_at: string
  }>
}

interface BiteshipOrderResponse {
  success: boolean
  message: string
  id: string
  courier: BiteshipCourier
  status: string
}

interface BiteshipTrackingResponse {
  success: boolean
  status: string
  courier: BiteshipCourier
}

function getApiKey(): string {
  const key = process.env.BITESHIP_API_KEY
  if (!key) {
    throw new Error('BITESHIP_API_KEY environment variable is not set')
  }
  return key
}

async function handleResponse<T>(response: Response, context: string): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Biteship ${context} error: ${response.status} ${response.statusText} — ${errorBody}`)
  }
  return response.json() as Promise<T>
}

export const createOrder = async (payload: BiteshipCreateOrderPayload): Promise<BiteshipOrderResponse> => {
  const response = await fetch(`${BITESHIP_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<BiteshipOrderResponse>(response, 'createOrder')
}

export const getTracking = async (orderId: string): Promise<BiteshipTrackingResponse> => {
  const response = await fetch(`${BITESHIP_BASE_URL}/trackings/${orderId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
  })
  return handleResponse<BiteshipTrackingResponse>(response, 'getTracking')
}
