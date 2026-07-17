<script setup lang="ts">
import { inject } from 'vue'

const context = inject<{ close: () => void }>('dialog-context')
if (!context) {
  throw new Error('DialogClose must be used inside a Dialog component')
}
</script>

<template>
  <div class="contents" @click="context.close">
    <slot />
  </div>
</template>
