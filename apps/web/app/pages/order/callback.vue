<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const documentId = computed(() => route.query.doc as string)
const orderId = computed(() => route.query.order_id as string)
const transactionStatus = computed(() => route.query.transaction_status as string)

const isSuccess = computed(() =>
  ['settlement', 'capture'].includes(transactionStatus.value ?? ''),
)
const isPending = computed(() => !isSuccess.value && transactionStatus.value !== '')

const statusConfig = computed(() => {
  if (isSuccess.value) {
    return {
      iconClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconPath: 'M20 6 9 17l-5-5',
      title: 'Pembayaran Berhasil',
      description: 'Pembayaran Anda telah diterima. Pesanan sedang diproses.',
    }
  }
  if (isPending.value) {
    return {
      iconClass: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconPath: 'M12 8v4l3 3',
      title: 'Menunggu Pembayaran',
      description: 'Pembayaran Anda masih menunggu konfirmasi. Silakan selesaikan pembayaran.',
    }
  }
  return {
    iconClass: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    iconPath: 'M18 6 6 18M6 6l12 12',
    title: 'Pembayaran Gagal',
    description: 'Pembayaran tidak berhasil. Silakan coba lagi.',
  }
})

const cartStore = useCartStore()
await cartStore.refresh()

definePageMeta({
  middleware: false,
})

useSeoMeta({
  title: `${statusConfig.value.title} - E-Commerce`,
  description: statusConfig.value.description,
})
</script>

<template>
  <div class="max-w-lg mx-auto py-16 text-center space-y-6">
    <div :class="['w-20 h-20 rounded-full flex items-center justify-center mx-auto', statusConfig.iconClass]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="statusConfig.iconColor"
      >
        <path :d="statusConfig.iconPath" />
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-foreground">{{ statusConfig.title }}</h1>

    <p class="text-muted-foreground">{{ statusConfig.description }}</p>

    <div v-if="orderId" class="flex items-center justify-center gap-2">
      <span class="text-sm text-muted-foreground">Order ID:</span>
      <span class="font-mono font-medium text-foreground break-all">{{ orderId }}</span>
    </div>

    <p
      v-if="orderId"
      class="font-mono text-xs uppercase tracking-widest text-muted-foreground"
    >
      Processing payment notification…
    </p>

    <div class="flex items-center justify-center gap-4 pt-4 flex-wrap">
      <NuxtLink
        v-if="isSuccess && documentId"
        :to="`/account/orders/${documentId}`"
        class="h-11 px-6 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        View Order Details
      </NuxtLink>
      <NuxtLink
        to="/"
        class="h-11 px-6 inline-flex items-center justify-center rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
      >
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>
