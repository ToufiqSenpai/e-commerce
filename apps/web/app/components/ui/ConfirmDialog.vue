<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false })

defineProps<{
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>()

const emit = defineEmits(['confirm', 'cancel'])

const handleCancel = () => {
  modelValue.value = false
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      >
        <!-- Backdrop click closes modal -->
        <div class="absolute inset-0" @click="handleCancel"></div>

        <Transition
          enter-active-class="transition duration-200 ease-out delay-75"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="modelValue"
            class="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 overflow-hidden z-10 flex flex-col gap-4"
          >
            <!-- Content Header -->
            <div class="flex items-start gap-3">
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
              <div class="space-y-1">
                <h3 class="text-lg font-semibold leading-none">{{ title || 'Confirm Action' }}</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ message || 'Are you sure you want to perform this action?' }}
                </p>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                :disabled="loading"
                class="h-10 px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                @click="handleCancel"
              >
                {{ cancelText || 'Cancel' }}
              </button>
              <button
                type="button"
                :disabled="loading"
                class="h-10 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                @click="handleConfirm"
              >
                <svg
                  v-if="loading"
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
                <span>{{ confirmText || 'Confirm' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
