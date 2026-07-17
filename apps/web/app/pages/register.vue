<script setup lang="ts">
import type { Strapi5Error } from '@nuxtjs/strapi'
import { useRouter } from 'vue-router'
import { parseStrapiError } from '~/helpers/strapi-validation'

const { register } = useStrapiAuth()
const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
})
const loading = ref(false)
let fieldErrors = reactive<Record<string, string>>({})

const handleRegister = async () => {
  if (!form.username || !form.email || !form.password) return

  loading.value = true
  fieldErrors = {}

  try {
    await register({
      username: form.username,
      email: form.email,
      password: form.password,
    })
    router.push('/')
  } catch (error) {
    const parsed = parseStrapiError(error as Strapi5Error)

    if (parsed.name === 'ValidationError') {
      fieldErrors = parsed.fieldErrors
    } else if (parsed.name === 'InternalServerError') {
      fieldErrors.email = 'Email is already exists.'
    }
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
          <FormField
            id="username"
            v-model="form.username"
            label="Username"
            placeholder="johndoe"
            :error="fieldErrors.username"
          />

          <FormField
            id="email"
            v-model="form.email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            :error="fieldErrors.email"
          />

          <FormField
            id="password"
            v-model="form.password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="fieldErrors.password"
          />
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
