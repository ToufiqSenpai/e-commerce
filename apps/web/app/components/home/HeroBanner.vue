<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const banners = [
  {
    id: 1,
    image: 'https://placehold.co/1200x400/10b981/ffffff?text=Summer+Sale+50%25+Off',
    alt: 'Summer Sale',
  },
  {
    id: 2,
    image: 'https://placehold.co/1200x400/059669/ffffff?text=New+Arrivals',
    alt: 'New Arrivals',
  },
  {
    id: 3,
    image: 'https://placehold.co/1200x400/047857/ffffff?text=Exclusive+Premium+Collection',
    alt: 'Premium Collection',
  },
]

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % banners.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + banners.length) % banners.length
}

onMounted(() => {
  intervalId = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="relative w-full overflow-hidden bg-muted rounded-xl aspect-[3/1] md:aspect-[4/1] group">
    <!-- Banner Images -->
    <div
      class="flex transition-transform duration-500 ease-in-out h-full"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div v-for="banner in banners" :key="banner.id" class="w-full flex-shrink-0 h-full">
        <img :src="banner.image" :alt="banner.alt" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- Controls -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
      aria-label="Previous banner"
      @click="prevSlide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
      aria-label="Next banner"
      @click="nextSlide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>

    <!-- Indicators -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <button
        v-for="(_, index) in banners"
        :key="index"
        class="w-2.5 h-2.5 rounded-full transition-colors"
        :class="index === currentIndex ? 'bg-primary' : 'bg-background/50 hover:bg-background/80'"
        :aria-label="`Go to slide ${index + 1}`"
        @click="currentIndex = index"
      />
    </div>
  </div>
</template>
