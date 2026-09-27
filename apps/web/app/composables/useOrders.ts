import type {
  CreateShipmentResponse,
  Order,
  TrackingResponse,
} from '~/types/strapi/order'

export const useOrders = () => {
  const client = useStrapiClient()

  async function fetchOrders(): Promise<Order[]> {
    const response = await client('/orders', {
      method: 'GET',
      params: {
        sort: 'createdAt:desc',
        populate: ['address'],
      },
    })
    return (response?.data ?? []) as Order[]
  }

  async function fetchOrder(documentId: string): Promise<Order> {
    const response = await client(`/orders/${documentId}`, {
      method: 'GET',
      params: {
        populate: ['address'],
      },
    })
    return response?.data as Order
  }

  async function createShipment(documentId: string): Promise<CreateShipmentResponse> {
    return client(`/orders/${documentId}/shipment`, {
      method: 'POST',
    })
  }

  async function getTracking(documentId: string): Promise<TrackingResponse> {
    return client(`/orders/${documentId}/tracking`, {
      method: 'GET',
    })
  }

  return {
    fetchOrders,
    fetchOrder,
    createShipment,
    getTracking,
  }
}
