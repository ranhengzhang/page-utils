<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import {
  NumberFieldRoot,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  CheckboxGroupRoot,
  CheckboxRoot,
  CheckboxIndicator,
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupIndicator,
} from 'reka-ui';
import { DocumentCopy, Back } from '@element-plus/icons-vue';
import ClearableInput from '@/components/ClearableInput.vue';

const lastOne = ref('');
const nextOne = ref('');
const offset = ref(0);
const place = ref<string[]>([]);
const action = ref('');
const display = ref('');
const isBackAnimating = ref(false);

const toNext = (): void => {
  [lastOne.value, nextOne.value] = [nextOne.value, ''];
};

const handleBackMouseEnter = (): void => {
  if (isBackAnimating.value) return;
  isBackAnimating.value = true;
  // 动画完成后重置状态
  setTimeout(() => {
    isBackAnimating.value = false;
  }, 400);
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
    <ClearableInput
      v-model="lastOne"
      placeholder="起始点"
      input-class="input-dark"
    />
    <button
      class="w-10 h-10 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 transition-colors flex items-center justify-center overflow-hidden"
      @click="toNext"
      @mouseenter="handleBackMouseEnter"
    >
      <Back
        class="w-5 h-5 relative"
        :class="{ 'back-slide-animation': isBackAnimating }"
      />
    </button>
    <ClearableInput
      v-model="nextOne"
      placeholder="结束点"
      input-class="input-dark"
    />
    <NumberFieldRoot
      v-model="offset"
      :min="0"
      class="input input-dark px-3 py-2 flex items-center gap-2 input-focus"
    >
      <NumberFieldInput
        class="bg-transparent !border-0 !p-0 !rounded-none focus:!ring-0 w-full focus-within:outline-none"
        @wheel.capture.stop.prevent="handleWheel"
      />
      <div class="flex flex-col gap-0.5">
        <NumberFieldIncrement
          class="w-5 h-4 flex items-center justify-center rounded bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-colors text-xs"
        >
          ▲
        </NumberFieldIncrement>
        <NumberFieldDecrement
          class="w-5 h-4 flex items-center justify-center rounded bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-colors text-xs"
        >
          ▼
        </NumberFieldDecrement>
      </div>
    </NumberFieldRoot>
  </div>

  <!-- 选择行 -->
  <div class="grid grid-cols-2 gap-3">
    <!-- 位置选择 -->
    <CheckboxGroupRoot
      v-model="place"
      class="flex gap-4 p-4 bg-black/10 rounded-xl"
    >
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e: MouseEvent) => {
            e.preventDefault();
            place = ['begin'];
          }
        "
        @dblclick.prevent
      >
        <CheckboxRoot
          value="begin"
          class="w-4 h-4 rounded border border-white/20 bg-black/20 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 flex items-center justify-center transition-colors"
        >
          <CheckboxIndicator class="text-white text-xs">
            ✓
          </CheckboxIndicator>
        </CheckboxRoot>
        <span class="text-gray-300 text-sm">起始时间</span>
      </label>
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e: MouseEvent) => {
            e.preventDefault();
            place = ['end'];
          }
        "
        @dblclick.prevent
      >
        <CheckboxRoot
          value="end"
          class="w-4 h-4 rounded border border-white/20 bg-black/20 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 flex items-center justify-center transition-colors"
        >
          <CheckboxIndicator class="text-white text-xs">
            ✓
          </CheckboxIndicator>
        </CheckboxRoot>
        <span class="text-gray-300 text-sm">结束时间</span>
      </label>
    </CheckboxGroupRoot>

    <!-- 动作选择 -->
    <RadioGroupRoot
      v-model="action"
      class="flex gap-4 p-4 bg-black/10 rounded-xl"
    >
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e: MouseEvent) => {
            e.preventDefault();
            action = '提前';
          }
        "
        @dblclick.prevent
      >
        <RadioGroupItem
          value="提前"
          class="w-4 h-4 rounded-full border border-white/20 bg-black/20 data-[state=checked]:border-pink-500 flex items-center justify-center transition-colors"
        >
          <RadioGroupIndicator class="w-2 h-2 rounded-full bg-pink-500" />
        </RadioGroupItem>
        <span class="text-gray-300 text-sm">提前</span>
      </label>
      <label
        class="flex items-center gap-2 cursor-pointer select-none"
        @contextmenu="
          (e: MouseEvent) => {
            e.preventDefault();
            action = '延后';
          }
        "
        @dblclick.prevent
      >
        <RadioGroupItem
          value="延后"
          class="w-4 h-4 rounded-full border border-white/20 bg-black/20 data-[state=checked]:border-pink-500 flex items-center justify-center transition-colors"
        >
          <RadioGroupIndicator class="w-2 h-2 rounded-full bg-pink-500" />
        </RadioGroupItem>
        <span class="text-gray-300 text-sm">延后</span>
      </label>
    </RadioGroupRoot>
  </div>

  <!-- 结果预览 -->
  <div class="grid grid-cols-[1fr_auto] gap-3">
    <input
      v-model="display"
      readonly
      placeholder="结果预览..."
      class="input-dark input-readonly input-focus"
    />
    <button
      class="w-12 h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-colors flex items-center justify-center"
      @click="copyText"
    >
      <DocumentCopy class="w-5 h-5" />
    </button>
  </div>
</template>

<style scoped>
.back-slide-animation {
  animation: backSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes backSlide {
  0% {
    left: 0;
  }
  45% {
    left: -100%;
    opacity: 0;
  }
  50% {
    left: 100%;
    opacity: 0;
  }
  100% {
    left: 0;
    opacity: 1;
  }
}
</style>
