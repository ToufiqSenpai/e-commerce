<script setup lang="ts">
import ProductGrid from '~/components/product/ProductGrid.vue'
import ProductSidebar from '~/components/product/ProductSidebar.vue'
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight mb-2">All Products</h1>
      <p class="text-muted-foreground">Browse our entire collection and find exactly what you need.</p>
    </div>

    <div class="flex flex-col md:flex-row gap-8 items-start">
      <ProductSidebar />
      <ProductGrid />
    </div>
  </div>
</template>
