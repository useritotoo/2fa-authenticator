<template>
  <div class="p-3 sm:p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
    <div :class="['flex justify-between items-start gap-2', hideIssuer ? 'mb-1' : 'mb-2']">
      <div class="min-w-0 flex-1">
        <div v-if="!hideIssuer" class="text-sm text-gray-500">{{ account.issuer || 'Unknown' }}</div>
        <div
          class="font-semibold text-gray-800 text-sm sm:text-base truncate cursor-pointer hover:text-blue-600"
          :title="account.name"
          @click="copyName"
        >{{ account.name }}</div>
        <div v-if="nameCopied" class="text-xs text-green-600">已复制</div>
      </div>
      <button
        @click="copyCode"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded flex-shrink-0"
        title="复制验证码"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
    <div class="flex items-center justify-between">
      <div class="text-2xl sm:text-xl font-mono font-bold text-blue-600 tracking-wider">
        {{ formattedCode }}
      </div>
      <div class="flex items-center gap-2">
        <div class="text-xs text-gray-400">{{ remaining }}s</div>
        <div class="w-8 h-8 relative">
          <svg class="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="3"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              :stroke="remaining <= 5 ? '#ef4444' : '#3b82f6'"
              stroke-width="3"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              stroke-linecap="round"
              class="transition-all duration-1000"
            />
          </svg>
        </div>
      </div>
    </div>
    <div v-if="copied" class="text-xs text-green-600 mt-1">已复制</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AccountWithCode } from '../utils/api';

const props = defineProps<{
  account: AccountWithCode;
  remaining: number;
  hideIssuer?: boolean;
}>();

const copied = ref(false);
const nameCopied = ref(false);

const formattedCode = computed(() => {
  const code = props.account.code;
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
});

const circumference = 2 * Math.PI * 14;
const dashOffset = computed(() => {
  const progress = props.remaining / props.account.period;
  return circumference * (1 - progress);
});

async function copyCode() {
  await navigator.clipboard.writeText(props.account.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}

async function copyName() {
  await navigator.clipboard.writeText(props.account.name);
  nameCopied.value = true;
  setTimeout(() => {
    nameCopied.value = false;
  }, 1500);
}
</script>
