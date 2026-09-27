<script setup lang="ts">
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
  title: 'My Orders - E-Commerce',
  description: 'View your order history and track shipments.',
})
</script>

<template>
  <OrderList />
</template>
