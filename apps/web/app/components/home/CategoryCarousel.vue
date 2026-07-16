<script setup lang="ts">
import { computed } from 'vue'
import type { Strapi5ResponseMany } from '@nuxtjs/strapi'
import type { ProductCategory } from '~/types/strapi/product'

const { find } = useStrapi()

// Fetch product categories with the icon populated
const {
  data: response,
  pending,
  error,
} = await useAsyncData<Strapi5ResponseMany<ProductCategory>>('categories', () =>
  find('product-categories', { populate: 'icon' }),
)

if (import.meta.client) {
  if (error.value) console.error('Category Fetch Error:', error.value)
}

const categories = computed(() => response.value?.data || [])
</script>

<template>
  <section class="py-6">
    <h2 class="text-xl font-bold mb-4">Shop by Category</h2>

    <!-- Loading State -->
    <div v-if="pending" class="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
      <div
        v-for="i in 5"
        :key="i"
        class="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-muted animate-pulse rounded-xl border border-border"
      ></div>
    </div>

    <!-- Loaded State -->
    <div v-else class="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/category/${category.slug}`"
        class="relative flex-shrink-0 w-28 h-36 sm:w-40 sm:h-48 rounded-2xl overflow-hidden group snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md transition-shadow"
      >
        <img
          v-if="category.icon?.url"
          :src="useStrapiMedia(category.icon.url)"
          :alt="category.name"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div v-else class="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
          <span class="text-3xl text-muted-foreground">📁</span>
        </div>

        <!-- Gradient overlay for text contrast -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <!-- Category Name -->
        <div class="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white z-10">
          <span class="block text-sm sm:text-base font-semibold truncate drop-shadow-sm">{{ category.name }}</span>
        </div>
      </NuxtLink>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="flex-1 text-center py-8 text-muted-foreground">
        No categories available.
      </div>
    </div>
  </section>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
