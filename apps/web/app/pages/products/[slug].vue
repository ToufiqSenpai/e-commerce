<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirmDialog } from '@vueuse/core'
import type { Product } from '~/types/strapi/product'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const { find, create, update } = useStrapi()
const user = useStrapiUser()
const slug = computed(() => route.params.slug as string)

// Fetch product data from Strapi by slug
const {
  data: productResponse,
  pending,
  error,
} = await useAsyncData(`product-${slug.value}`, () =>
  find<Product>('products', {
    filters: {
      slug: {
        $eq: slug.value,
      },
    },
    populate: '*',
  }),
)

const product = computed(() => productResponse.value?.data?.[0] || null)

// Quantity Selector
const quantity = ref(1)
const incrementQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}
const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Accordion Control
const openSection = ref<string | null>('specs') // Default open specs
const toggleSection = (section: string) => {
  if (openSection.value === section) {
    openSection.value = null
  } else {
    openSection.value = section
  }
}

// Formatting Price Helper
const formatPrice = (value: number) => {
  if (value === undefined || value === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Interactive Toast Notification Feedback
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout: NodeJS.Timeout | null = null

const triggerToast = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const { isRevealed, reveal, confirm, cancel } = useConfirmDialog()

const showLoginDialog = computed({
  get: () => isRevealed.value,
  set: (v) => {
    if (!v) cancel()
  },
})

const addingToCart = ref(false)

const redirectToLogin = () => {
  // Guard to prevent multiple redirects if button is clicked multiple times quickly
  if (route.path.startsWith('/login')) return

  // Prevent redirect loops (e.g. redirecting to login or register page)
  const redirectPath = route.path.startsWith('/register') ? '/' : route.path

  router.push({ path: '/login', query: { redirect: redirectPath } })
}

const addToCart = async () => {
  if (!product.value) return

  if (!user.value) {
    const { isCanceled } = await reveal()
    if (!isCanceled) {
      redirectToLogin()
    }
    return
  }

  addingToCart.value = true
  try {
    const response = await find<any>('carts', {
      filters: {
        users_permissions_user: {
          id: {
            $eq: user.value.id,
          },
        },
      },
      populate: {
        items: {
          populate: ['product'],
        },
      },
    })

    const existingCart = response.data?.[0]

    if (existingCart) {
      const items = existingCart.items || []
      const existingItemIndex = items.findIndex((item: any) => {
        const itemId = typeof item.product === 'object' ? item.product?.id : item.product
        return itemId === product.value.id
      })

      if (existingItemIndex > -1) {
        items[existingItemIndex].quantity += quantity.value
      } else {
        items.push({
          product: product.value.id,
          quantity: quantity.value,
          price: product.value.price,
        })
      }

      const itemsPayload = items.map((item: any) => ({
        product: typeof item.product === 'object' ? item.product.id : item.product,
        quantity: item.quantity,
        price: item.price,
      }))

      await update('carts', existingCart.id, {
        items: itemsPayload,
      })
    } else {
      await create('carts', {
        users_permissions_user: user.value.id,
        items: [
          {
            product: product.value.id,
            quantity: quantity.value,
            price: product.value.price,
          },
        ],
      })
    }

    triggerToast(`Success: Added ${quantity.value} item(s) of "${product.value.name}" to your cart!`)
  } catch (err: any) {
    console.error('Error adding to cart:', err)
    triggerToast('Error: Failed to add item to cart. Please try again.')
  } finally {
    addingToCart.value = false
  }
}

const buyNow = () => {
  if (product.value) {
    triggerToast(`Success: Redirecting to checkout with ${quantity.value} item(s) of "${product.value.name}"!`)
  }
}

// Wishlist Control
const isWishlisted = ref(false)
const toggleWishlist = () => {
  if (product.value) {
    isWishlisted.value = !isWishlisted.value
    triggerToast(
      isWishlisted.value
        ? `Added "${product.value.name}" to your Wishlist!`
        : `Removed "${product.value.name}" from your Wishlist!`,
    )
  }
}

// User Reviews Placeholder Data
const reviews = ref([
  {
    id: 1,
    userName: 'Alex Johnson',
    rating: 5,
    date: 'July 14, 2026',
    title: 'Incredible upgrade!',
    comment:
      'The performance boost from the A19 chip is immediately noticeable. Battery life easily lasts two days of medium use. The camera pictures are stunningly sharp.',
  },
  {
    id: 2,
    userName: 'Sarah Miller',
    rating: 4,
    date: 'July 10, 2026',
    title: 'Beautiful titanium design',
    comment:
      'The new natural titanium color looks so elegant. The phone feels noticeably lighter than previous pro models. Dropped a star because delivery took a couple of days longer than expected.',
  },
  {
    id: 3,
    userName: 'Daniel Lee',
    rating: 5,
    date: 'June 28, 2026',
    title: 'The best camera in any smartphone',
    comment:
      'As a photographer, the zoom range and low-light capabilities on this phone are game-changing. Highly recommend if you use your phone for professional content creation.',
  },
])
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
    <!-- 1. Loading State -->
    <div v-if="pending" class="min-h-[50vh] flex flex-col items-center justify-center gap-4" aria-busy="true">
      <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <span class="text-muted-foreground font-medium">Loading product details...</span>
    </div>

    <!-- 2. Error or Not Found State -->
    <div
      v-else-if="error || !product"
      class="min-h-[50vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
    >
      <span class="text-6xl mb-6">🔍</span>
      <h1 class="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
      <p class="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
      <NuxtLink
        to="/products"
        class="px-6 h-12 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all"
      >
        Back to Products
      </NuxtLink>
    </div>

    <!-- 3. Main Product Detail Content -->
    <div v-else>
      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <!-- Left Column: Carousel Image Gallery -->
        <ProductImageCarousel :images="product.images" :productName="product.name" />

        <!-- Right Column: Product Info & Details -->
        <div class="flex flex-col gap-6">
          <!-- Category & Rating Headers -->
          <div class="space-y-2">
            <span
              v-if="product.product_category"
              class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider"
            >
              {{ product.product_category.name }}
            </span>
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {{ product.name }}
            </h1>

            <!-- Rating Star Indicator -->
            <div class="flex items-center gap-2 mt-2">
              <div class="flex text-amber-400">
                <svg v-for="i in 5" :key="i" class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <span class="text-sm font-semibold text-foreground">4.8</span>
              <span class="text-muted-foreground/80 text-sm">(120 customer reviews)</span>
            </div>
          </div>

          <!-- Pricing and Stock Status -->
          <div class="flex items-baseline justify-between py-4 border-y border-border/80">
            <div class="space-y-1">
              <span class="text-sm text-muted-foreground block font-medium">Price</span>
              <span class="text-2xl md:text-3xl font-extrabold text-foreground">{{ formatPrice(product.price) }}</span>
            </div>
            <div>
              <span class="text-sm font-semibold" :class="product.stock > 0 ? 'text-emerald-600' : 'text-destructive'">
                {{ product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock' }}
              </span>
            </div>
          </div>

          <!-- Quantity & Buying Action Layout -->
          <div class="space-y-4 pt-2">
            <!-- Quantity Row -->
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-foreground">Quantity</span>
              <div class="flex items-center border border-border rounded-lg bg-muted/30">
                <button
                  type="button"
                  @click="decrementQuantity"
                  class="flex h-10 w-10 items-center justify-center rounded-l-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
                  :disabled="quantity <= 1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span class="w-12 text-center text-sm font-bold text-foreground">{{ quantity }}</span>
                <button
                  type="button"
                  @click="incrementQuantity"
                  class="flex h-10 w-10 items-center justify-center rounded-r-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
                  :disabled="quantity >= product.stock"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Checkout Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                @click="addToCart"
                :disabled="addingToCart || product.stock <= 0"
                class="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-primary text-primary hover:bg-primary/5 text-sm font-semibold transition-all cursor-pointer hover:scale-101 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="addingToCart"
                  class="animate-spin h-5 w-5 text-primary"
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
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
              </button>
              <button
                type="button"
                @click="buyNow"
                class="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold shadow-md transition-all cursor-pointer hover:scale-101"
              >
                Buy Now
              </button>
              <button
                type="button"
                @click="toggleWishlist"
                class="h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer hover:scale-101"
                :class="isWishlisted ? 'text-destructive border-destructive/20 bg-destructive/5' : ''"
                title="Add to Wishlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  :fill="isWishlisted ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-transform duration-200"
                  :class="isWishlisted ? 'scale-110' : ''"
                >
                  <path
                    d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Accordions: Spec and Shipping Info -->
          <div class="mt-6 border-t border-border">
            <!-- Accordion 1: Specifications -->
            <div class="border-b border-border">
              <button
                type="button"
                @click="toggleSection('specs')"
                class="flex w-full items-center justify-between py-4 text-left font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>Specifications & Dimensions</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-transform duration-200"
                  :class="openSection === 'specs' ? 'rotate-180' : ''"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div v-show="openSection === 'specs'" class="pb-4">
                <table class="w-full text-sm text-left border-collapse">
                  <tbody>
                    <tr class="border-b border-border/40">
                      <td class="py-2.5 font-medium text-muted-foreground w-1/3">Weight</td>
                      <td class="py-2.5 text-foreground">{{ product.weight }} g</td>
                    </tr>
                    <tr class="border-b border-border/40">
                      <td class="py-2.5 font-medium text-muted-foreground">Width</td>
                      <td class="py-2.5 text-foreground">{{ product.width }} mm</td>
                    </tr>
                    <tr class="border-b border-border/40">
                      <td class="py-2.5 font-medium text-muted-foreground">Height</td>
                      <td class="py-2.5 text-foreground">{{ product.height }} mm</td>
                    </tr>
                    <tr>
                      <td class="py-2.5 font-medium text-muted-foreground">Length/Thickness</td>
                      <td class="py-2.5 text-foreground">{{ product.length }} mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Accordion 2: Shipping Info -->
            <div class="border-b border-border">
              <button
                type="button"
                @click="toggleSection('shipping')"
                class="flex w-full items-center justify-between py-4 text-left font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>Shipping & Return Info</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-transform duration-200"
                  :class="openSection === 'shipping' ? 'rotate-180' : ''"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                v-show="openSection === 'shipping'"
                class="pb-4 space-y-2 text-sm text-muted-foreground leading-relaxed"
              >
                <p>
                  📍 **Worldwide Delivery:** Standard shipping takes 3-7 business days depending on destination. Express
                  overnight options are available at checkout.
                </p>
                <p>
                  🛡️ **Safe Packaging:** All items are shipped in shock-absorbent, tamper-proof, biodegradable packaging
                  to ensure arrival in perfect condition.
                </p>
                <p>
                  🔄 **Easy Returns:** We offer a 30-day money-back guarantee. If you are not satisfied with your
                  purchase, you can return it within 30 days in its original packaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Description (Full Width) -->
      <div class="mt-16 pt-10 border-t border-border/80">
        <h2 class="text-xl md:text-2xl font-bold text-foreground mb-6">Description</h2>
        <div class="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          <BlocksRenderer :blocks="product.description" />
        </div>
      </div>

      <!-- User Reviews Section (Placeholder) -->
      <div class="mt-16 pt-10 border-t border-border/80">
        <h2 class="text-xl md:text-2xl font-bold text-foreground mb-8">Customer Reviews</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Review Summary Sidebar -->
          <div class="space-y-4">
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-extrabold text-foreground">4.8</span>
              <span class="text-muted-foreground text-sm">out of 5</span>
            </div>
            <!-- Stars -->
            <div class="flex text-amber-400">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
            <p class="text-xs text-muted-foreground">Based on 120 ratings</p>

            <!-- Rating Bars -->
            <div class="space-y-2 pt-2">
              <div v-for="r in [5, 4, 3, 2, 1]" :key="r" class="flex items-center gap-3 text-xs">
                <span class="w-8 font-medium text-muted-foreground">{{ r }} star</span>
                <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full bg-amber-400 rounded-full"
                    :style="{ width: r === 5 ? '80%' : r === 4 ? '15%' : r === 3 ? '3%' : '1%' }"
                  ></div>
                </div>
                <span class="w-8 text-right text-muted-foreground font-medium">{{
                  r === 5 ? '80%' : r === 4 ? '15%' : r === 3 ? '3%' : '1%'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Review List -->
          <div class="lg:col-span-2 space-y-6 divide-y divide-border/60">
            <div v-for="rev in reviews" :key="rev.id" class="pt-6 first:pt-0">
              <div class="flex items-center justify-between gap-4 mb-2">
                <div class="flex items-center gap-3">
                  <!-- User avatar -->
                  <div
                    class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase"
                  >
                    {{
                      rev.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    }}
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-foreground leading-none">
                      {{ rev.userName }}
                    </h4>
                    <!-- Stars -->
                    <div class="flex text-amber-400 mt-1">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        class="w-3.5 h-3.5 fill-current"
                        :class="i <= rev.rating ? 'text-amber-400' : 'text-muted-foreground/30'"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <span class="text-xs text-muted-foreground">{{ rev.date }}</span>
              </div>
              <h5 class="text-sm font-semibold text-foreground mt-2 mb-1">{{ rev.title }}</h5>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ rev.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Visual Interactive Toast Notification -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        enter-to-class="opacity-100 translate-y-0 sm:translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showToast"
          class="fixed bottom-5 right-5 z-50 max-w-md bg-card border border-primary/20 rounded-xl shadow-lg p-4 flex items-center gap-3"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="text-sm font-medium text-foreground">
            {{ toastMessage }}
          </div>
        </div>
      </Transition>

      <!-- Login Required Prompt Dialog -->
      <Dialog v-model="showLoginDialog">
        <DialogContent>
          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <div class="space-y-1">
                <DialogTitle>Login Required</DialogTitle>
                <DialogDescription>
                  Please log in to add items to your shopping cart and complete your purchase.
                </DialogDescription>
              </div>
            </div>

            <DialogFooter class="pt-2">
              <DialogClose>
                <button
                  type="button"
                  class="h-11 px-5 rounded-xl border border-border bg-background hover:bg-muted text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                @click="confirm"
                class="h-11 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                Log In
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
