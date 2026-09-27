<script setup lang="ts">
import type { Address } from '~/types/strapi/address'
import type {
  Order,
  OrderStatus,
  TrackingResponse,
} from '~/types/strapi/order'

const props = defineProps<{ documentId: string }>()

const { fetchOrder, getTracking, createShipment } = useOrders()

const { data: order, pending: orderPending, error: orderError } = await useAsyncData<Order>(
  () => `order-${props.documentId}`,
  () => fetchOrder(props.documentId),
)

const tracking = ref<TrackingResponse | null>(null)
const trackingLoading = ref(false)
const trackingError = ref<string | null>(null)
const shipmentCreating = ref(false)
const shipmentError = ref<string | null>(null)

async function loadTracking() {
  if (!order.value?.biteshipOrderId) return
  trackingLoading.value = true
  trackingError.value = null
  try {
    tracking.value = await getTracking(props.documentId)
  } catch (e) {
    trackingError.value = e instanceof Error ? e.message : 'Failed to load tracking'
  } finally {
    trackingLoading.value = false
  }
}

async function handleCreateShipment() {
  shipmentCreating.value = true
  shipmentError.value = null
  try {
    await createShipment(props.documentId)
    await refreshNuxtData(`order-${props.documentId}`)
    await loadTracking()
  } catch (e) {
    shipmentError.value = e instanceof Error ? e.message : 'Failed to create shipment'
  } finally {
    shipmentCreating.value = false
  }
}

onMounted(() => {
  if (order.value?.biteshipOrderId) {
    loadTracking()
  }
})

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Awaiting Payment',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
}

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/40',
  paid: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40',
  failed: 'border-red-300 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40',
  expired: 'border-zinc-300 bg-zinc-50 text-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-300 dark:border-zinc-700/40',
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const subtotal = computed(() =>
  order.value?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0,
)
const total = computed(() => subtotal.value + (order.value?.shipping?.price ?? 0))

const addressObj = computed<Address | null>(() => {
  const a = order.value?.address
  if (a && typeof a === 'object') return a as Address
  return null
})

const trackingHistory = computed(() => {
  const history = tracking.value?.courier?.history ?? []
  return [...history].reverse()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Loading -->
    <div v-if="orderPending" class="space-y-3" aria-busy="true">
      <div class="h-10 bg-muted/50 animate-pulse rounded" />
      <div class="h-48 bg-muted/50 animate-pulse rounded-lg" />
    </div>

    <!-- Error -->
    <div
      v-else-if="orderError"
      class="border border-destructive/30 bg-destructive/5 rounded-lg p-5 text-sm text-destructive"
    >
      <p class="font-medium">Failed to load order</p>
      <p class="text-destructive/70 mt-1">{{ orderError.message }}</p>
    </div>

    <template v-else-if="order">
      <!-- Manifest Header -->
      <header class="border-b border-dashed border-border pb-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="min-w-0">
            <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">Order Manifest</p>
            <h2 class="mt-1 font-mono text-2xl font-semibold text-foreground break-all">
              #{{ order.midtransOrderId }}
            </h2>
          </div>
          <span
            :class="[
              'shrink-0 px-3 py-1.5 rounded-md border text-xs font-mono uppercase tracking-wider',
              STATUS_TONE[order.orderStatus],
            ]"
          >
            {{ STATUS_LABEL[order.orderStatus] }}
          </span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Placed</p>
            <p class="mt-1">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div v-if="order.waybillId">
            <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Waybill</p>
            <p class="mt-1 font-mono font-semibold">{{ order.waybillId }}</p>
          </div>
          <div v-if="order.shipping">
            <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Courier</p>
            <p class="mt-1">
              {{ order.shipping.courierName }} · {{ order.shipping.serviceName }}
            </p>
          </div>
        </div>
      </header>

      <!-- Tracking Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Shipment Tracking
          </h3>
          <button
            v-if="order.biteshipOrderId"
            type="button"
            class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            :disabled="trackingLoading"
            @click="loadTracking"
          >
            {{ trackingLoading ? 'Syncing…' : 'Refresh' }}
          </button>
        </div>

        <!-- No shipment yet -->
        <div
          v-if="!order.biteshipOrderId"
          class="border border-dashed border-border rounded-lg p-6 text-center"
        >
          <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Awaiting Dispatch
          </p>
          <p class="mt-2 text-sm text-muted-foreground">
            Shipment will be created automatically after payment is confirmed.
          </p>
          <button
            v-if="order.orderStatus === 'paid'"
            type="button"
            class="mt-4 inline-flex h-9 px-4 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            :disabled="shipmentCreating"
            @click="handleCreateShipment"
          >
            {{ shipmentCreating ? 'Creating…' : 'Create Shipment Now' }}
          </button>
          <p v-if="shipmentError" class="mt-3 text-xs text-destructive">
            {{ shipmentError }}
          </p>
        </div>

        <!-- Shipment exists, tracking loading -->
        <div v-else-if="trackingLoading && !tracking" class="border border-border rounded-lg p-6 text-center">
          <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Loading Tracking</p>
        </div>

        <!-- Tracking error -->
        <div
          v-else-if="trackingError"
          class="border border-destructive/30 bg-destructive/5 rounded-lg p-4 text-sm text-destructive"
        >
          {{ trackingError }}
        </div>

        <!-- Tracking timeline -->
        <div v-else-if="tracking && trackingHistory.length" class="border border-border rounded-lg p-5">
          <!-- Current status pill -->
          <div class="flex items-center justify-between pb-4 border-b border-dashed border-border">
            <div>
              <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Current Status</p>
              <p class="mt-1 font-mono text-lg font-semibold uppercase tracking-wide">
                {{ tracking.status.replace(/_/g, ' ') }}
              </p>
            </div>
            <p class="font-mono text-[11px] text-muted-foreground">
              {{ tracking.courier.company }} · {{ tracking.courier.type }}
            </p>
          </div>

          <!-- Timeline -->
          <ol class="mt-5 space-y-5">
            <li
              v-for="(entry, idx) in trackingHistory"
              :key="entry.updated_at + idx"
              class="relative pl-8"
            >
              <span
                class="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-foreground"
                :class="idx === 0 ? 'ring-4 ring-primary/30' : ''"
              />
              <span
                v-if="idx !== trackingHistory.length - 1"
                class="absolute left-[5px] top-5 bottom-[-1.25rem] w-px bg-border"
              />
              <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {{ formatDateTime(entry.updated_at) }}
              </p>
              <p class="mt-1 font-medium uppercase tracking-wide text-sm">
                {{ entry.status.replace(/_/g, ' ') }}
              </p>
              <p v-if="entry.note" class="mt-0.5 text-sm text-muted-foreground">{{ entry.note }}</p>
            </li>
          </ol>
        </div>

        <!-- Shipment exists but no history yet -->
        <div
          v-else
          class="border border-border rounded-lg p-6 text-center"
        >
          <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {{ tracking?.status?.replace(/_/g, ' ') || 'No Updates' }}
          </p>
          <p class="mt-2 text-sm text-muted-foreground">
            Courier has not reported any movement yet.
          </p>
        </div>
      </section>

      <!-- Items -->
      <section>
        <h3 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Items ({{ order.items.length }})
        </h3>
        <ul class="border border-border rounded-lg divide-y divide-border">
          <li
            v-for="(item, idx) in order.items"
            :key="idx"
            class="p-4 flex items-start justify-between gap-4"
          >
            <div class="min-w-0">
              <p class="font-medium truncate">{{ item.name }}</p>
              <p class="font-mono text-xs text-muted-foreground mt-1">
                {{ item.quantity }} × {{ formatCurrency(item.price) }}
              </p>
            </div>
            <p class="font-mono font-semibold whitespace-nowrap">
              {{ formatCurrency(item.price * item.quantity) }}
            </p>
          </li>
        </ul>
      </section>

      <!-- Totals -->
      <section class="border-t border-dashed border-border pt-5 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Subtotal</span>
          <span class="font-mono">{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Shipping</span>
          <span class="font-mono">{{ formatCurrency(order.shipping?.price ?? 0) }}</span>
        </div>
        <div class="flex justify-between pt-3 border-t border-dashed border-border text-base font-semibold">
          <span>Total</span>
          <span class="font-mono">{{ formatCurrency(total) }}</span>
        </div>
      </section>

      <!-- Address -->
      <section v-if="addressObj">
        <h3 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Shipping To
        </h3>
        <div class="border border-border rounded-lg p-5">
          <p class="font-medium">{{ addressObj.recipientName }}</p>
          <p class="text-sm text-muted-foreground mt-1">{{ addressObj.phone }}</p>
          <p class="text-sm text-muted-foreground mt-3 leading-relaxed">
            {{ addressObj.address }}<br />
            {{ addressObj.district }}, {{ addressObj.city }}<br />
            {{ addressObj.province }} {{ addressObj.postalCode }}
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
