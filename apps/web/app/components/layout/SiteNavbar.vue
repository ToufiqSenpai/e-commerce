<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = useStrapiUser()
const { logout } = useStrapiAuth()

// Fetch global settings using our new composable
const globalData = await useGlobalSettings()
const faviconUrl = computed(() => globalData.value?.favicon?.url)

// Search functionality
const searchQuery = ref('')
const handleSearch = () => {
  const search = searchQuery.value.trim()
  if (search) {
    router.push({ path: '/products', query: { search: search } })
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div class="container max-w-6xl mx-auto px-6 sm:px-8 md:px-12 h-16 flex items-center justify-between gap-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <NuxtImg
          v-if="faviconUrl"
          :src="useStrapiMedia(faviconUrl)"
          alt="App Icon"
          class="w-8 h-8 rounded-md object-contain"
        />
        <span class="font-bold text-xl tracking-tight text-primary">{{ globalData?.siteName }}</span>
      </NuxtLink>

      <!-- Search -->
      <div class="flex-1 max-w-md hidden md:flex">
        <form @submit.prevent="handleSearch" class="relative w-full">
          <input
            v-model="searchQuery"
            type="search"
            aria-label="Search products"
            placeholder="Search products..."
            class="w-full h-10 px-4 rounded-full border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
          <button
            type="submit"
            aria-label="Submit search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Guest Mode -->
        <template v-if="!user">
          <NuxtLink to="/login" class="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
            Log in
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="h-9 px-4 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Sign up
          </NuxtLink>
        </template>

        <!-- Authenticated Mode -->
        <template v-else>
          <button aria-label="Cart" class="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
            <span
              class="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full"
              >3</span
            >
          </button>
          <div class="relative group">
            <button
              aria-label="Account"
              class="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <div
                class="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden"
              >
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
                  class="text-muted-foreground"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </button>

            <!-- Dropdown Wrapper (Invisible bridge for hover) -->
            <div
              class="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto z-50"
            >
              <!-- Actual Dropdown Box -->
              <div class="bg-card border border-border rounded-xl shadow-md overflow-hidden">
                <div class="px-4 py-3 border-b border-border">
                  <p class="text-sm font-medium truncate">{{ user.username }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                </div>
                <div class="py-1">
                  <NuxtLink to="/account" class="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >My Account</NuxtLink
                  >
                  <button
                    @click="logout"
                    class="w-full text-left block px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
