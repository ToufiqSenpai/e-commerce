<script setup lang="ts">
import type { CartItem } from '~/stores/cart'

defineProps<{
  items: CartItem[]
  subtotal: number
  shippingCost: number
  total: number
  canPlaceOrder: boolean
  placingOrder: boolean
  shippingSelected: boolean
}>()

const emit = defineEmits<{
  'place-order': []
}>()

const formatPrice = (price: number) => `Rp${price.toLocaleString('id-ID')}`
</script>

<template>
  <section aria-labelledby="summary-title">
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-6 backdrop-blur">
      <h2 id="summary-title" class="text-xl font-bold text-foreground">Order Summary</h2>

      <!-- Item list -->
      <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
        <div v-for="item in items" :key="item.id" class="flex items-center gap-3">
          <!-- Thumbnail -->
          <div class="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
            <img
              v-if="item.product.images?.[0]?.url"
              :src="useStrapiMedia(item.product.images[0].url)"
              :alt="item.product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-lg">📦</div>
          </div>

          <!-- Item info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ item.product.name }}</p>
            <p class="text-xs text-muted-foreground">Qty: {{ item.quantity }}</p>
          </div>

          <!-- Item total -->
          <span class="text-sm font-semibold text-foreground shrink-0">
            {{ formatPrice(item.price * item.quantity) }}
          </span>
        </div>
      </div>

      <!-- Pricing breakdown -->
      <div class="space-y-3 pt-4 border-t border-border text-sm">
        <div class="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span class="font-medium text-foreground">{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span v-if="shippingSelected" class="font-medium text-foreground">{{ formatPrice(shippingCost) }}</span>
          <span v-else class="text-xs italic">Select courier</span>
        </div>
      </div>

      <!-- Total -->
      <div class="flex justify-between items-baseline font-bold text-lg text-foreground pt-4 border-t border-border">
        <span>Total</span>
        <span class="text-2xl text-primary">{{ formatPrice(total) }}</span>
      </div>

      <!-- Pay Now Button -->
      <button
        type="button"
        :disabled="!canPlaceOrder"
        class="w-full h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
        @click="emit('place-order')"
      >
        <span
          v-if="placingOrder"
          class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"
        />
        {{ placingOrder ? 'Processing...' : 'Pay Now' }}
        <svg
          v-if="!placingOrder"
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
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      </button>

      <!-- Trust indicators -->
      <div class="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
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
        <span>Secure payment via Midtrans</span>
      </div>
    </div>
  </section>
</template>
