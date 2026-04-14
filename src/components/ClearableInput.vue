<script setup lang="ts">
  import { ref, computed } from 'vue';

  interface Props {
    modelValue: string;
    placeholder?: string;
    inputClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: '',
    inputClass: '',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const inputRef = ref<HTMLInputElement | null>(null);

  const hasValue = computed(() => props.modelValue.length > 0);

  const clearInput = () => {
    emit('update:modelValue', '');
    inputRef.value?.focus();
  };
</script>

<template>
  <div
    class="flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl  input-focus"
  >
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      class="flex-1 bg-transparent text-white placeholder-gray-500 outline-none !bg-transparent !border-0 !p-0 !rounded-none focus:!ring-0"
      :class="inputClass"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="hasValue"
      type="button"
      class="flex-shrink-0 p-0.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      @click="clearInput"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <slot name="suffix"></slot>
  </div>
</template>
