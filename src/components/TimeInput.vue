<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';

  const props = defineProps<{
    modelValue?: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: string];
    change: [value: string];
  }>();

  const inputRef = ref<HTMLInputElement | null>(null);
  const rawValue = ref(props.modelValue || '00:00.00');
  const cursorPosition = ref(0);

  // 格式化显示值（确保始终是 00:00.00 格式）
  const displayValue = computed({
    get() {
      return formatTime(rawValue.value);
    },
    set() {
      // 这里不直接设置，通过 handleInput 处理
    },
  });

  // 格式化时间为 00:00.00
  function formatTime(val: string): string {
    // 移除非数字字符
    const digits = (val || '').replace(/\D/g, '').padStart(6, '0').slice(0, 6);

    const minutes = digits.slice(0, 2);
    const seconds = digits.slice(2, 4);
    const milliseconds = digits.slice(4, 6);

    return `${minutes}:${seconds}.${milliseconds}`;
  }

  // 将格式化的字符串转为纯数字数组
  function getDigitsArray(formattedStr: string): number[] {
    return formattedStr.replace(/[:\.]/g, '').split('').map(Number);
  }

  // 将数字数组转为格式化字符串
  function digitsToString(digits: number[]): string {
    const str = digits.join('').padStart(6, '0').slice(0, 6);
    return `${str.slice(0, 2)}:${str.slice(2, 4)}.${str.slice(4, 6)}`;
  }

  // 获取当前光标在数字中的实际位置（排除 : 和 .）
  function getDigitIndex(cursorPos: number, formattedStr: string): number {
    let digitIndex = 0;
    for (let i = 0; i < cursorPos && i < formattedStr.length; i++) {
      const char = formattedStr[i];
      if (char && /\d/.test(char)) {
        digitIndex++;
      }
    }
    return digitIndex;
  }

  // 获取数字索引对应的字符串位置
  function getStringIndex(digitIndex: number, formattedStr: string): number {
    let count = 0;
    for (let i = 0; i < formattedStr.length; i++) {
      const char = formattedStr[i];
      if (char && /\d/.test(char)) {
        if (count === digitIndex) return i;
        count++;
      }
    }
    return formattedStr.length;
  }

  // 处理键盘事件
  function handleKeydown(event: KeyboardEvent) {
    const input = inputRef.value;
    if (!input) return;

    const key = event.key;
    const currentValue = displayValue.value;
    const digits = getDigitsArray(currentValue);

    // 获取当前光标在数字中的位置
    const selectionStart = input.selectionStart || 0;
    let digitIndex = getDigitIndex(selectionStart, currentValue);

    // 处理数字键（0-9）
    if (/^\d$/.test(key)) {
      event.preventDefault();

      const num = parseInt(key);

      // 如果光标在末尾，不处理
      if (digitIndex >= 6) {
        digitIndex = 5;
      }

      // 替换当前位置的数字
      digits[digitIndex] = num;

      // 更新值
      const newValue = digitsToString(digits);
      rawValue.value = newValue;
      emit('update:modelValue', newValue);
      emit('change', newValue);

      // 光标向后移动到下一个数字位置
      const newDigitIndex = Math.min(digitIndex + 1, 6);
      const newCursorPos = getStringIndex(newDigitIndex, newValue);

      nextTick(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      });
    }

    // 处理退格键（Backspace）
    else if (key === 'Backspace') {
      event.preventDefault();

      // 如果已经在最前面，不处理
      if (digitIndex <= 0) {
        return;
      }

      // 将前一个数字设为0
      digits[digitIndex - 1] = 0;

      // 更新值
      const newValue = digitsToString(digits);
      rawValue.value = newValue;
      emit('update:modelValue', newValue);
      emit('change', newValue);

      // 光标向前移动
      const newDigitIndex = Math.max(digitIndex - 1, 0);
      const newCursorPos = getStringIndex(newDigitIndex, newValue);

      nextTick(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      });
    }

    // 处理删除键（Delete）- 可选：将当前位置设为0
    else if (key === 'Delete') {
      event.preventDefault();

      if (digitIndex >= 6) return;

      digits[digitIndex] = 0;

      const newValue = digitsToString(digits);
      rawValue.value = newValue;
      emit('update:modelValue', newValue);
      emit('change', newValue);

      nextTick(() => {
        const newCursorPos = getStringIndex(digitIndex, newValue);
        input.setSelectionRange(newCursorPos, newCursorPos);
      });
    }

    // 阻止左右箭头改变光标（可选，如果需要保持数字输入逻辑）
    // 或者让左右箭头在数字间移动
    else if (key === 'ArrowLeft') {
      event.preventDefault();
      if (digitIndex > 0) {
        const newDigitIndex = digitIndex - 1;
        const newCursorPos = getStringIndex(newDigitIndex, currentValue);
        nextTick(() => {
          input.setSelectionRange(newCursorPos, newCursorPos);
        });
      }
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      if (digitIndex < 6) {
        const newDigitIndex = digitIndex + 1;
        const newCursorPos = getStringIndex(newDigitIndex, currentValue);
        nextTick(() => {
          input.setSelectionRange(newCursorPos, newCursorPos);
        });
      }
    }
  }

  // 处理输入事件（防止直接粘贴或输入法输入）
  function handleInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    // 重新格式化
    const formatted = formatTime(val);
    if (formatted !== rawValue.value) {
      rawValue.value = formatted;
      emit('update:modelValue', formatted);
    }

    // 恢复光标位置
    nextTick(() => {
      const input = inputRef.value;
      if (input && cursorPosition.value) {
        input.setSelectionRange(cursorPosition.value, cursorPosition.value);
      }
    });
  }

  // 处理点击，确保光标在数字位置
  function handleClick(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    const selectionStart = input.selectionStart || 0;
    const currentValue = displayValue.value;

    // 找到最近的数字位置
    let digitIndex = getDigitIndex(selectionStart, currentValue);
    digitIndex = Math.max(0, Math.min(digitIndex, 5));

    const newCursorPos = getStringIndex(digitIndex, currentValue);

    nextTick(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
      cursorPosition.value = newCursorPos;
    });
  }

  // 处理聚焦
  function handleFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    // 默认将光标放在第一个数字位置
    nextTick(() => {
      input.setSelectionRange(0, 0);
      cursorPosition.value = 0;
    });
  }

  // 监听外部值变化
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== rawValue.value) {
        rawValue.value = newVal || '00:00.00';
      }
    },
  );

  // 暴露方法
  defineExpose({
    focus: () => inputRef.value?.focus(),
    blur: () => inputRef.value?.blur(),
    select: () => inputRef.value?.select(),
    clear: () => {
      rawValue.value = '00:00.00';
      emit('update:modelValue', '00:00.00');
    },
  });
</script>

<template>
  <input
    ref="inputRef"
    :value="displayValue"
    type="text"
    class="font-mono text-center px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-gray-300 w-28 input-focus"
    @keydown="handleKeydown"
    @input="handleInput"
    @click="handleClick"
    @focus="handleFocus"
  />
</template>
