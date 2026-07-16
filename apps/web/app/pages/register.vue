<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { register } = useStrapiAuth()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.error?.message || 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight">Create an account</h2>
        <p class="mt-2 text-sm text-muted-foreground">Join us to start shopping for premium items</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full h-11 px-4 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium mb-1">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full h-11 px-4 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
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
          {{ loading ? 'Creating account...' : 'Sign up' }}
        </button>
      </form>

      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/login" class="text-primary font-medium hover:underline">Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>
