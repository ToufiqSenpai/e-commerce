<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  id: string
  label: string
  type?: string
  placeholder?: string
  error?: string
}>()
</script>

<template>
  <div>
    <div v-if="$slots['label-append']" class="flex items-center justify-between mb-1">
      <label :for="id" class="block text-sm font-medium">{{ label }}</label>
      <slot name="label-append" />
    </div>
    <label v-else :for="id" class="block text-sm font-medium mb-1">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type ?? 'text'"
      :required="type !== 'checkbox'"
      :class="[
        'w-full h-11 px-4 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
        error ? 'border-destructive' : 'border-border',
      ]"
      :placeholder="placeholder"
    />
    <p v-if="error" class="mt-1 text-sm text-destructive">{{ error }}</p>
  </div>
</template>
