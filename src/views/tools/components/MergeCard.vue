<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { DocumentCopy } from '@element-plus/icons-vue';

const lastSyl = ref('');
const nextSyl = ref('');
const display = ref('');

const lastChars = computed<string[]>(() => {
  const match = /「([^」]+)\/`([^`]+)`\/`([^`]+)`」/.exec(lastSyl.value);
  if (!match) return [];
  return match.slice(1);
});

const nextChars = computed<string[]>(() => {
  const match = /「([^」]+)\/`([^`]+)`\/`([^`]+)`」/.exec(nextSyl.value);
  if (!match) return [];
  return match.slice(1);
});

watch(lastSyl, (newVal: string) => {
  if (!newVal) return;

  const complexRegex =
    /(「[^」]+\/`[^`]+`\/`[^`]+`」)\s*(「[^」]+\/`[^`]+`\/`[^`]+`」)/;
  const items = complexRegex.exec(newVal);

  if (items) {
    lastSyl.value = items[1] ?? '';
    nextSyl.value = items[2] ?? '';
  }
});

watch(
  [lastChars, nextChars],
  () => {
    if (nextChars.value.length >= 2) {
      const lastChar0 = lastChars.value[0] ?? '';
      const lastChar1 = lastChars.value[1] ?? '';
      const nextChar0 = nextChars.value[0] ?? '';
      const nextChar2 = nextChars.value[2] ?? '';
      display.value = `${lastSyl.value}${nextSyl.value}需合并为「${lastChar0}${nextChar0}/\`${lastChar1}\`/\`${nextChar2}\`」`;
    } else {
      display.value = '';
    }
  },
  { immediate: true },
);

const copyText = (): void => {
  if (display.value) {
    void navigator.clipboard.writeText(display.value);
  }
};
</script>

<template>
  <div
    class="grid gap-4"
    style="grid-template-columns: 1fr 1fr"
  >
    <input
      v-model="lastSyl"
      type="text"
      placeholder="输入上一个音节..."
      class="input-base"
    />
    <input
      v-model="nextSyl"
      type="text"
      placeholder="输入下一个音节..."
      class="input-base"
    />
  </div>

  <div
    class="grid gap-4 mt-4"
    style="grid-template-columns: 1fr auto"
  >
    <textarea
      v-model="display"
      readonly
      placeholder="结果预览..."
      rows="1"
      class="input-base input-readonly resize-none"
    ></textarea>
    <button
      type="button"
      class="w-12 h-12 rounded-full bg-green-500/80 hover:bg-green-400 flex items-center justify-center text-white transition-colors"
      @click="copyText"
    >
      <DocumentCopy class="w-5 h-5" />
    </button>
  </div>
</template>
