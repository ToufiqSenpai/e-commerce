<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const { login } = useStrapiAuth()
const router = useRouter()
const route = useRoute()

const form = reactive({
  identifier: '',
  password: '',
})
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!form.identifier || !form.password) return

  loading.value = true
  errorMessage.value = ''

  try {
    await login({ identifier: form.identifier, password: form.password })
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (error: any) {
    errorMessage.value = error.error?.message || 'Invalid email or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p class="mt-2 text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <FormField
            id="identifier"
            v-model="form.identifier"
            label="Email or Username"
            placeholder="you@example.com"
          />

          <FormField id="password" v-model="form.password" label="Password" type="password" placeholder="••••••••">
            <template #label-append>
              <a href="#" class="text-xs text-primary hover:underline">Forgot password?</a>
            </template>
          </FormField>
        </div>

        <div
          v-if="errorMessage"
          class="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20"
        >
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full h-11 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span
            v-if="loading"
            class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"
          ></span>
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="text-center text-sm text-muted-foreground">
        Don't have an account?
        <NuxtLink to="/register" class="text-primary font-medium hover:underline">Sign up</NuxtLink>
      </p>
    </div>
  </div>
</template>
