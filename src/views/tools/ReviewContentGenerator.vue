<script setup lang="ts">
import { ref } from 'vue';
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
} from 'reka-ui';
import OffsetCard from './components/OffsetCard.vue';
import SplitCard from './components/SplitCard.vue';
import MergeCard from './components/MergeCard.vue';

const clipboard = navigator.clipboard;

const lineNum = ref(0);

const handleWheel = (event: WheelEvent): void => {
  if (event.deltaY < 0) {
    lineNum.value += 1;
  } else {
    if (lineNum.value > 0) {
      lineNum.value -= 1;
    }
  }
};
</script>

<template>
  <div class="w-full max-w-4xl">
    <header class="text-center mb-10 select-none">
      <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">
        Review Content Generator
      </h1>
      <p class="text-gray-400 text-sm">
        审核内容生成工具
      </p>
    </header>

    <main class="space-y-6">
      <!-- Reka UI Tabs -->
      <TabsRoot
        default-value="offset"
        class="glass rounded-3xl overflow-hidden"
      >
        <TabsList class="relative flex border-b border-white/10">
          <TabsTrigger
            value="offset"
            class="flex-1 px-4 py-4 text-sm font-medium transition-colors text-gray-400 hover:text-white data-[state=active]:text-white"
          >
            偏移
          </TabsTrigger>
          <TabsTrigger
            value="split"
            class="flex-1 px-4 py-4 text-sm font-medium transition-colors text-gray-400 hover:text-white data-[state=active]:text-white"
          >
            拆分
          </TabsTrigger>
          <TabsTrigger
            value="merge"
            class="flex-1 px-4 py-4 text-sm font-medium transition-colors text-gray-400 hover:text-white data-[state=active]:text-white"
          >
            合并
          </TabsTrigger>
          <TabsIndicator
            class="absolute bottom-0 h-0.5 bg-pink-500 transition-all duration-300 w-[--reka-tabs-indicator-size] translate-x-[--reka-tabs-indicator-position]"
          />
        </TabsList>

        <TabsContent
          value="offset"
          class="p-6 space-y-5"
        >
          <OffsetCard />
        </TabsContent>
        <TabsContent
          value="split"
          class="p-6 space-y-4"
        >
          <SplitCard />
        </TabsContent>
        <TabsContent
          value="merge"
          class="p-6 space-y-4"
        >
          <MergeCard />
        </TabsContent>
      </TabsRoot>

      <!-- 快捷按钮 -->
      <div class="glass p-6 rounded-3xl">
        <div class="flex flex-wrap gap-3">
          <button
            class="flex items-center gap-2 px-4 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-400 transition-all"
            @click="void clipboard.writeText(`第 ${String(lineNum)} 行\n- [ ] `)"
            @wheel.prevent="handleWheel"
          >
            <span>📋</span>
            <span>复制行号模板</span>
            <span
              class="px-2 py-0.5 bg-black/30 rounded text-xs font-mono"
              v-text="lineNum"
            ></span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-all"
            @click="void clipboard.writeText(`- BG 行\n  - [ ] `)"
          >
            <span>📋</span>
            <span>复制 BG 行模板</span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-all"
            @click="void clipboard.writeText(`以下为一组修改：\n- `)"
          >
            <span>📋</span>
            <span>复制修改组模板</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
