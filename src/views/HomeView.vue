<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const tools = [
  {
    id: 'bili-check',
    name: 'Bili Check',
    desc: '让分 P 视频学习更有条理',
    icon: '📺',
    path: '/tools/bili-check'
  }
]

const navigateToTool = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
    <div
      v-for="tool in tools"
      :key="tool.id"
      @click="navigateToTool(tool.path)"
      class="glass glass-hover p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      <div class="text-5xl mb-4">{{ tool.icon }}</div>
      <h3 class="text-xl font-semibold text-white mb-2">{{ tool.name }}</h3>
      <p class="text-gray-400">{{ tool.desc }}</p>
    </div>
  </div>
</template>
