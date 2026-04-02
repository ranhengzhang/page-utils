<script setup lang="ts">
import { ref, computed } from 'vue'

const sourceText = ref('')
const regexPattern = ref(String.raw`(?<=\d\.\s).*?(?=\n|$)`)
const isRegexValid = ref(true)

const extractionResult = computed(() => {
  if (!regexPattern.value) return ''

  try {
    const re = new RegExp(regexPattern.value, 'g')
    isRegexValid.value = true

    const matches = sourceText.value.match(re)
    return matches ? matches.join('\n') : '未匹配到内容'
  } catch (e) {
    isRegexValid.value = false
    return ''
  }
})
</script>

<template>
  <div class="w-full max-w-2xl">
    <header class="text-center mb-10 select-none">
      <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">
        Regex Extractor
      </h1>
      <p class="text-gray-400 text-sm">现代化正则表达式提取工具</p>
    </header>

    <main class="space-y-6">
      <div class="glass p-6 rounded-3xl">
        <label class="block text-white font-medium mb-3 select-none">源文本内容</label>
        <textarea
          v-model="sourceText"
          placeholder="在此处输入或粘贴需要处理的文本..."
          rows="5"
          class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50 resize-y"
        />
      </div>

      <div class="glass p-6 rounded-3xl">
        <label class="block text-white font-medium mb-3 select-none">正则表达式</label>
        <input
          v-model="regexPattern"
          type="text"
          placeholder="例如: \d+ 或 [a-z]+"
          :class="[
            'w-full px-4 py-3 bg-black/20 border rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none font-mono text-sm',
            isRegexValid ? 'border-white/10 focus:border-pink-500/50' : 'border-red-500 bg-red-500/10',
          ]"
        />
        <transition name="fade">
          <span v-if="!isRegexValid" class="block mt-2 text-red-400 text-sm select-none">
            ⚠️ 非法的正则表达式格式
          </span>
        </transition>
      </div>

      <div class="glass p-6 rounded-3xl">
        <label class="block text-white font-medium mb-3 select-none">提取结果 (只读)</label>
        <textarea
          :value="isRegexValid ? extractionResult : ''"
          readonly
          placeholder="提取出的内容将显示在这里..."
          rows="5"
          class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none resize-none cursor-text"
          @click="($event.target as HTMLTextAreaElement)?.select()"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
