import type { ShippingRate } from '~/types/checkout'

export const useCouriers = () => {
  const client = useStrapiClient()
  const addressId = ref<string | null>(null)

  const {
    data: rates,
    pending: loading,
    error: asyncError,
    execute,
  } = useAsyncData<ShippingRate[]>(
    'shipping-rates',
    () => client('/shipping/rates', { method: 'POST', body: { addressId: addressId.value } }),
    { immediate: false },
  )

  const error = computed(() => {
    if (!asyncError.value) return null
    return 'Failed to fetch shipping rates. Please try again.'
  })

  async function fetchRates(id: string) {
    addressId.value = id
    await execute()
  }

  return {
    rates: computed(() => rates.value ?? []),
    loading: readonly(loading),
    error: readonly(error),
    fetchRates,
  }
}
