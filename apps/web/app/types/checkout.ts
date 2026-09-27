export interface ShippingRate {
  courierId: string
  courierName: string
  serviceId: string
  serviceName: string
  price: number
  etdMin: number
  etdMax: number
}

export interface GroupedRate {
  courierId: string
  courierName: string
  services: Array<{
    serviceId: string
    serviceName: string
    price: number
    etdMin: number
    etdMax: number
  }>
}
