<script setup lang="ts">
interface InlineNode {
  type: string
  text?: string
  url?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  children?: InlineNode[]
}

defineProps<{
  nodes: InlineNode[]
}>()
</script>

<template>
  <template v-for="(node, idx) in nodes" :key="idx">
    <!-- Link node -->
    <NuxtLink
      v-if="node.type === 'link'"
      :to="node.url"
      class="text-primary hover:underline transition-colors font-medium inline-flex items-center"
      target="_blank"
      rel="noopener noreferrer"
    >
      <template #default="{ href }">
        <a :href="href" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          <template v-for="(linkChild, lcIdx) in node.children" :key="lcIdx">
            <span
              :class="{
                'font-bold': linkChild.bold,
                italic: linkChild.italic,
                underline: linkChild.underline,
                'line-through': linkChild.strikethrough,
                'bg-muted/70 px-1 py-0.5 rounded text-xs font-mono text-muted-foreground': linkChild.code,
              }"
              >{{ linkChild.text }}</span
            >
          </template>
        </a>
      </template>
    </NuxtLink>

    <!-- Standard Text node -->
    <span
      v-else-if="node.type === 'text'"
      :class="{
        'font-bold': node.bold,
        italic: node.italic,
        underline: node.underline,
        'line-through': node.strikethrough,
        'bg-muted/70 px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground': node.code,
      }"
      >{{ node.text }}</span
    >
  </template>
</template>
