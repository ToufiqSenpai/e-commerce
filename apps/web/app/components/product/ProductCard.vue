<script setup lang="ts">
import type { Product } from '~/types/strapi/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <div class="aspect-square bg-muted overflow-hidden relative">
      <img
        v-if="product.images?.[0]?.url"
        :src="useStrapiMedia(product.images[0].url)"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">📦</div>
      <button
        class="absolute top-3 right-3 p-2 bg-background/80 hover:bg-background rounded-full text-muted-foreground hover:text-destructive transition-colors backdrop-blur opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Add to wishlist"
        @click.prevent="() => {}"
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
        >
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          />
        </svg>
      </button>
    </div>
    <div class="p-4 flex flex-col flex-1">
      <span class="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{{
        product.product_category?.name || 'Uncategorized'
      }}</span>
      <h3 class="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
        {{ product.name }}
      </h3>
      <div class="mt-auto flex items-center justify-between">
        <span class="font-bold text-lg">${{ product.price ? product.price.toFixed(2) : '0.00' }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
