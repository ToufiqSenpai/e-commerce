<script setup lang="ts">
import { ref } from 'vue'
import type { StrapiMedia } from '~/types/strapi/common'

const props = defineProps<{
  images: StrapiMedia[]
  productName: string
}>()

const activeImageIndex = ref(0)

const nextImage = () => {
  if (props.images && props.images.length > 0) {
    activeImageIndex.value = (activeImageIndex.value + 1) % props.images.length
  }
}

const prevImage = () => {
  if (props.images && props.images.length > 0) {
    activeImageIndex.value = (activeImageIndex.value - 1 + props.images.length) % props.images.length
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Main Image Viewport -->
    <div
      class="relative aspect-square w-full bg-muted border border-border rounded-2xl overflow-hidden shadow-inner group"
    >
      <img
        v-if="images && images.length > 0"
        :src="useStrapiMedia(images[activeImageIndex].url)"
        :alt="images[activeImageIndex].alternativeText || productName"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-6xl">📦</div>

      <!-- Slide Controls Overlay -->
      <button
        v-if="images && images.length > 1"
        class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-background/80 hover:bg-background border border-border text-foreground hover:scale-105 transition-all shadow-md cursor-pointer"
        aria-label="Previous Image"
        @click="prevImage"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        v-if="images && images.length > 1"
        class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-background/80 hover:bg-background border border-border text-foreground hover:scale-105 transition-all shadow-md cursor-pointer"
        aria-label="Next Image"
        @click="nextImage"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- Thumbnail Slider Navigation -->
    <div v-if="images && images.length > 1" class="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
      <button
        v-for="(img, idx) in images"
        :key="img.id"
        class="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 bg-muted transition-all cursor-pointer"
        :class="
          activeImageIndex === idx ? 'border-primary shadow-sm scale-95' : 'border-border opacity-70 hover:opacity-100'
        "
        @click="activeImageIndex = idx"
      >
        <img
          :src="useStrapiMedia(img.url)"
          :alt="img.alternativeText || `Thumbnail ${idx + 1}`"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>
