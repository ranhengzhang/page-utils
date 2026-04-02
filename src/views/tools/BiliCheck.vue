<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import {
    CollapsibleRoot,
    CollapsibleTrigger,
    CollapsibleContent,
    ScrollAreaRoot,
    ScrollAreaViewport,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
  } from 'reka-ui';

  const inputBv = ref('');
  const bv = ref('');
  const jsons = ref('');
  const loading = ref(false);
  const videoTitle = ref('');
  const videoPic = ref('');
  const copyStatus = ref({ md: '复制', title: '复制', pic: '复制' });
  const isJsonOpen = ref(false);

  async function proxyFetch(targetUrl: string, options?: RequestInit) {
    const proxyBaseUrl = 'https://api.codetabs.com/v1/proxy?quest=';
    const fullProxyUrl = `${proxyBaseUrl}${encodeURIComponent(targetUrl)}`;
    return fetch(fullProxyUrl, options);
  }

  const proxiedVideoPic = computed(() => {
    if (!videoPic.value) return '';
    const proxyBaseUrl = 'https://api.codetabs.com/v1/proxy?quest=';
    return `${proxyBaseUrl}${encodeURIComponent(videoPic.value)}`;
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const responseData = computed(() => {
    try {
      return JSON.parse(jsons.value || '{}')?.data || {};
    } catch {
      return {};
    }
  });

  const listData = computed(() =>
    Array.isArray(responseData.value.pages) ? responseData.value.pages : [],
  );

  const markdownTodo = computed(() => {
    if (listData.value.length === 0) return '';
    if (listData.value.length === 1)
      return `\`${formatDuration(responseData.value.duration)}\` [${videoTitle.value}](https://www.bilibili.com/video/${bv.value})`;
    return listData.value
      .map((item: { page: number; duration: number; part: string }) => {
        const url = `https://www.bilibili.com/video/${bv.value}?p=${item.page}`;
        return `- [ ] \`${formatDuration(item.duration)}\` [${item.part}](${url})`;
      })
      .join('\n');
  });

  const copyToClipboard = async (text: string, key: 'md' | 'title' | 'pic') => {
    try {
      await navigator.clipboard.writeText(text);
      const oldLabel = copyStatus.value[key];
      copyStatus.value[key] = '已成功 ✨';
      setTimeout(() => (copyStatus.value[key] = oldLabel), 2000);
    } catch {
      alert('复制失败');
    }
  };

  watch(inputBv, (newVal) => {
    const bvRegex = /BV[A-Za-z0-9]{10}/;
    const match = bvRegex.exec(newVal);
    bv.value = match ? match[0] : '';
  });

  let controller: AbortController | null = null;
  watch(bv, async (newBv) => {
    jsons.value = '';
    videoTitle.value = '';
    videoPic.value = '';

    if (controller) controller.abort();

    if (!newBv) {
      loading.value = false;
      return;
    }

    controller = new AbortController();
    loading.value = true;

    try {
      const targetApiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${newBv}`;
      const response = await proxyFetch(targetApiUrl, {
        signal: controller.signal,
      });
      const data = await response.json();

      jsons.value = JSON.stringify(data, null, 2);
      if (data?.data) {
        videoTitle.value = data.data.title || '';
        videoPic.value = data.data.pic || '';
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        jsons.value = JSON.stringify({
          error: '请求失败',
          detail: error.message,
        });
      }
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div class="w-full max-w-2xl">
    <header class="text-center mb-10 select-none">
      <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">
        Bili Check
      </h1>
      <p class="text-gray-400 text-sm">
        让分 P 视频学习更有条理
      </p>
    </header>

    <main class="space-y-6">
      <div
        class="flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500 transition-all"
      >
        <input
          v-model.trim="inputBv"
          placeholder="输入或粘贴 BV 号..."
          class="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
        />
        <div
          v-if="loading"
          class="w-5 h-5 border-2 border-white/20 border-t-pink-500 rounded-full animate-spin flex-shrink-0"
        ></div>
      </div>

      <TransitionGroup name="fade-up">
        <div
          v-if="videoTitle"
          key="video"
          class="glass p-6 rounded-3xl"
        >
          <div class="flex gap-5 items-center max-sm:flex-col max-sm:text-center">
            <img
              :src="proxiedVideoPic"
              alt="Cover"
              class="w-36 h-24 object-cover rounded-xl select-none"
            />
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-medium mb-3 truncate">
                {{ videoTitle }}
              </h3>
              <div class="flex gap-2 max-sm:justify-center">
                <button
                  class="px-4 py-2 rounded-full bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-colors"
                  @click="copyToClipboard(videoTitle, 'title')"
                >
                  {{ copyStatus.title }}标题
                </button>
                <button
                  class="px-4 py-2 rounded-full bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-colors"
                  @click="copyToClipboard(videoPic, 'pic')"
                >
                  {{ copyStatus.pic }}封面
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="markdownTodo"
          key="md"
          class="glass p-6 rounded-3xl"
        >
          <div class="flex justify-between items-center mb-4">
            <span class="text-white font-medium">Markdown 待办列表</span>
            <button
              class="px-4 py-2 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-400 transition-colors"
              @click="copyToClipboard(markdownTodo, 'md')"
            >
              {{ copyStatus.md }}
            </button>
          </div>
          <ScrollAreaRoot class="w-full border border-white/10 rounded-xl bg-black/20">
            <ScrollAreaViewport class="w-full max-w-full">
              <div
                class="inline-block min-w-full min-h-[60px] p-4 text-sm font-mono text-gray-300 whitespace-pre select-text"
              >
                {{ markdownTodo }}
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar
              orientation="horizontal"
              class="flex h-2 touch-none select-none bg-white/10 rounded-full mx-1 mb-1"
            >
              <ScrollAreaThumb
                class="relative rounded-full bg-white/30 hover:bg-white/50 transition-colors"
              />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </div>
      </TransitionGroup>

      <CollapsibleRoot
        v-if="jsons"
        v-model:open="isJsonOpen"
        class="text-center"
      >
        <CollapsibleTrigger as-child>
          <button class="text-xs text-gray-400 select-none hover:text-gray-300 transition-colors">
            {{ isJsonOpen ? '收起' : '展开' }}开发者 JSON 数据
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollAreaRoot class="w-full mt-3 border border-white/10 rounded-xl bg-black/40">
            <ScrollAreaViewport class="w-full max-w-full">
              <pre
                class="inline-block min-w-full text-left text-gray-400 p-4 text-xs whitespace-pre"
              >{{ jsons }}</pre>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar
              orientation="horizontal"
              class="flex h-2 touch-none select-none bg-white/10 rounded-full mx-1 mb-1"
            >
              <ScrollAreaThumb
                class="relative rounded-full bg-white/30 hover:bg-white/50 transition-colors"
              />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </CollapsibleContent>
      </CollapsibleRoot>
    </main>
  </div>
</template>

<style scoped>
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: all 0.5s ease;
  }
  .fade-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
