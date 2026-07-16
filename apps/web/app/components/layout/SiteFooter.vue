<script setup lang="ts">
const globalData = await useGlobalSettings()
</script>

<template>
  <footer class="border-t bg-muted/20 mt-auto">
    <div class="container max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <h3 class="font-bold text-lg text-primary">{{ globalData?.siteName }}</h3>
          <p class="text-sm text-muted-foreground">
            Your premium destination for the finest products. Quality guaranteed.
          </p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Shop</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" class="hover:text-primary">All Products</a></li>
            <li><a href="#" class="hover:text-primary">Categories</a></li>
            <li><a href="#" class="hover:text-primary">New Arrivals</a></li>
            <li><a href="#" class="hover:text-primary">Discounts</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Support</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" class="hover:text-primary">Help Center</a></li>
            <li><a href="#" class="hover:text-primary">Returns</a></li>
            <li><a href="#" class="hover:text-primary">Shipping</a></li>
            <li><a href="#" class="hover:text-primary">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" class="hover:text-primary">Terms of Service</a></li>
            <li><a href="#" class="hover:text-primary">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-primary">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {{ new Date().getFullYear() }} {{ globalData?.siteName }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
