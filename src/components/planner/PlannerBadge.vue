<script setup lang="ts">
defineProps<{
  color?: string
  title?: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-sm font-semibold"
    :style="color ? { color } : undefined"
    :title="title"
  >
    <slot />
  </span>
</template>
