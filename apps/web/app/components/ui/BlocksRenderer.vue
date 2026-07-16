<script setup lang="ts">
import { ref } from 'vue'

interface BlockNode {
  type: string
  level?: number
  format?: 'ordered' | 'unordered'
  image?: {
    name: string
    alternativeText: string
    url: string
    width: number
    height: number
  }
  children: any[]
}

defineProps<{
  blocks: BlockNode[] | null | undefined
}>()

const strapiUrl = ref('http://localhost:1337')

try {
  const runtimeConfig = useRuntimeConfig()
  if (runtimeConfig.public?.strapi?.url) {
    strapiUrl.value = runtimeConfig.public.strapi.url
  }
} catch (e) {
  // Safe fallback
}

const resolveImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${strapiUrl.value}${url}`
}
</script>

<template>
  <div class="strapi-blocks-renderer">
    <!-- 1. Handle Blocks JSON Array -->
    <template v-if="Array.isArray(blocks) && blocks.length > 0">
      <template v-for="(block, bIdx) in blocks" :key="bIdx">
        <!-- Paragraph -->
        <p v-if="block.type === 'paragraph'" class="mb-4 last:mb-0 leading-relaxed text-muted-foreground">
          <BlocksInline :nodes="block.children" />
        </p>

        <!-- Headings -->
        <h1
          v-else-if="block.type === 'heading' && block.level === 1"
          class="text-3xl font-extrabold text-foreground mt-8 mb-4"
        >
          <BlocksInline :nodes="block.children" />
        </h1>
        <h2
          v-else-if="block.type === 'heading' && block.level === 2"
          class="text-2xl font-bold text-foreground mt-6 mb-3"
        >
          <BlocksInline :nodes="block.children" />
        </h2>
        <h3
          v-else-if="block.type === 'heading' && block.level === 3"
          class="text-xl font-bold text-foreground mt-5 mb-2"
        >
          <BlocksInline :nodes="block.children" />
        </h3>
        <h4
          v-else-if="block.type === 'heading' && block.level === 4"
          class="text-lg font-bold text-foreground mt-4 mb-2"
        >
          <BlocksInline :nodes="block.children" />
        </h4>
        <h5
          v-else-if="block.type === 'heading' && block.level === 5"
          class="text-base font-bold text-foreground mt-4 mb-2"
        >
          <BlocksInline :nodes="block.children" />
        </h5>
        <h6
          v-else-if="block.type === 'heading' && block.level === 6"
          class="text-sm font-bold text-foreground mt-4 mb-2"
        >
          <BlocksInline :nodes="block.children" />
        </h6>

        <!-- List -->
        <ol
          v-else-if="block.type === 'list' && block.format === 'ordered'"
          class="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground"
        >
          <li v-for="(item, iIdx) in block.children" :key="iIdx" class="leading-relaxed">
            <BlocksInline :nodes="item.children" />
          </li>
        </ol>
        <ul
          v-else-if="block.type === 'list' && block.format === 'unordered'"
          class="list-disc pl-6 mb-4 space-y-2 text-muted-foreground"
        >
          <li v-for="(item, iIdx) in block.children" :key="iIdx" class="leading-relaxed">
            <BlocksInline :nodes="item.children" />
          </li>
        </ul>

        <!-- Quote -->
        <blockquote
          v-else-if="block.type === 'quote'"
          class="border-l-4 border-primary pl-4 italic text-muted-foreground my-6 bg-primary/5 py-2 pr-4 rounded-r-lg"
        >
          <BlocksInline :nodes="block.children" />
        </blockquote>

        <!-- Code Block -->
        <pre
          v-else-if="block.type === 'code'"
          class="bg-muted p-4 rounded-xl overflow-x-auto font-mono text-sm mb-4 leading-relaxed border border-border/60"
        >
          <code><BlocksInline :nodes="block.children" /></code>
        </pre>

        <!-- Image -->
        <div v-else-if="block.type === 'image'" class="my-6">
          <NuxtImg
            v-if="block.image"
            :src="resolveImageUrl(block.image.url)"
            :alt="block.image.alternativeText || ''"
            :width="block.image.width"
            :height="block.image.height"
            class="rounded-2xl max-w-full h-auto mx-auto border border-border/40 object-cover shadow-sm"
          />
        </div>
      </template>
    </template>

    <!-- 2. Handle default slot fallback -->
    <template v-else>
      <slot />
    </template>
  </div>
</template>
