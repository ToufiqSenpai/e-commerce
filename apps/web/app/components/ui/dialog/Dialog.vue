<script setup lang="ts">
import { provide, computed, watch } from 'vue'
import { useMagicKeys } from '@vueuse/core'

const modelValue = defineModel<boolean>({ default: false })

const isOpen = computed(() => modelValue.value)
const close = () => {
  modelValue.value = false
}

// Provide dialog context to nested child components
provide('dialog-context', {
  isOpen,
  close,
})

// Dismiss on ESC key using VueUse
const { Escape } = useMagicKeys()
watch(Escape, (v) => {
  if (v && modelValue.value) {
    close()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      >
        <!-- Backdrop click target -->
        <div class="absolute inset-0 cursor-default" @click="close"></div>
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
