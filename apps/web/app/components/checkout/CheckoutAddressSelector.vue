<script setup lang="ts">
import type { Address } from '~/types/strapi/address'

const props = defineProps<{
  addresses: Address[]
}>()

const selectedAddress = defineModel<Address | null>('modelValue', { default: null })

// Pre-select default address on mount
const defaultAddress = props.addresses.find((a) => a.isDefault)
if (defaultAddress && !selectedAddress.value) {
  selectedAddress.value = defaultAddress
}

const isSelected = (address: Address) => selectedAddress.value?.documentId === address.documentId
</script>

<template>
  <section class="space-y-4" aria-labelledby="address-title">
    <div class="flex items-center justify-between">
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
            <path
              d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
            />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h2 id="address-title" class="text-lg font-semibold text-foreground">Shipping Address</h2>
      </div>
      <NuxtLink
        to="/account/address/new?redirect=/checkout"
        class="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        + Add New
      </NuxtLink>
    </div>

    <!-- No addresses state -->
    <div
      v-if="addresses.length === 0"
      class="p-6 border-2 border-dashed border-border rounded-xl text-center space-y-3"
    >
      <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
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
          <path
            d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <p class="text-sm text-muted-foreground">No saved addresses found.</p>
      <NuxtLink
        to="/account/address/new?redirect=/checkout"
        class="inline-flex items-center justify-center h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Add Your First Address
      </NuxtLink>
    </div>

    <!-- Address cards -->
    <div v-else class="space-y-3">
      <button
        v-for="address in addresses"
        :key="address.documentId"
        type="button"
        class="w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group"
        :class="
          isSelected(address)
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
        "
        @click="selectedAddress = address"
      >
        <div class="flex items-start gap-3">
          <!-- Radio indicator -->
          <div class="mt-0.5 shrink-0">
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="isSelected(address) ? 'border-primary' : 'border-muted-foreground/40'"
            >
              <div v-if="isSelected(address)" class="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
          </div>

          <!-- Address content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm text-foreground">{{ address.recipientName }}</span>
              <span
                v-if="address.isDefault"
                class="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full"
              >
                Default
              </span>
            </div>
            <p class="text-sm text-muted-foreground mt-0.5">{{ address.phone }}</p>
            <p class="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {{ address.address }}<br />
              {{ address.district }}, {{ address.city }}<br />
              {{ address.province }} {{ address.postalCode }}
            </p>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
