<script setup lang="ts">
  import { ref, computed, watch } from 'vue';

  const sourceText = ref('');
  const regexPattern = ref(String.raw`(?<=\d\.\s).*?(?=\n|$)`);
  const isRegexValid = ref(true);

  watch(regexPattern, (newVal) => {
    try {
      new RegExp(newVal, 'g');
      isRegexValid.value = true;
    } catch (e) {
      isRegexValid.value = false; 
    }
  });

  const extractionResult = computed(() => {
    if (!regexPattern.value) return '';

    try {
      const re = new RegExp(regexPattern.value, 'g');

      const matches = sourceText.value.match(re);
      return matches ? matches.join('\n') : '未匹配到内容';
    } catch (e) {
      return '';
    }
  });
</script>

<template>
  <div class="w-full max-w-2xl">
    <header class="text-center mb-10 select-none">
      <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">
        Regex Extractor
      </h1>
      <p class="text-gray-400 text-sm">
        现代化正则表达式提取工具
      </p>
    </header>

    <main class="space-y-6">
      <div class="glass p-6 rounded-3xl">
        <label class="block text-white font-medium mb-3 select-none">源文本内容</label>
        <textarea
          v-model="sourceText"
          placeholder="在此处输入或粘贴需要处理的文本..."
          rows="5"
          class="input-dark resize-y input-focus"
        ></textarea>
      </div>

      <div class="glass p-6 rounded-3xl">
        <label class="block text-white font-medium mb-3 select-none">正则表达式</label>
        <input
          v-model="regexPattern"
          type="text"
          placeholder="例如: \d+ 或 [a-z]+"
          :class="[
            'w-full px-4 py-3 bg-black/20 border rounded-xl text-gray-300 placeholder-gray-600 font-mono text-sm input-focus',
            isRegexValid
              ? 'border-white/10 focus:border-pink-500/50'
              : 'border-red-500 bg-red-500/10',
          ]"
        />
        <transition name="fade">
          <span
            v-if="!isRegexValid"
            class="block mt-2 text-red-400 text-sm select-none"
          >
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
          class="input-dark input-readonly resize-none cursor-text input-focus"
          @click="($event.target as HTMLTextAreaElement)?.select()"
        ></textarea>
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
