import type { Address } from '~/types/strapi/address'
import type { ShippingRate, GroupedRate } from '~/types/checkout'
import type { CartItem } from '~/stores/cart'

export const useCheckout = () => {
  const { rates, loading: loadingRates, error: ratesError, fetchRates } = useCouriers()
  const cartStore = useCartStore()
  const client = useStrapiClient()

  const selectedAddress = ref<Address | null>(null)
  const selectedRate = ref<ShippingRate | null>(null)
  const placingOrder = ref(false)
  const error = ref<string | null>(null)

  const groupedRates = computed<GroupedRate[]>(() => {
    const map = new Map<string, GroupedRate>()
    for (const r of rates.value) {
      const existing = map.get(r.courierId)
      const service = {
        serviceId: r.serviceId,
        serviceName: r.serviceName,
        price: r.price,
        etdMin: r.etdMin,
        etdMax: r.etdMax,
      }
      if (existing) {
        existing.services.push(service)
      } else {
        map.set(r.courierId, {
          courierId: r.courierId,
          courierName: r.courierName,
          services: [service],
        })
      }
    }
    return Array.from(map.values())
  })

  const subtotal = computed(() =>
    cartStore.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
  )

  const shippingCost = computed(() => selectedRate.value?.price ?? 0)
  const total = computed(() => subtotal.value + shippingCost.value)

  const canPlaceOrder = computed(
    () =>
      selectedAddress.value !== null &&
      selectedRate.value !== null &&
      cartStore.items.length > 0 &&
      !placingOrder.value,
  )

  async function fetchShippingRates(address: Address) {
    error.value = null
    selectedRate.value = null

    try {
      await fetchRates(address.documentId)
      if (ratesError.value) {
        error.value = ratesError.value
      }
    } catch (e) {
      error.value = 'Failed to fetch shipping rates. Please try again.'
      console.error('Failed to fetch shipping rates:', e)
    }
  }

  function selectAddress(address: Address) {
    selectedAddress.value = address
    fetchShippingRates(address)
  }

  function selectRate(rate: ShippingRate) {
    selectedRate.value = rate
  }

  async function placeOrder() {
    if (!canPlaceOrder.value || !selectedRate.value || !selectedAddress.value) return

    placingOrder.value = true
    error.value = null

    try {
      const response = await client('/orders/checkout', {
        method: 'POST',
        body: {
          addressId: selectedAddress.value.documentId,
          shipping: {
            courierId: selectedRate.value.courierId,
            courierName: selectedRate.value.courierName,
            serviceId: selectedRate.value.serviceId,
            serviceName: selectedRate.value.serviceName,
            price: selectedRate.value.price,
            etdMin: selectedRate.value.etdMin,
            etdMax: selectedRate.value.etdMax,
          },
        },
      })

      const redirectUrl = response.redirectUrl as string

      await cartStore.refresh()
      window.location.assign(redirectUrl)
    } catch (e: any) {
      error.value = e.message || 'Failed to place order. Please try again.'
      console.error('Failed to place order:', e)
    } finally {
      placingOrder.value = false
    }
  }

  watch(selectedAddress, (newAddress) => {
    if (!newAddress) {
      selectedRate.value = null
    }
  })

  return {
    selectedAddress: readonly(selectedAddress),
    selectedRate: readonly(selectedRate),
    groupedRates: readonly(groupedRates),
    loadingRates: readonly(loadingRates),
    placingOrder: readonly(placingOrder),
    error: readonly(error),

    subtotal,
    shippingCost,
    total,
    canPlaceOrder,

    selectAddress,
    selectRate,
    placeOrder,
  }
}
