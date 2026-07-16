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
</script>

<template>
  <AccountSettings />
</template>
