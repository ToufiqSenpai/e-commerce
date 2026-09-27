<script setup lang="ts">
const route = useRoute()
const documentId = computed(() => route.params.id as string)

definePageMeta({
  layout: 'account',
  middleware: [
    function () {
      const user = useStrapiUser()
      if (!user.value) {
        return navigateTo('/login')
      }
    },
  ],
})

useSeoMeta({
  title: `Order #${documentId.value} - E-Commerce`,
  description: 'Order details and shipment tracking.',
})
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      to="/account/orders"
      class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back to Orders
    </NuxtLink>

    <OrderDetail :document-id="documentId" />
  </div>
</template>
