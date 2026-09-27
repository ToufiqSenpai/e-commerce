<script setup lang="ts">
import type { GroupedRate, ShippingRate } from '~/types/checkout'

defineProps<{
  groupedRates: GroupedRate[]
  loading: boolean
}>()

const selectedRate = defineModel<ShippingRate | null>('modelValue', { default: null })

const expandedCourier = ref<string | null>(null)

const isCourierExpanded = (rate: GroupedRate) => expandedCourier.value === rate.courierId

const isServiceSelected = (rate: GroupedRate, serviceId: string) =>
  selectedRate.value?.courierId === rate.courierId && selectedRate.value?.serviceId === serviceId

const toggleCourier = (rate: GroupedRate) => {
  expandedCourier.value = isCourierExpanded(rate) ? null : rate.courierId
}

const selectService = (rate: GroupedRate, service: GroupedRate['services'][number]) => {
  selectedRate.value = {
    courierId: rate.courierId,
    courierName: rate.courierName,
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    price: service.price,
    etdMin: service.etdMin,
    etdMax: service.etdMax,
  }
}

const formatPrice = (price: number) => `Rp${price.toLocaleString('id-ID')}`

const formatEta = (min: number, max: number) => {
  if (min === 0 && max === 0) return ''
  if (min === max) return `${min} day${min > 1 ? 's' : ''}`
  return `${min}-${max} days`
}
</script>

<template>
  <section class="space-y-4" aria-labelledby="courier-title">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      </div>
      <h2 id="courier-title" class="text-lg font-semibold text-foreground">Shipping Method</h2>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 rounded-xl border border-border bg-card animate-pulse">
        <div class="flex items-center gap-3">
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-muted rounded w-1/3" />
            <div class="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>

    <!-- No rates -->
    <div
      v-else-if="groupedRates.length === 0"
      class="p-6 border-2 border-dashed border-border rounded-xl text-center"
    >
      <p class="text-sm text-muted-foreground">Select a shipping address to view available couriers.</p>
    </div>

    <!-- Courier list (two-level) -->
    <div v-else class="space-y-3">
      <div
        v-for="rate in groupedRates"
        :key="rate.courierId"
        class="rounded-xl border-2 transition-all duration-200 overflow-hidden"
        :class="isCourierExpanded(rate) ? 'border-primary' : 'border-border'"
      >
        <!-- Courier header -->
        <button
          type="button"
          class="w-full text-left p-4 flex items-center gap-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
          @click="toggleCourier(rate)"
        >
          <div class="flex-1 min-w-0">
            <span class="font-semibold text-sm text-foreground">{{ rate.courierName }}</span>
            <span class="text-xs text-muted-foreground ml-2">{{ rate.services.length }} services</span>
          </div>

          <!-- Chevron -->
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
            class="shrink-0 text-muted-foreground transition-transform duration-200"
            :class="{ 'rotate-180': isCourierExpanded(rate) }"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <!-- Service list (expandable) -->
        <div v-if="isCourierExpanded(rate)" class="border-t border-border bg-muted/20">
          <button
            v-for="service in rate.services"
            :key="service.serviceId"
            type="button"
            class="w-full text-left p-3 pl-12 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
            @click="selectService(rate, service)"
          >
            <!-- Service radio -->
            <div class="shrink-0">
              <div
                class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="isServiceSelected(rate, service.serviceId) ? 'border-primary' : 'border-muted-foreground/40'"
              >
                <div v-if="isServiceSelected(rate, service.serviceId)" class="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <span class="font-medium text-sm text-foreground">{{ service.serviceName }}</span>
              <p v-if="service.etdMin > 0" class="text-xs text-muted-foreground mt-0.5">
                Est. {{ formatEta(service.etdMin, service.etdMax) }}
              </p>
            </div>

            <span class="font-bold text-sm text-foreground shrink-0">{{ formatPrice(service.price) }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
