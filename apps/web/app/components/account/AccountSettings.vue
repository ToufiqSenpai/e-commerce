<script setup lang="ts">
const user = useStrapiUser()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium">Account Settings</h3>
      <p class="text-sm text-muted-foreground">Manage your account profile and preferences.</p>
    </div>

    <div v-if="user" class="space-y-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Username</label>
        <div class="p-3 bg-muted rounded-md border border-border text-sm">{{ user.username }}</div>
      </div>
      <div class="grid gap-2">
        <label class="text-sm font-medium">Email Address</label>
        <div class="p-3 bg-muted rounded-md border border-border text-sm">{{ user.email }}</div>
      </div>
    </div>
  </div>
</template>
