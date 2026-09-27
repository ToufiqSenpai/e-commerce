<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/strapi/order'

const { fetchOrders } = useOrders()

const { data: orders, pending, error, refresh } = await useAsyncData<Order[]>(
  'orders-list',
  () => fetchOrders(),
  { default: () => [] },
)

const STATUS_CONFIG: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: 'Awaiting Payment', tone: 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/40' },
  paid: { label: 'Paid', tone: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40' },
  failed: { label: 'Failed', tone: 'border-red-300 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40' },
  expired: { label: 'Expired', tone: 'border-zinc-300 bg-zinc-50 text-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-300 dark:border-zinc-700/40' },
}

function formatId(id: string | undefined): string {
  if (!id) return '—'
  return id.slice(0, 8).toUpperCase()
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function orderTotal(order: Order): number {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return subtotal + (order.shipping?.price ?? 0)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-dashed border-border pb-4">
      <div>
        <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">Manifest</p>
        <h3 class="text-2xl font-semibold mt-1">My Orders</h3>
      </div>
      <button
        type="button"
        class="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        :disabled="pending"
        @click="refresh()"
      >
        {{ pending ? 'Syncing…' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending && !orders?.length" class="space-y-3" aria-busy="true">
      <div v-for="i in 3" :key="i" class="h-24 bg-muted/50 animate-pulse rounded-lg" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="border border-destructive/30 bg-destructive/5 rounded-lg p-5 text-sm text-destructive"
    >
      <p class="font-medium">Failed to load orders</p>
      <p class="text-destructive/70 mt-1">{{ error.message }}</p>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!orders?.length"
      class="border border-dashed border-border rounded-lg py-14 px-6 text-center"
    >
      <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">No Records</p>
      <p class="mt-3 text-foreground font-medium">You haven't placed any orders yet.</p>
      <NuxtLink
        to="/products"
        class="mt-5 inline-flex h-10 px-5 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Start Shopping
      </NuxtLink>
    </div>

    <!-- Order list -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="order in orders"
        :key="order.documentId"
        :to="`/account/orders/${order.documentId}`"
        class="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
      >
        <article
          class="border border-border rounded-lg p-5 bg-card transition-colors group-hover:border-foreground/30"
        >
          <!-- Manifest-style header strip -->
          <div class="flex items-start justify-between gap-4 pb-4 border-b border-dashed border-border">
            <div class="min-w-0">
              <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Order</p>
              <p class="font-mono text-base font-semibold text-foreground mt-0.5 truncate">
                #{{ formatId(order.midtransOrderId) }}
              </p>
            </div>
            <span
              :class="[
                'shrink-0 px-2.5 py-1 rounded-md border text-[11px] font-mono uppercase tracking-wider',
                STATUS_CONFIG[order.orderStatus].tone,
              ]"
            >
              {{ STATUS_CONFIG[order.orderStatus].label }}
            </span>
          </div>

          <!-- Items + meta grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-sm">
            <div>
              <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Date</p>
              <p class="mt-1 text-foreground">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div>
              <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Items</p>
              <p class="mt-1 text-foreground">
                {{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}
              </p>
            </div>
            <div>
              <p class="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Total</p>
              <p class="mt-1 font-mono font-semibold text-foreground">
                {{ formatCurrency(orderTotal(order)) }}
              </p>
            </div>
          </div>
        </article>
      </NuxtLink>
    </div>
  </div>
</template>
