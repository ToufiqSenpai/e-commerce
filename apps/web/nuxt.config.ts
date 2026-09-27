import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Register global CSS
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/test-utils',
    '@nuxtjs/device',
    '@nuxt/icon',
    '@nuxt/a11y',
    '@nuxtjs/color-mode',
    '@nuxtjs/seo',
    '@nuxtjs/strapi',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    version: 'v5',
    cookie: {
      path: '/',
      maxAge: 14 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true,
      httpOnly: false,
    },
    cookieName: 'strapi',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Configure color mode (system default with empty suffix for Tailwind compatibility)
  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: '',
  },
})
