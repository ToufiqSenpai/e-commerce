<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isRouteActive = (path: string) => {
  if (path === '/account/address') {
    return route.path.startsWith('/account/address')
  }
  if (path === '/account/orders') {
    return route.path.startsWith('/account/orders')
  }
  return route.path === path
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="flex flex-col md:flex-row gap-8 lg:gap-12">
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 shrink-0">
        <h1 class="text-3xl font-bold mb-8">My Account</h1>
        <nav class="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          <NuxtLink
            to="/account/settings"
            class="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border"
            :class="
              isRouteActive('/account/settings')
                ? 'bg-primary/5 text-primary border-primary/20'
                : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
            "
          >
            Account Settings
          </NuxtLink>
          <NuxtLink
            to="/account/address"
            class="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border"
            :class="
              isRouteActive('/account/address')
                ? 'bg-primary/5 text-primary border-primary/20'
                : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
            "
          >
            Address Book
          </NuxtLink>
          <NuxtLink
            to="/account/orders"
            class="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border"
            :class="
              isRouteActive('/account/orders')
                ? 'bg-primary/5 text-primary border-primary/20'
                : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
            "
          >
            My Orders
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        <slot />
      </main>
    </div>
  </NuxtLayout>
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
