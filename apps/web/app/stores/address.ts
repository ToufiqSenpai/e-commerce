import type { Strapi5ResponseMany } from '@nuxtjs/strapi'
import type { Address } from '~/types/strapi/address'

export const useAddressStore = defineStore('address', () => {
  const { find, create, update, delete: destroy } = useStrapi()

  const {
    data: addressResponse,
    pending,
    refresh,
  } = useAsyncData<Strapi5ResponseMany<Address>>('addresses', () =>
    find<Address>('addresses', { sort: 'isDefault:desc' }),
  )

  const items = computed<Address[]>(() => addressResponse.value?.data ?? [])

  const save = async (id: string | undefined, data: Partial<Address>) => {
    if (id) {
      await update<Address>('addresses', id, data)
    } else {
      await create<Address>('addresses', data as Address)
    }
    await refresh()
  }

  const remove = async (documentId: string) => {
    await destroy('addresses', documentId)
    await refresh()
  }

  return { items, pending, refresh, save, remove }
})
