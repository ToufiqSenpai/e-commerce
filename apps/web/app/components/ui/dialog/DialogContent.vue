<script setup lang="ts">
import { inject, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const context = inject<{ isOpen: { value: boolean }; close: () => void }>('dialog-context')
if (!context) {
  throw new Error('DialogContent must be used inside a Dialog component')
}

// Access injected close function and state
const { close, isOpen } = context

// Ref for click outside and focus trap
const contentRef = ref<HTMLElement | null>(null)

// Focus Trap using VueUse
const { hasFocus, activate, deactivate } = useFocusTrap(contentRef, {
  immediate: true,
  escapeDeactivates: false, // Dialog.vue handles Escape key
  allowOutsideClick: true, // Backdrop overlay handles click outside
})

onClickOutside(contentRef, () => {
  close()
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out delay-75"
    enter-from-class="opacity-0 scale-95 translate-y-2"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-2"
  >
    <div
      v-if="isOpen"
      ref="contentRef"
      class="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 overflow-hidden z-10 flex flex-col gap-4 focus:outline-none"
      role="dialog"
      aria-modal="true"
    >
      <slot />
    </div>
  </Transition>
</template>
