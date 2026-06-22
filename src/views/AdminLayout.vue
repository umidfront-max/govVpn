<script setup>
import { useUiStore } from '@/stores/ui'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'

const ui = useUiStore()
</script>

<template>
  <div class="grid grid-cols-1 nav:grid-cols-[248px_1fr] min-h-screen">
    <Sidebar />
    <main class="min-w-0 flex flex-col">
      <Topbar />
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>

    <!-- mobile scrim -->
    <div
      v-if="ui.sidebarOpen"
      class="fixed inset-0 bg-[rgba(5,9,18,0.6)] backdrop-blur-[3px] z-40 nav:hidden"
      @click="ui.sidebarOpen = false"
    />
  </div>
</template>
