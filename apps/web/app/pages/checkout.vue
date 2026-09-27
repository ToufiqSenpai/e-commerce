<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '~/stores/cart'
import { useAddressStore } from '~/stores/address'
import { useCheckout } from '~/composables/useCheckout'

useSeoMeta({
  title: 'Checkout - E-Commerce',
  description: 'Complete your purchase. Select your shipping address and courier, then proceed to payment.',
})

definePageMeta({
  middleware: [
    function () {
      const user = useStrapiUser()
      if (!user.value) {
        return navigateTo('/login?redirect=/checkout')
      }
    },
  ],
})

const cartStore = useCartStore()
const { items: cartItems } = storeToRefs(cartStore)

const addressStore = useAddressStore()
const { items: addresses } = storeToRefs(addressStore)

const {
  selectedAddress,
  selectedRate,
  groupedRates,
  loadingRates,
  placingOrder,
  error,
  subtotal,
  shippingCost,
  total,
  canPlaceOrder,
  selectAddress,
  selectRate,
  placeOrder,
} = useCheckout()

// Redirect to cart if empty
watch(
  cartItems,
  (items) => {
    if (items.length === 0 && !placingOrder.value) {
      navigateTo('/cart')
    }
  },
  { immediate: true },
)

// Local model for address selector v-model
const addressModel = ref(selectedAddress.value)

watch(addressModel, (newAddress) => {
  if (newAddress) {
    selectAddress(newAddress)
  }
})

// Local model for rate selector v-model
const rateModel = ref(selectedRate.value)

watch(rateModel, (newRate) => {
  if (newRate) {
    selectRate(newRate)
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" id="checkout-title">Checkout</h1>
      <p class="mt-2 text-sm text-muted-foreground">Complete your order by selecting a shipping address and courier.</p>
    </div>

    <!-- Error banner -->
    <div
      v-if="error"
      class="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Main content: 2-column grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left column: Address + Courier selection -->
      <div class="lg:col-span-7 space-y-8">
        <!-- Step 1: Address Selection -->
        <CheckoutAddressSelector v-model="addressModel" :addresses="addresses" />

        <!-- Step 2: Courier Selection -->
        <CheckoutCourierSelector v-model="rateModel" :grouped-rates="groupedRates" :loading="loadingRates" />
      </div>

      <!-- Right column: Order Summary -->
      <div class="lg:col-span-5">
        <CheckoutOrderSummary
          :items="cartItems"
          :subtotal="subtotal"
          :shipping-cost="shippingCost"
          :total="total"
          :can-place-order="canPlaceOrder"
          :placing-order="placingOrder"
          :shipping-selected="!!selectedRate"
          @place-order="placeOrder"
        />
      </div>
    </div>
  </div>
</template>
