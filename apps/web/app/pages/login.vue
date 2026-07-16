<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { login } = useStrapiAuth()
const router = useRouter()
const route = useRoute()

const identifier = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!identifier.value || !password.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await login({ identifier: identifier.value, password: password.value })
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
          <div>
            <label for="identifier" class="block text-sm font-medium mb-1">Email or Username</label>
            <input
              id="identifier"
              v-model="identifier"
              type="text"
              required
              class="w-full h-11 px-4 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-sm font-medium">Password</label>
              <a href="#" class="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full h-11 px-4 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>
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
