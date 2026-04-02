<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import {
    ScrollAreaRoot,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
  } from 'reka-ui';
</script>

<template>
  <div class="app-container">
    <!-- 动态渐变背景 -->
    <div class="gradient-bg">
      <div class="gradient-blob blob-1" />
      <div class="gradient-blob blob-2" />
      <div class="gradient-blob blob-3" />
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <ScrollAreaRoot class="scroll-area">
        <ScrollAreaViewport class="scroll-viewport">
          <div class="content-inner">
            <RouterView />
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar class="scroll-scrollbar" orientation="vertical">
          <ScrollAreaThumb class="scroll-thumb" />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>
    </div>
  </div>
</template>

<style>
  /* ScrollArea 样式 */
  .scroll-area {
    width: 100%;
    height: 100%;
  }

  .scroll-viewport {
    width: 100%;
    height: 100%;
  }

  .scroll-scrollbar {
    width: 8px;
    padding: 2px;
    background: transparent;
    transition: background 0.2s;
  }

  .scroll-scrollbar:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .scroll-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: background 0.2s;
  }

  .scroll-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* 内容内层容器 - 水平垂直居中，有上下边距 */
  .content-inner {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;
    box-sizing: border-box;
  }
</style>
