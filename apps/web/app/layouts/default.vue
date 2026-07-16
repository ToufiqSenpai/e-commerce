<template>
  <div class="min-h-screen flex flex-col font-sans">
    <SiteNavbar />
    <main class="flex-1 container max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-8 md:py-12">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
