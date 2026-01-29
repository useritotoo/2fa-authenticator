<template>
  <div>
    <!-- 使用说明 -->
    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="font-medium text-blue-800 mb-2">使用说明</h3>
      <ul class="text-sm text-blue-700 space-y-1">
        <li>1. 点击验证码卡片右上角的复制按钮，即可复制当前验证码</li>
        <li>2. 点击账号名称可快速复制账号名</li>
        <li>3. 验证码每 30 秒自动刷新，右侧圆环显示剩余时间</li>
        <li>4. 圆环变红表示验证码即将过期，请等待新码生成后再使用</li>
        <li>5. 下方可输入临时密钥获取一次性验证码</li>
      </ul>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else-if="accounts.length === 0" class="text-center py-8 text-gray-500">
      暂无账号，请联系管理员添加
    </div>
    <div v-else class="space-y-6">
      <div v-for="group in groupedAccounts" :key="group.issuer">
        <h3 class="text-sm font-medium text-gray-500 mb-2 px-1">{{ group.issuer }}</h3>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AccountCard
            v-for="account in group.accounts"
            :key="account.id"
            :account="account"
            :remaining="remainingMap[account.id] ?? account.remaining"
            :hide-issuer="true"
          />
        </div>
      </div>
    </div>

    <!-- 临时验证码查询 -->
    <div class="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 class="font-medium text-gray-800 mb-3">临时验证码查询</h3>
      <div class="flex gap-3">
        <input
          v-model="tempSecret"
          type="text"
          placeholder="输入密钥 (Base32 格式)"
          class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <button
          @click="generateTempCode"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
        >
          获取验证码
        </button>
      </div>
      <div v-if="tempCode" class="mt-4 p-3 bg-white border rounded-lg flex items-center justify-between">
        <div class="text-2xl font-mono font-bold text-blue-600 tracking-wider">
          {{ tempCodeFormatted }}
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">{{ tempRemaining }}s</div>
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
                  :stroke="tempRemaining <= 5 ? '#ef4444' : '#3b82f6'"
                  stroke-width="3"
                  :stroke-dasharray="tempCircumference"
                  :stroke-dashoffset="tempDashOffset"
                  stroke-linecap="round"
                  class="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>
          <button
            @click="copyTempCode"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="复制验证码"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
      <div v-if="tempCopied" class="mt-2 text-xs text-green-600">已复制</div>
      <div v-if="tempError" class="mt-3 text-red-500 text-sm">{{ tempError }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getAccounts, type AccountWithCode } from '../utils/api';
import { generateTOTP, getRemaining } from '../utils/totp';
import AccountCard from '../components/AccountCard.vue';

const accounts = ref<AccountWithCode[]>([]);
const remainingMap = ref<Record<string, number>>({});
const loading = ref(true);
const error = ref('');

// 按 issuer 分组
const groupedAccounts = computed(() => {
  const groups: Record<string, AccountWithCode[]> = {};
  for (const acc of accounts.value) {
    const issuer = acc.issuer || '其他';
    if (!groups[issuer]) {
      groups[issuer] = [];
    }
    groups[issuer].push(acc);
  }
  // 按 issuer 名称排序
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === '其他') return 1;
    if (b === '其他') return -1;
    return a.localeCompare(b);
  });
  return sortedKeys.map((key) => ({
    issuer: key,
    accounts: groups[key].sort((a, b) => a.name.localeCompare(b.name)),
  }));
});

let timer: number | null = null;
let refreshTimer: number | null = null;

async function fetchAccounts() {
  try {
    accounts.value = await getAccounts();
    // 初始化 remaining
    for (const acc of accounts.value) {
      remainingMap.value[acc.id] = acc.remaining;
    }
    error.value = '';
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

function tick() {
  for (const acc of accounts.value) {
    const current = remainingMap.value[acc.id] ?? acc.period;
    if (current <= 1) {
      // 刷新数据
      fetchAccounts();
      return;
    }
    remainingMap.value[acc.id] = current - 1;
  }
  // 更新临时验证码
  if (tempCode.value) {
    refreshTempCode();
  }
}

// 临时验证码功能
const tempSecret = ref('');
const tempCode = ref('');
const tempRemaining = ref(0);
const tempError = ref('');
const tempCopied = ref(false);
let lastTempRefreshTime = 0;

const tempCircumference = 2 * Math.PI * 14;
const tempDashOffset = computed(() => {
  const progress = tempRemaining.value / 30;
  return tempCircumference * (1 - progress);
});

const tempCodeFormatted = computed(() => {
  if (tempCode.value.length === 6) {
    return `${tempCode.value.slice(0, 3)} ${tempCode.value.slice(3)}`;
  }
  return tempCode.value;
});

async function generateTempCode() {
  if (!tempSecret.value.trim()) {
    tempError.value = '请输入密钥';
    return;
  }
  try {
    tempCode.value = await generateTOTP(tempSecret.value.trim());
    tempRemaining.value = getRemaining(30);
    lastTempRefreshTime = Math.floor(Date.now() / 30000);
    tempError.value = '';
  } catch (e) {
    tempError.value = '密钥格式无效';
    tempCode.value = '';
  }
}

async function refreshTempCode() {
  if (tempSecret.value.trim()) {
    const currentPeriod = Math.floor(Date.now() / 30000);
    // 只有周期变化时才刷新验证码
    if (currentPeriod !== lastTempRefreshTime) {
      try {
        tempCode.value = await generateTOTP(tempSecret.value.trim());
        lastTempRefreshTime = currentPeriod;
      } catch {
        // 忽略刷新错误
      }
    }
    tempRemaining.value = getRemaining(30);
  }
}

async function copyTempCode() {
  await navigator.clipboard.writeText(tempCode.value);
  tempCopied.value = true;
  setTimeout(() => {
    tempCopied.value = false;
  }, 1500);
}

onMounted(() => {
  fetchAccounts();
  timer = window.setInterval(tick, 1000);
  // 每 30 秒强制刷新一次
  refreshTimer = window.setInterval(fetchAccounts, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
