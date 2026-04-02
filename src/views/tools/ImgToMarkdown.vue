<script setup lang="ts">
  import { computed, ref } from 'vue';

  const input = ref('');
  const copied = ref(false);

  type ParseResult = {
    src: string;
    alt: string;
    md: string;
    error: string;
  };

  function parseImgTagToMarkdown(raw: string): ParseResult {
    const text = (raw ?? '').trim();
    if (!text) {
      return { src: '', alt: '', md: '', error: '' };
    }

    const doc = new DOMParser().parseFromString(`<div id="root">${text}</div>`, 'text/html');
    const img = doc.querySelector<HTMLImageElement>('#root img');

    if (!img) {
      return {
        src: '',
        alt: '',
        md: '',
        error: '未检测到 <img> 标签（请粘贴完整的图片标签）',
      };
    }

    const src = (img.getAttribute('src') ?? '').trim();
    const alt = (img.getAttribute('alt') ?? '').trim();

    if (!src) {
      return {
        src: '',
        alt,
        md: '',
        error: '缺少 src，无法生成 Markdown 图片语法',
      };
    }

    const md = `![${alt}](${src})`;

    return { src, alt, md, error: '' };
  }

  const result = computed(() => parseImgTagToMarkdown(input.value));

  async function copy() {
    if (!result.value.md) return;

    try {
      await navigator.clipboard.writeText(result.value.md);
      copied.value = true;
      window.setTimeout(() => (copied.value = false), 1200);
    } catch {
      copied.value = false;
      alert('复制失败：当前环境可能不允许访问剪贴板。你可以手动选中输出内容复制。');
    }
  }

  function fillExample() {
    input.value =
      '<img src="https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=60" alt="City at night" loading="lazy" width="320" />';
  }
</script>

<template>
  <div class="w-full max-w-2xl">
    <header class="text-center mb-10 select-none">
      <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">
        IMG → Markdown
      </h1>
      <p class="text-gray-400 text-sm">
        粘贴 HTML5 图片标签，只提取 src / alt 并转换为 Markdown
      </p>
    </header>

    <main class="space-y-6">
      <div class="glass p-6 rounded-3xl">
        <div class="flex justify-between items-center mb-4">
          <span class="text-white font-medium">输入（HTML5 &lt;img&gt; 标签）</span>
          <button
            class="px-4 py-2 rounded-full bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-colors"
            @click="fillExample"
          >
            填充示例
          </button>
        </div>
        <textarea
          v-model="input"
          rows="3"
          spellcheck="false"
          placeholder="<img src=&quot;https://example.com/a.png&quot; alt=&quot;示例图片&quot; loading=&quot;lazy&quot; width=&quot;320&quot; />"
          class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-pink-500/50 resize-y font-mono text-sm"
        ></textarea>
        <div class="mt-3 text-sm">
          <span
            v-if="result.error"
            class="text-red-400"
          >{{ result.error }}</span>
          <span
            v-else
            class="text-emerald-400"
          >
            已识别：src{{ result.src ? ' ✓' : ' ×' }}，alt{{ result.alt ? ' ✓' : ' ×' }}
          </span>
        </div>
      </div>

      <div class="glass p-6 rounded-3xl">
        <div class="flex justify-between items-center mb-4">
          <span class="text-white font-medium">输出（Markdown）</span>
          <button
            :disabled="!result.md"
            class="px-4 py-2 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="copy"
          >
            复制
          </button>
        </div>
        <textarea
          :value="result.md"
          rows="2"
          readonly
          spellcheck="false"
          placeholder="这里会输出：![alt](src)"
          class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none resize-none font-mono text-sm"
        ></textarea>
        <div
          v-if="copied"
          class="mt-3 text-sm text-emerald-400"
        >
          已复制到剪贴板
        </div>
      </div>
    </main>
  </div>
</template>
