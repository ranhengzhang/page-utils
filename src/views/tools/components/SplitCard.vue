<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { DocumentCopy } from '@element-plus/icons-vue';
import TimeInput from '../../../components/TimeInput.vue';

const sylData = ref('');
const splitPoint = ref('00:00/00');
const display = ref('');

const displayTime = computed({
  get(): string {
    const raw = splitPoint.value.replace(/\D/g, '');
    if (!raw) return '';

    const padded = raw.padStart(6, '0').slice(-6);
    const mm = padded.slice(0, 2);
    const ss = padded.slice(2, 4);
    const ms = padded.slice(4, 6);

    return `${mm}:${ss}.${ms}`;
  },
  set(newValue: string) {
    splitPoint.value = newValue.replace(/\D/g, '').slice(0, 6);
  },
});

const chars = computed<string[]>(() => {
  const match = /(?<=「).*?(?=\/)/.exec(sylData.value);
  if (!match) return [];

  return match[0].split('').map((c: string) => `「${c}」`);
});

watch(
  [sylData, splitPoint],
  () => {
    if (chars.value.length >= 2) {
      const char0 = chars.value[0] ?? '';
      const char1 = chars.value[1] ?? '';
      display.value = `${sylData.value}需拆分为${chars.value.join('')}两个音节，${char0}结束时间和${char1}起始时间大约为 \`${displayTime.value}0\``;
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
    style="grid-template-columns: 1fr auto"
  >
    <input
      v-model="sylData"
      type="text"
      placeholder="输入音节数据..."
      class="input-base"
    />
    <TimeInput
      v-model="displayTime"
      placeholder="00:00.00"
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
