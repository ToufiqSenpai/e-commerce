/**
 * order service
 */

import { factories } from '@strapi/strapi'
import { createSnapToken } from '../../../services/midtrans'
import { createOrder as createBiteshipOrder, getTracking } from '../../../services/biteship'
import * as crypto from 'crypto'

const ORIGIN_CONTACT_NAME = 'E-Commerce Store'
const ORIGIN_CONTACT_PHONE = '081234567890'
const ORIGIN_ADDRESS = 'Jakarta, Indonesia'
const ORIGIN_LATITUDE = -6.1751
const ORIGIN_LONGITUDE = 106.865

interface ShippingInfo {
  courierId: string
  courierName: string
  serviceId: string
  serviceName: string
  price: number
  etdMin: number
  etdMax: number
}

interface CheckoutInput {
  addressId: string
  shipping: ShippingInfo
}

interface MidtransWebhookPayload {
  order_id: string
  transaction_status: string
  fraud_status?: string
  status_code: string
  gross_amount: string
  signature_key?: string
}

function verifyMidtransSignature(payload: MidtransWebhookPayload): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return false

  const { order_id, status_code, gross_amount } = payload
  const rawString = order_id + status_code + gross_amount + serverKey
  const computed = crypto.createHash('sha512').update(rawString).digest('hex')

  return computed === payload.signature_key
}

function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string,
): 'paid' | 'failed' | 'expired' | 'pending' {
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') return 'paid'
    return 'failed'
  }
  if (transactionStatus === 'settlement') return 'paid'
  if (['cancel', 'deny', 'failure'].includes(transactionStatus)) return 'failed'
  if (transactionStatus === 'expire') return 'expired'
  return 'pending'
}

export default factories.createCoreService('api::order.order', ({ strapi }) => ({
  async checkout(input: CheckoutInput, userId: number, origin: string) {
    const { addressId, shipping } = input

    const [address, carts, user] = await Promise.all([
      strapi.documents('api::address.address').findOne({
        documentId: addressId,
        filters: { users_permissions_user: { id: userId } },
      }),
      strapi.documents('api::cart.cart').findMany({
        filters: { users_permissions_user: { id: userId } },
        populate: ['product'],
      }),
      strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        select: ['email'],
      }),
    ])

    if (!address) {
      throw new Error('Address not found')
    }

    if (carts.length === 0) {
      throw new Error('Cart is empty')
    }

    const items = carts.map((c: any) => ({
      id: c.product?.documentId || '',
      name: c.product?.name || 'Item',
      price: c.price,
      quantity: c.quantity,
      weight: c.product?.weight || 1000,
    }))

    const grossAmount = items.reduce((sum: number, i) => sum + i.price * i.quantity, 0) + shipping.price

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const backendUrl = process.env.BACKEND_URL || origin

    const order = await strapi.documents('api::order.order').create({
      data: {
        orderStatus: 'pending',
        midtransOrderId: orderId,
        address: addressId,
        users_permissions_user: userId,
        items,
        shipping: JSON.parse(JSON.stringify(shipping)),
      },
    })

    const frontendUrl = process.env.FRONTEND_URL || origin
    const { token, redirect_url: redirectUrl } = await createSnapToken({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: address.recipientName ?? '',
        email: (user as { email: string } | null)?.email || 'customer@example.com',
        phone: address.phone ?? '',
      },
      item_details: [
        ...items.map((i) => ({
          id: i.id,
          price: i.price,
          quantity: i.quantity,
          name: i.name,
        })),
        {
          id: 'SHIPPING',
          price: shipping.price,
          quantity: 1,
          name: `Shipping - ${shipping.courierName} ${shipping.serviceName}`,
        },
      ],
      callbacks: {
        finish: `${frontendUrl}/order/callback?doc=${order.documentId}`,
        error: `${frontendUrl}/order/callback?doc=${order.documentId}`,
        unfinish: `${frontendUrl}/order/callback?doc=${order.documentId}`,
      },
      notification_url: `${backendUrl}/api/orders/webhook`,
    })

    await strapi.documents('api::order.order').update({
      documentId: order.documentId,
      data: { midtransSnapToken: token },
    })

    await Promise.all(
      carts.map((c: any) => strapi.documents('api::cart.cart').delete(c.documentId)),
    )

    return {
      orderId: order.documentId,
      midtransOrderId: orderId,
      redirectUrl,
    }
  },

  async handleWebhook(payload: MidtransWebhookPayload) {
    const { order_id, transaction_status, fraud_status } = payload

    strapi.log.info(`[webhook] order: ${order_id}, status: ${transaction_status}, fraud: ${fraud_status}`)

    if (!verifyMidtransSignature(payload)) {
      strapi.log.error(`[webhook] signature invalid for order: ${order_id}`)
      throw new Error('Invalid signature')
    }

    const existingOrder = await strapi.documents('api::order.order').findFirst({
      filters: { midtransOrderId: order_id },
      populate: ['address'],
    })

    if (!existingOrder) {
      throw new Error(`Order ${order_id} not found`)
    }

    const mappedStatus = mapTransactionStatus(transaction_status, fraud_status)

    await strapi.documents('api::order.order').update({
      documentId: existingOrder.documentId,
      data: { orderStatus: mappedStatus },
    })

    if (mappedStatus === 'paid' && !existingOrder.biteshipOrderId) {
      await this._createShipmentFromOrder(existingOrder)
    }

    return { status: 'ok' }
  },

  async _createShipmentFromOrder(order: Record<string, unknown>) {
    const address = order.address as Record<string, unknown> | null
    if (!address) {
      throw new Error('Order has no address')
    }

    const shipping = order.shipping as unknown as ShippingInfo
    const items = order.items as unknown as Array<{ name: string; price: number; quantity: number; weight: number }>

    const biteshipResponse = await createBiteshipOrder({
      origin_contact_name: ORIGIN_CONTACT_NAME,
      origin_contact_phone: ORIGIN_CONTACT_PHONE,
      origin_address: ORIGIN_ADDRESS,
      origin_coordinate: { latitude: ORIGIN_LATITUDE, longitude: ORIGIN_LONGITUDE },
      destination_contact_name: String(address.recipientName ?? ''),
      destination_contact_phone: String(address.phone ?? ''),
      destination_address: String(address.address ?? ''),
      destination_coordinate: {
        latitude: Number(address.latitude),
        longitude: Number(address.longitude),
      },
      courier_company: shipping.courierId,
      courier_type: shipping.serviceId,
      delivery_type: 'now',
      reference_id: order.midtransOrderId as string,
      items: items.map((item) => ({
        name: item.name,
        value: item.price,
        quantity: item.quantity,
        weight: item.weight,
      })),
    })

    await strapi.documents('api::order.order').update({
      documentId: order.documentId as string,
      data: {
        biteshipOrderId: biteshipResponse.id,
        waybillId: biteshipResponse.courier.waybill_id,
      },
    })

    return {
      biteshipOrderId: biteshipResponse.id,
      waybillId: biteshipResponse.courier.waybill_id,
      status: biteshipResponse.status,
    }
  },

  async createShipment(documentId: string, userId: number) {
    const order = await strapi.documents('api::order.order').findOne({
      documentId,
      filters: { users_permissions_user: { id: userId } },
      populate: ['address'],
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.orderStatus !== 'paid') {
      throw new Error(`Order must be paid to create shipment (current status: ${order.orderStatus})`)
    }

    if (order.biteshipOrderId) {
      throw new Error('Shipment already created for this order')
    }

    return this._createShipmentFromOrder(order)
  },

  async getTracking(documentId: string, userId: number) {
    const order = await strapi.documents('api::order.order').findOne({
      documentId,
      filters: { users_permissions_user: { id: userId } },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (!order.biteshipOrderId) {
      throw new Error('Shipment not created yet')
    }

    return getTracking(order.biteshipOrderId)
  },
}))
