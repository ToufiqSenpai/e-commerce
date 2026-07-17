<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Strapi5ResponseMany } from '@nuxtjs/strapi'
import type { ProductCategory } from '~/types/strapi/product'

const route = useRoute()
const router = useRouter()
const { find } = useStrapi()

// Fetch categories for the sidebar
const { data: catResponse } = await useAsyncData<Strapi5ResponseMany<ProductCategory>>('sidebar-categories', () =>
  find('product-categories'),
)

const categories = computed(() => catResponse.value?.data || [])

// Filter State from URL
const currentCategory = computed(() => (route.query.category as string) || '')
const currentSort = computed(() => (route.query.sort as string) || '')
const minPrice = computed(() => (route.query.minPrice as string) || '')
const maxPrice = computed(() => (route.query.maxPrice as string) || '')

const updateFilters = (key: string, value: string | undefined) => {
  const query = { ...route.query }

  if (value) {
    query[key] = value
  } else {
    delete query[key]
  }

  router.push({ query })
}
</script>

<template>
  <aside class="w-full md:w-64 flex-shrink-0 space-y-8 sticky top-24">
    <!-- Category Filter -->
    <div class="bg-card p-5 rounded-xl border border-border shadow-sm">
      <h3 class="font-semibold text-lg mb-4">Categories</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="category"
            :checked="!currentCategory"
            class="text-primary focus:ring-primary accent-primary w-4 h-4 cursor-pointer"
            @change="updateFilters('category', undefined)"
          />
          <span class="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors"
            >All Products</span
          >
        </label>

        <label v-for="cat in categories" :key="cat.id" class="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="category"
            :value="cat.slug"
            :checked="currentCategory === cat.slug"
            class="text-primary focus:ring-primary accent-primary w-4 h-4 cursor-pointer"
            @change="updateFilters('category', cat.slug)"
          />
          <span class="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{{
            cat.name
          }}</span>
        </label>
      </div>
    </div>

    <!-- Price Range -->
    <div class="bg-card p-5 rounded-xl border border-border shadow-sm">
      <h3 class="font-semibold text-lg mb-4">Price Range</h3>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="minPrice" class="text-xs text-muted-foreground mb-1.5 block font-medium">Min ($)</label>
          <input
            id="minPrice"
            type="number"
            placeholder="0"
            :value="minPrice"
            class="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            @change="(e) => updateFilters('minPrice', (e.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label for="maxPrice" class="text-xs text-muted-foreground mb-1.5 block font-medium">Max ($)</label>
          <input
            id="maxPrice"
            type="number"
            placeholder="Any"
            :value="maxPrice"
            class="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            @change="(e) => updateFilters('maxPrice', (e.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <!-- Sort Order -->
    <div class="bg-card p-5 rounded-xl border border-border shadow-sm">
      <h3 class="font-semibold text-lg mb-4">Sort By</h3>
      <div class="relative">
        <select
          :value="currentSort"
          class="w-full h-10 pl-3 pr-8 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
          @change="(e) => updateFilters('sort', (e.target as HTMLSelectElement).value)"
        >
          <option value="">Recommended</option>
          <option value="createdAt:desc">Newest Arrivals</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
        </select>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  </aside>
</template>
