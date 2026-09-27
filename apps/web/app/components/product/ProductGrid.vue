<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from './ProductCard.vue'
import type { Product } from '~/types/strapi/product'

const route = useRoute()
const { find } = useStrapi()

const page = ref(1)
const firstLoad = ref(true)
const hasMore = ref(true)

const buildQuery = (pageNumber: number) => {
  const query: any = {
    populate: '*',
    pagination: { page: pageNumber, pageSize: 12 },
  }

  if (route.query.sort) {
    query.sort = route.query.sort
  }

  const filters: any = {}
  if (route.query.category) {
    filters.product_category = { slug: { $eq: route.query.category } }
  }
  if (route.query.search) {
    filters.name = { $containsi: route.query.search }
  }

  // Price range filters
  if (route.query.minPrice || route.query.maxPrice) {
    filters.price = {}
    if (route.query.minPrice) filters.price.$gte = Number(route.query.minPrice)
    if (route.query.maxPrice) filters.price.$lte = Number(route.query.maxPrice)
  }

  if (Object.keys(filters).length > 0) {
    query.filters = filters
  }

  return query
}

// SSR: initial page loads on the server via useAsyncData
const { data: products, pending, error, refresh } = await useAsyncData(
  'product-grid',
  async () => {
    page.value = 1
    hasMore.value = true
    const response = await find<Product>('products', buildQuery(1))
    return response.data || []
  },
  { watch: [() => route.query] },
)

watch(
  () => route.query,
  () => {
    refresh()
    firstLoad.value = true
  },
  { deep: true },
)

onMounted(() => {
  firstLoad.value = false
})

const target = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !pending.value && hasMore.value && !firstLoad.value) {
        loadMore()
      }
    },
    { rootMargin: '200px' },
  )

  if (target.value) observer.observe(target.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const loadMore = async () => {
  if (pending.value || !hasMore.value) return

  pending.value = true
  try {
    const nextPage = page.value + 1
    const response = await find<Product>('products', buildQuery(nextPage))
    const newProducts = response.data || []

    products.value = [...(products.value || []), ...newProducts]

    if (response.meta?.pagination) {
      hasMore.value = nextPage < response.meta.pagination.pageCount
    } else {
      hasMore.value = newProducts.length === 12
    }

    if (hasMore.value) page.value = nextPage
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="flex-1 w-full">
    <div
      v-if="!pending && products && products.length === 0"
      class="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border"
    >
      <span class="text-4xl mb-4 block">🔍</span>
      <p>No products found matching your criteria.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard v-for="product in products || []" :key="product.id" :product="product" />
    </div>

    <!-- Loading indicator & Infinite Scroll Target -->
    <div ref="target" class="py-12 flex justify-center">
      <div v-if="pending" role="status" aria-live="polite" class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <span class="text-sm text-muted-foreground">Loading products...</span>
      </div>
    </div>
  </section>
</template>
