<script setup lang="ts">
import { ref, watch } from 'vue';

const lastOne = ref('');
const nextOne = ref('');
const offset = ref(0);
const place = ref<string[]>([]);
const action = ref('');
const display = ref('');

const toNext = (): void => {
  [lastOne.value, nextOne.value] = [nextOne.value, ''];
};

watch(lastOne, (newVal) => {
  if (!newVal) return;

  // 匹配两个连续的音节块格式
  const complexRegex =
    /(「[^」]+\/`[^`]+`\/`[^`]+`」)\s*(「[^」]+\/`[^`]+`\/`[^`]+`」)/;
  const items = complexRegex.exec(newVal);

  if (items) {
    lastOne.value = items[1] ?? '';
    nextOne.value = items[2] ?? '';
  }
});

watch(
  [lastOne, nextOne, place, action, offset],
  () => {
    let move = '时间';
    // 逻辑优化：判断选中的位置
    if (place.value.includes('begin') && place.value.includes('end')) {
      move = '整体';
    } else if (place.value.includes('begin')) {
      move = '起始时间';
    } else if (place.value.includes('end')) {
      move = '结束时间';
    }

    let text = '';
    if (nextOne.value) {
      text = `${lastOne.value}结束时间和${nextOne.value}起始时间`;
    } else if (lastOne.value) {
      text = `${lastOne.value}${move}`;
    } else {
      display.value = '';
      return;
    }

    // 拼接最终字符串
    display.value = `${text}需${action.value}大约 ${String(offset.value)}0 ms `;
  },
  { deep: true },
);

// 复制功能函数
const copyText = (): void => {
  if (display.value) {
    void navigator.clipboard.writeText(display.value);
  }
};

const handleWheel = (event: WheelEvent): void => {
  if (event.deltaY < 0) {
    offset.value += 1;
  } else {
    if (offset.value > 0) {
      offset.value -= 1;
    }
  }
};
</script>

<template>
  <!-- 输入行 -->
  <div class="grid grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
    <input
      v-model="lastOne"
      placeholder="起始点"
      class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
    />
    <button
      class="w-10 h-10 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 transition-colors flex items-center justify-center"
      @click="toNext"
    >
      ←
    </button>
    <input
      v-model="nextOne"
      placeholder="结束点"
      class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
    />
    <input
      v-model="offset"
      type="number"
      :min="0"
      class="w-20 px-3 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 text-center focus:outline-none focus:border-pink-500/50"
      @wheel.prevent="handleWheel"
    />
  </div>

  <!-- 选择行 -->
  <div class="grid grid-cols-2 gap-3">
    <!-- 位置选择 -->
    <div class="flex gap-4 p-4 bg-black/10 rounded-xl">
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e) => {
            e.preventDefault();
            place = ['begin'];
          }
        "
        @dblclick.prevent
      >
        <input
          v-model="place"
          type="checkbox"
          value="begin"
          class="w-4 h-4 rounded border-white/20 bg-black/20 text-pink-500 focus:ring-pink-500/50"
        />
        <span class="text-gray-300 text-sm">起始时间</span>
      </label>
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e) => {
            e.preventDefault();
            place = ['end'];
          }
        "
        @dblclick.prevent
      >
        <input
          v-model="place"
          type="checkbox"
          value="end"
          class="w-4 h-4 rounded border-white/20 bg-black/20 text-pink-500 focus:ring-pink-500/50"
        />
        <span class="text-gray-300 text-sm">结束时间</span>
      </label>
    </div>

    <!-- 动作选择 -->
    <div class="flex gap-4 p-4 bg-black/10 rounded-xl">
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e) => {
            e.preventDefault();
            action = '提前';
          }
        "
        @dblclick.prevent
      >
        <input
          v-model="action"
          type="radio"
          value="提前"
          class="w-4 h-4 border-white/20 bg-black/20 text-pink-500 focus:ring-pink-500/50"
        />
        <span class="text-gray-300 text-sm">提前</span>
      </label>
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e) => {
            e.preventDefault();
            action = '延后';
          }
        "
        @dblclick.prevent
      >
        <input
          v-model="action"
          type="radio"
          value="延后"
          class="w-4 h-4 border-white/20 bg-black/20 text-pink-500 focus:ring-pink-500/50"
        />
        <span class="text-gray-300 text-sm">延后</span>
      </label>
    </div>
  </div>

  <!-- 结果预览 -->
  <div class="grid grid-cols-[1fr_auto] gap-3">
    <input
      v-model="display"
      readonly
      placeholder="结果预览..."
      class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none"
    />
    <button
      class="w-12 h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-colors flex items-center justify-center"
      @click="copyText"
    >
      📋
    </button>
  </div>
</template>
