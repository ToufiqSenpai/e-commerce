<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '~/stores/cart'
import { useAddressStore } from '~/stores/address'

useSeoMeta({
  title: 'Shopping Cart - E-Commerce',
  description: 'Review your selected products, adjust quantities, and proceed to checkout.',
})

const user = useStrapiUser()

const cartStore = useCartStore()
const { items } = storeToRefs(cartStore)
const { incrementQuantity, decrementQuantity, removeItem } = cartStore

const addressStore = useAddressStore()
const { items: addresses } = storeToRefs(addressStore)
const hasAddresses = computed(() => addresses.value.length > 0)

const formatPrice = (price: number) => `Rp${price.toLocaleString('id-ID')}`

const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const total = computed(() => subtotal.value)

const handleDecrement = (itemId: number) => {
  const item = items.value.find((i) => i.id === itemId)
  if (item) {
    if (item.quantity > 1) {
      decrementQuantity(itemId)
    } else {
      removeItem(itemId)
    }
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" id="cart-title">Shopping Cart</h1>
      <p class="mt-2 text-sm text-muted-foreground" v-if="user && items.length > 0">
        Review your items before checking out. You have {{ items.length }} unique item(s) in your basket.
      </p>
    </div>

    <!-- NOT LOGGED IN STATE -->
    <div
      v-if="!user"
      class="py-16 text-center max-w-md mx-auto space-y-6 bg-card border border-border rounded-2xl p-8 shadow-sm"
    >
      <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight">Login Required</h2>
        <p class="text-muted-foreground text-sm">
          Please log in to view your shopping cart, manage selected items, and complete your purchase.
        </p>
      </div>
      <NuxtLink
        to="/login?redirect=/cart"
        class="w-full h-11 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        id="login-btn"
      >
        Sign in to Account
      </NuxtLink>
    </div>

    <!-- EMPTY CART STATE -->
    <div
      v-else-if="items.length === 0"
      class="py-16 text-center max-w-md mx-auto space-y-6 bg-card border border-border rounded-2xl p-8 shadow-sm"
    >
      <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight">Your cart is empty</h2>
        <p class="text-muted-foreground text-sm">
          Looks like you haven't added anything to your cart yet. Check out our amazing selection of products!
        </p>
      </div>
      <NuxtLink
        to="/products"
        class="w-full h-11 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Browse Products
      </NuxtLink>
    </div>

    <!-- MAIN CART CONTENT -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Cart Items Section -->
      <section class="lg:col-span-8 space-y-4" aria-labelledby="cart-title">
        <h2 class="sr-only">Cart items</h2>

        <div class="space-y-4">
          <div
            v-for="item in items"
            :key="item.id"
            class="group flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 shadow-sm hover:shadow transition-all duration-300"
          >
            <!-- Product Image -->
            <div class="w-full sm:w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0 relative">
              <img
                v-if="item.product.images?.[0]?.url"
                :src="useStrapiMedia(item.product.images[0].url)"
                :alt="item.product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">📦</div>
            </div>

            <!-- Item details -->
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start gap-2">
                  <div>
                    <span class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {{ item.product.product_category?.name || 'Uncategorized' }}
                    </span>
                    <h3 class="font-medium text-foreground hover:text-primary transition-colors mt-0.5 line-clamp-1">
                      <NuxtLink :to="`/products/${item.product.slug}`">{{ item.product.name }}</NuxtLink>
                    </h3>
                  </div>
                  <span class="font-bold text-lg text-foreground shrink-0"
                    >{{ formatPrice(item.price * item.quantity) }}</span
                  >
                </div>

                <p class="text-xs text-muted-foreground mt-1">Unit Price: {{ formatPrice(item.price) }}</p>
              </div>

              <!-- Quantity Controls & Actions -->
              <div class="flex mt-4">
                <!-- Quantity selector -->
                <div class="flex items-center border border-border rounded-full bg-muted/40 p-1">
                  <button
                    type="button"
                    class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    aria-label="Decrease quantity"
                    @click="handleDecrement(item.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span class="w-8 text-center text-sm font-semibold select-none text-foreground" aria-live="polite">
                    {{ item.quantity }}
                  </span>
                  <button
                    type="button"
                    class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    :disabled="item.quantity >= item.product.stock"
                    aria-label="Increase quantity"
                    @click="incrementQuantity(item.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Order Summary Card -->
      <section class="lg:col-span-4" aria-labelledby="summary-title">
        <div class="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-6 backdrop-blur">
          <h2 class="text-xl font-bold text-foreground" id="summary-title">Order Summary</h2>

          <!-- Pricing breakdown -->
          <div class="space-y-3 pb-4 border-b border-border text-sm">
            <div class="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span class="font-medium text-foreground">{{ formatPrice(subtotal) }}</span>
            </div>
          </div>

          <!-- Total price -->
          <div class="flex justify-between items-baseline font-bold text-lg text-foreground">
            <span>Total</span>
            <span class="text-2xl text-primary">{{ formatPrice(total) }}</span>
          </div>

          <!-- Checkout Button -->
          <NuxtLink
            v-if="hasAddresses"
            to="/checkout"
            class="w-full h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group relative overflow-hidden"
          >
            Proceed to Checkout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="ml-2 group-hover:translate-x-1 transition-transform"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>

          <!-- No address warning -->
          <div v-else class="space-y-3">
            <div
              class="w-full h-12 flex items-center justify-center rounded-full bg-primary/50 text-primary-foreground font-medium cursor-not-allowed opacity-75"
            >
              Proceed to Checkout
            </div>
            <p class="text-xs text-center text-muted-foreground">
              Please
              <NuxtLink to="/account/address/new" class="text-primary hover:underline font-medium"
                >add a shipping address</NuxtLink
              >
              before checkout.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
