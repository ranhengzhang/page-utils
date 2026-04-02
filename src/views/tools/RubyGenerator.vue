<script setup lang="ts">
  import { watch, computed, ref } from 'vue';
  import { eastAsianWidth } from 'get-east-asian-width';

  const rb = ref('');
  const rt = ref('');
  const rbs = ref<string[]>([]);
  const rts = ref<string[]>([]);
  const smallKana = 'ぁぃぅぇぉゃゅょァィゥェォャュョ';

  const toast = ref({
    show: false,
    msg: '',
    type: 'success' as 'success' | 'error',
  });

  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const showToast = (msg: string, type: 'success' | 'error' = 'success'): void => {
    toast.value.msg = msg;
    toast.value.type = type;
    toast.value.show = true;

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.value.show = false;
    }, 2500);
  };

  function isFullWidth(char: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return eastAsianWidth(char.codePointAt(0) ?? 0) === 2;
  }

  function splitWords(text: string): string[] {
    const ret: string[] = [''];
    for (const c of [...text]) {
      if (smallKana.includes(c) || !isFullWidth(c)) ret[ret.length - 1] += c;
      else ret.push(c);
    }
    return ret.filter((s) => s.length);
  }

  const writeText = async (content: string, type: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      showToast(`已复制 ${type}`, 'success');
    } catch {
      showToast('复制失败，请检查剪贴板权限', 'error');
    }
  };

  const readText = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      rb_val.value = text;
      showToast('内容已智能同步', 'success');
    } catch {
      showToast('无法读取剪贴板，请点击允许权限', 'error');
    }
  };

  watch(rb, () => {
    const result: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    for (const char of [...rb.value]) {
      if (smallKana.includes(char) && result.length > 0) {
        result[result.length - 1] += char;
      } else {
        result.push(char);
      }
    }

    rbs.value = result;
  });

  watch(rt, () => {
    rts.value = rt.value.split(' ');
  });

  const rb_val = computed({
    get: () => rb.value,
    set: (v: string) => {
      rt_val.value = '';
      if (/.+\(.+\)/.exec(v)) {
        const [rb_, rt_] = v.split('(');
        rb.value = rb_?.trim() ?? '';
        rt_val.value = rt_?.trim() ?? '';
      } else if (v.includes('|')) {
        const parts = v.split('|');
        rb.value = parts[0] || '';
        rt_val.value = '';
        for (let i = 1; i < parts.length - 1; i++) {
          let part = parts[i];
          if (!part) continue;
          if (part.startsWith('<')) part = part.slice(1);
          // eslint-disable-next-line @typescript-eslint/no-misused-spread
          if (!part.endsWith('#')) rb.value += [...part].pop() ?? '';
          rt_val.value += part.slice(0, part.length - 1);
        }
        let last = parts.pop();
        if (last?.startsWith('<')) last = last.slice(1);
        if (last) rt_val.value += last;
      } else {
        rb.value = v;
      }
    },
  });

  const rt_val = computed({
    get: () => rt.value,
    set: (v: string) => {
      rt.value = v.replace(')', '').replace(/\{.*?\}/, '');
    },
  });

  const rubyHTML = computed(() => {
    const rb_ite = rbs.value.values();
    const rt_ite = rts.value.values();
    const t = [];
    let rb_next = rb_ite.next();
    let rt_next = rt_ite.next();
    while (!rb_next.done || !rt_next.done) {
      t.push('<ruby>');
      if (!rb_next.done) t.push(rb_next.value);
      t.push(`<rt>${(rt_next.value as string) ?? ''}</rt>`);
      t.push('</ruby>');
      rb_next = rb_ite.next();
      rt_next = rt_ite.next();
    }
    return t.join('');
  });

  const rubyText = computed(() => {
    if (rbs.value.length === rts.value.length && rbs.value.length != 0 && rts.value.length != 0) {
      return rubyHTML.value;
    } else {
      const parted_rb = splitWords(rb.value);
      const parted_rt = splitWords(rt.value);
      if (parted_rb.length == parted_rt.length) {
        const rb_ite = parted_rb.values();
        const rt_ite = parted_rt.values();
        const t = [];
        let rb_next = rb_ite.next();
        let rt_next = rt_ite.next();
        while (!rb_next.done || !rt_next.done) {
          t.push('<ruby>');
          if (!rb_next.done) t.push(rb_next.value);
          t.push(`<rt>${(rt_next.value as string) ?? ''}</rt>`);
          t.push('</ruby>');
          rb_next = rb_ite.next();
          rt_next = rt_ite.next();
        }
        return t.join('');
      } else {
        return `<ruby>${rb.value}<rt>${rt.value}</rt></ruby>`;
      }
    }
  });

  const htmlText = computed(
    () =>
      `<div>\n<ruby part="ruby">${rb.value}<rt>${rt.value.replace(/\s/g, '')}</rt></ruby>\n</div>\n\n${rts.value.map((s) => `<kbd>${s}</kbd>`).join(' ')}`,
  );

  const pairText = computed(() => `${rb.value}(${rt.value.replace(/\s/g, '')})`);

  const assText = computed(() => {
    const t = [];

    for (let i = 0; i < rbs.value.length; i++) {
      let rt_syls: string[] = [''];
      const rtItem = rts.value[i] ?? '';
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      for (const c of [...rtItem]) {
        if (smallKana.includes(c) || !isFullWidth(c)) rt_syls[rt_syls.length - 1] += c;
        else rt_syls.push(c);
      }
      rt_syls = rt_syls.filter((s) => s.length);

      t.push(`${rbs.value[i] ?? ''}${i == 0 ? '|<\n' : '|\n'}${rt_syls[0] ?? ''}`);

      t.push(...rt_syls.slice(1).map((s) => `#|\n${s}`));
    }

    return t.join('');
  });

  rb_val.value = '両手(りょう て)';
</script>

<template>
  <div class="w-full max-w-3xl">
    <!-- Toast 提示框 -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="[
          'fixed top-8 left-1/2 -translate-x-1/2 z-50 px-7 py-3.5 rounded-2xl backdrop-blur-md font-bold shadow-2xl',
          toast.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30',
        ]"
      >
        <span v-if="toast.type === 'success'">✅</span>
        <span v-else>⚠️</span>
        <span class="ml-2" v-html="toast.msg" />
      </div>
    </Transition>

    <header class="text-center mb-10 select-none">
      <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">
        Ruby Generator <sup class="text-pink-500">∞</sup>
      </h1>
      <p class="text-gray-400 text-sm">振假名工具</p>
    </header>

    <main class="space-y-6">
      <!-- 输入区域 -->
      <div class="glass p-6 rounded-3xl">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-white font-medium mb-3 select-none text-sm">汉字 (Base)</label>
            <div class="relative">
              <input
                v-model="rb_val"
                placeholder="请输入汉字..."
                type="text"
                class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
              />
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                title="复制"
                @click="writeText(rb, 'rb')"
              >
                📋
              </button>
            </div>
          </div>
          <div>
            <label class="block text-white font-medium mb-3 select-none text-sm"
              >振假名 (Furigana)</label
            >
            <div class="relative">
              <input
                v-model="rt_val"
                placeholder="りょう て"
                type="text"
                class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50"
              />
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                title="复制"
                @click="writeText(rt, 'rt')"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览和操作区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 预览区域 -->
        <div
          class="glass p-6 rounded-3xl min-h-[140px] flex flex-col justify-center cursor-pointer hover:bg-white/10 transition-colors"
          title="点击复制"
          @click="writeText(rubyText, 'Ruby HTML')"
        >
          <div class="text-xs text-gray-500 mb-2 select-none">预览 (点击复制)</div>
          <div class="flex flex-wrap gap-1.5 justify-center items-end text-4xl" v-html="rubyHTML" />
        </div>

        <!-- 按钮区域 -->
        <div class="flex flex-wrap gap-3 content-start">
          <button
            class="flex-1 min-w-[120px] px-4 py-3 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-all"
            @click="readText"
          >
            📋 智能粘贴
          </button>
          <button
            v-if="rbs.length != 0 && rts.length != 0"
            class="flex-1 min-w-[120px] px-4 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-400 transition-all"
            @click="writeText(pairText, '括号格式')"
          >
            括号格式
          </button>
          <button
            v-if="rbs.length == rts.length && rbs.length != 0 && rts.length != 0"
            class="flex-1 min-w-[120px] px-4 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-400 transition-all"
            @click="writeText(assText, 'ASS格式')"
          >
            ASS 格式
          </button>
          <button
            v-if="rbs.length != rts.length && rbs.length != 0 && rts.length != 0"
            class="flex-1 min-w-[120px] px-4 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-400 transition-all"
            @click="writeText(`${rbs.join('')}|<${rts.join('')}`, 'ASS格式 (不分词)')"
          >
            ASS格式 (不分词)
          </button>
          <button
            :disabled="rbs.length != rts.length || rbs.length == 0 || rts.length == 0"
            class="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/20 text-gray-300 font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="writeText(htmlText, 'HTML代码')"
          >
            复制 SiYuan HTML 代码
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  .toast-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }

  :deep(rt) {
    font-size: 0.9rem;
    color: #fb7299;
    font-weight: 600;
  }
</style>
