<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfirmDialog } from '@vueuse/core'
import type { Strapi5ResponseMany } from '@nuxtjs/strapi'
import type { Address } from '~/types/strapi/address'

const { find, delete: destroy } = useStrapi()
const {
  data: addresses,
  pending,
  refresh,
} = await useAsyncData<Strapi5ResponseMany<Address>>('addresses', () =>
  find('addresses', {
    sort: 'isDefault:desc',
  }),
)

const { isRevealed, reveal, confirm, cancel, onConfirm } = useConfirmDialog()
const addressToDelete = ref<Address | null>(null)
const deletingAddress = ref(false)

const isDialogOpen = computed({
  get: () => isRevealed.value,
  set: (value) => {
    if (!value) {
      cancel()
    }
  },
})

const confirmDelete = (address: Address) => {
  addressToDelete.value = address
  reveal()
}

onConfirm(async () => {
  if (!addressToDelete.value) return

  try {
    deletingAddress.value = true
    await destroy('addresses', addressToDelete.value.documentId)

    // Refresh the local addresses data
    await refresh()
  } catch (error) {
    console.error('Failed to delete address:', error)
  } finally {
    deletingAddress.value = false
    addressToDelete.value = null
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Saved Addresses</h3>
        <p class="text-sm text-muted-foreground">Manage your shipping and billing addresses.</p>
      </div>
      <button
        class="h-9 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
        @click="navigateTo('/account/address/new')"
      >
        Add Address
      </button>
    </div>

    <div v-if="pending" class="text-sm text-muted-foreground">Loading addresses...</div>

    <div v-else-if="!addresses?.data?.length" class="text-center py-10 border border-dashed border-border rounded-xl">
      <p class="text-sm text-muted-foreground">You don't have any saved addresses yet.</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="address in addresses.data"
        :key="address.id"
        class="p-5 border border-border rounded-xl bg-card relative shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between group"
      >
        <div>
          <div
            v-if="address.isDefault"
            class="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full"
          >
            Default
          </div>
          <p class="font-semibold text-base">{{ address.recipientName }}</p>
          <p class="text-sm text-muted-foreground mt-1">{{ address.phone }}</p>
          <p class="text-sm text-muted-foreground mt-3 leading-relaxed">
            {{ address.address }}<br />
            {{ address.district }}, {{ address.city }}<br />
            {{ address.province }} {{ address.postalCode }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 mt-5 pt-4 border-t border-border/60">
          <button
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            @click="navigateTo('/account/address/' + address.documentId)"
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
          <button
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
            @click="confirmDelete(address)"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Composable Delete Confirmation Dialog -->
    <Dialog v-model="isDialogOpen">
      <DialogContent>
        <DialogHeader class="flex-row items-start gap-3 text-left">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
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
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter>
          <DialogClose>
            <button
              type="button"
              :disabled="deletingAddress"
              class="h-10 px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            :disabled="deletingAddress"
            class="h-10 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            @click="confirm"
          >
            <svg
              v-if="deletingAddress"
              class="animate-spin h-4 w-4 text-destructive-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Delete</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
