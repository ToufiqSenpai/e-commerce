import type { StrapiDocument } from './common'
import type { Address } from './address'

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  weight: number
}

export interface ShippingInfo {
  courierId: string
  courierName: string
  serviceId: string
  serviceName: string
  price: number
  etdMin: number
  etdMax: number
}

export interface Order extends StrapiDocument {
  orderStatus: OrderStatus
  midtransOrderId?: string
  midtransSnapToken?: string
  biteshipOrderId?: string
  waybillId?: string
  items: OrderItem[]
  shipping: ShippingInfo
  address?: Address | string | null
  users_permissions_user?: unknown
}

export interface TrackingHistoryEntry {
  service_type: string
  status: string
  note: string
  updated_at: string
}

export interface TrackingCourier {
  tracking_id: string
  waybill_id: string
  company: string
  type: string
  history: TrackingHistoryEntry[]
}

export interface TrackingResponse {
  success: boolean
  status: string
  courier: TrackingCourier
}

export interface CreateShipmentResponse {
  biteshipOrderId: string
  waybillId: string
  status: string
}
