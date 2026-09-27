import type { Strapi5ResponseMany } from '@nuxtjs/strapi'
import type { Cart } from '~/types/strapi/cart'
import type { Product } from '~/types/strapi/product'

export interface CartItem extends Cart {
  product: Product
}

export const useCartStore = defineStore('cart', () => {
  const { find, create, update, delete: deleteStrapi } = useStrapi()
  const user = useStrapiUser()

  const { data: cartResponse, refresh } = useAsyncData<Strapi5ResponseMany<CartItem>>(
    'carts',
    () => {
      if (!user.value) return Promise.resolve({ data: [] })
      return find<CartItem>('carts', {
        fields: ['quantity', 'price'],
        populate: {
          product: {
            fields: ['name', 'slug', 'price', 'stock', 'weight'],
            populate: { images: { fields: ['url'] } },
          },
        },
      })
    },
    {
      watch: [user],
      immediate: !!user.value,
    },
  )

  const items = computed<CartItem[]>(() =>
    (cartResponse.value?.data ?? []).map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.product?.id,
        documentId: item.product?.documentId,
        name: item.product?.name,
        slug: item.product?.slug,
        price: item.product?.price,
        stock: item.product?.stock,
        images: item.product?.images ?? [],
        product_category: item.product?.product_category ?? null,
      } as Product,
    })),
  )

  const addItem = async (product: Product, quantity = 1) => {
    if (!user.value) return
    const existingItem = items.value.find((i) => i.product.documentId === product.documentId)

    if (existingItem) {
      const newQty = Math.min(existingItem.quantity + quantity, product.stock)
      await update('carts', existingItem.documentId, { quantity: newQty })
    } else {
      await create('carts', { quantity, price: product.price, product: product.documentId })
    }
    await refresh()
  }

  const incrementQuantity = async (itemId: number) => {
    const item = items.value.find((i) => i.id === itemId)
    if (!item || item.quantity >= item.product.stock) return
    await update('carts', item.documentId, { quantity: item.quantity + 1 })
    await refresh()
  }

  const decrementQuantity = async (itemId: number) => {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return
    if (item.quantity > 1) {
      await update('carts', item.documentId, { quantity: item.quantity - 1 })
      await refresh()
    } else {
      await removeItem(itemId)
    }
  }

  const removeItem = async (itemId: number) => {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return
    await deleteStrapi('carts', item.documentId)
    await refresh()
  }

  const clearCart = async () => {
    await Promise.all(items.value.map((item) => deleteStrapi('carts', item.documentId)))
    await refresh()
  }

  return {
    items,
    addItem,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearCart,
    refresh,
  }
})
