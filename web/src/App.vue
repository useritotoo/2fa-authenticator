<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    <nav class="bg-white dark:bg-gray-800 shadow-sm transition-colors">
      <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-gray-800 dark:text-gray-100">2FA Authenticator</router-link>
        <router-link
          to="/admin"
          class="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          管理
        </router-link>
      </div>
    </nav>
    <main class="max-w-4xl mx-auto px-4 py-6">
      <router-view />
    </main>

    <!-- 主题切换悬浮按钮 -->
    <div class="fixed bottom-4 right-4 z-50">
      <div class="relative">
        <button
          @click="showThemeMenu = !showThemeMenu"
          class="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          :title="themeLabel"
        >
          <!-- 自动模式图标 -->
          <svg v-if="theme === 'auto'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <!-- 浅色模式图标 -->
          <svg v-else-if="theme === 'light'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- 深色模式图标 -->
          <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- 主题选择菜单 -->
        <div
          v-if="showThemeMenu"
          class="absolute bottom-14 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]"
        >
          <button
            @click="setTheme('auto')"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="theme === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            自动
          </button>
          <button
            @click="setTheme('light')"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            浅色
          </button>
          <button
            @click="setTheme('dark')"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            深色
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

type Theme = 'auto' | 'light' | 'dark';

const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'auto');
const showThemeMenu = ref(false);

const themeLabel = computed(() => {
  const labels: Record<Theme, string> = {
    auto: '跟随系统',
    light: '浅色模式',
    dark: '深色模式',
  };
  return labels[theme.value];
});

function applyTheme(t: Theme) {
  const isDark =
    t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

function setTheme(t: Theme) {
  theme.value = t;
  localStorage.setItem('theme', t);
  applyTheme(t);
  showThemeMenu.value = false;
}

// 监听系统主题变化（仅在 auto 模式下生效）
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
function handleSystemThemeChange() {
  if (theme.value === 'auto') {
    applyTheme('auto');
  }
}

// 点击外部关闭菜单
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.fixed.bottom-4.right-4')) {
    showThemeMenu.value = false;
  }
}

onMounted(() => {
  applyTheme(theme.value);
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  mediaQuery.removeEventListener('change', handleSystemThemeChange);
  document.removeEventListener('click', handleClickOutside);
});
</script>
