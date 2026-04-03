<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { RouterView, useRoute, useRouter } from 'vue-router';
  import {
    ScrollAreaRoot,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
  } from 'reka-ui';
  import { tools } from './config/tools';

  const route = useRoute();
  const router = useRouter();
  const isSidebarOpen = ref(false);

  const navItems = computed(() => [
    { name: '首页', path: '/', icon: '🏠' },
    ...tools.map((tool) => ({
      name: tool.name,
      path: tool.path,
      icon: tool.icon,
    })),
  ]);

  const navigateTo = (path: string) => {
    router.push(path);
    isSidebarOpen.value = false;
  };

  const isActive = (path: string) => {
    return route.path === path;
  };
</script>

<template>
  <div class="app-container">
    <!-- 动态渐变背景 -->
    <div class="gradient-bg">
      <div class="gradient-blob blob-1"></div>
      <div class="gradient-blob blob-2"></div>
      <div class="gradient-blob blob-3"></div>
    </div>

    <!-- 侧边栏 -->
    <aside
      class="sidebar"
      :class="{ 'sidebar-collapsed': !isSidebarOpen }"
    >
      <div class="sidebar-header">
        <button
          class="sidebar-collapse-btn"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <span class="sidebar-collapse-icon" :class="{ 'sidebar-collapse-icon-collapsed': isSidebarOpen }"></span>
        </button>
        <h2 class="sidebar-title">{{ isSidebarOpen ? '导航' : '' }}</h2>
      </div>
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="sidebar-nav-item"
          :class="{ 'sidebar-nav-item-active': isActive(item.path) }"
          :title="item.name"
          @click="navigateTo(item.path)"
        >
          <span class="sidebar-nav-icon">{{ item.icon }}</span>
          <span class="sidebar-nav-text">{{ item.name }}</span>
        </button>
      </nav>
    </aside>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <ScrollAreaRoot class="scroll-area">
        <ScrollAreaViewport class="scroll-viewport">
          <div class="content-inner">
            <RouterView />
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar
          class="scroll-scrollbar"
          orientation="vertical"
        >
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

  /* 侧边栏 */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    background: rgba(20, 20, 30, 0.95);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: auto;
    min-width: 64px;
  }

  .sidebar-collapsed .sidebar-nav-text {
    max-width: 0;
    opacity: 0;
    margin-left: 0;
  }

  .sidebar-header {
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
  }

  .sidebar-title {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  .sidebar-collapse-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
  }

  .sidebar-collapse-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .sidebar-collapse-icon {
    display: block;
    width: 14px;
    height: 2px;
    background: white;
    position: relative;
    transition: all 0.3s ease;
  }

  .sidebar-collapse-icon::before,
  .sidebar-collapse-icon::after {
    content: '';
    position: absolute;
    left: 0;
    width: 14px;
    height: 2px;
    background: white;
    transition: all 0.3s ease;
  }

  .sidebar-collapse-icon::before {
    top: -4px;
  }

  .sidebar-collapse-icon::after {
    top: 4px;
  }

  .sidebar-collapse-icon-collapsed {
    background: transparent;
  }

  .sidebar-collapse-icon-collapsed::before {
    top: 0;
    transform: rotate(45deg);
  }

  .sidebar-collapse-icon-collapsed::after {
    top: 0;
    transform: rotate(-45deg);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    overflow-y: auto;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 12px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
  }

  .sidebar-nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .sidebar-nav-item-active {
    background: rgba(251, 114, 153, 0.2);
    color: #fb7299;
  }

  .sidebar-nav-item-active:hover {
    background: rgba(251, 114, 153, 0.3);
  }

  .sidebar-nav-icon {
    font-size: 1.25rem;
    width: 1.5rem;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar-nav-text {
    flex: 1;
    max-width: 200px;
    opacity: 1;
    margin-left: 0.75rem;
    transition: max-width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.2s ease,
                margin-left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
    overflow: hidden;
  }
</style>
