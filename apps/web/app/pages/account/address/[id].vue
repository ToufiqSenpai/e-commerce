<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = computed(() => route.params.id as string)

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
  <AddressForm :id="id" />
</template>
