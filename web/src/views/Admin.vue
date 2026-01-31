<template>
  <div>
    <!-- 登录表单 -->
    <div v-if="!isLoggedIn" class="max-w-sm mx-auto">
      <h2 class="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">管理员登录</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="请输入管理员密码"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div v-if="loginError" class="text-red-500 dark:text-red-400 text-sm">{{ loginError }}</div>
        <button
          type="submit"
          :disabled="loginLoading"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loginLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>

    <!-- 管理后台 -->
    <div v-else class="pb-20">
      <!-- 顶部标题栏 + 操作按钮 -->
      <div class="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 mb-4 -mx-4 sm:mx-0 sm:rounded-lg transition-colors">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">账号管理</h2>
          <div class="flex items-center gap-1">
            <!-- 扫码添加 -->
            <button
              @click="startQrScan"
              class="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
              title="扫码添加"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
            <!-- 手动添加 -->
            <button
              @click="showAddForm = true"
              class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="手动添加"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <!-- 更多菜单 -->
            <div class="relative">
              <button
                @click="showMoreMenu = !showMoreMenu"
                class="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <!-- 更多菜单下拉 -->
              <div
                v-if="showMoreMenu"
                class="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
              >
                <button
                  @click="showImportForm = true; showMoreMenu = false"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  导入
                </button>
                <button
                  @click="showExportForm = true; showMoreMenu = false"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导出
                </button>
                <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  @click="handleLogout(); showMoreMenu = false"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量操作浮动栏（选中时显示） -->
      <div
        v-if="selectedIds.size > 0"
        class="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 z-40"
      >
        <div class="flex items-center justify-between gap-2">
          <!-- 左侧：选中数量 + 取消 -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ selectedIds.size }}</span>
            <button
              @click="selectedIds = new Set()"
              class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="取消选择"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- 右侧：操作按钮 -->
          <div class="flex items-center gap-1">
            <button
              @click="handleBatchSetPublic(true)"
              class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              title="设为公开"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="hidden sm:inline">公开</span>
            </button>
            <button
              @click="handleBatchSetPublic(false)"
              class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="设为隐私"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <span class="hidden sm:inline">隐私</span>
            </button>
            <button
              @click="handleBatchDelete()"
              class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="删除"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="hidden sm:inline">删除</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 账号列表 -->
      <div v-if="loading" class="text-center py-8 text-gray-500 dark:text-gray-400">加载中...</div>
      <div v-else-if="accounts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无账号
      </div>
      <div v-else class="space-y-6">
        <!-- 全选 -->
        <div class="flex items-center gap-3 px-2">
          <label class="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400 select-none">
            <input
              type="checkbox"
              :checked="selectedIds.size === accounts.length && accounts.length > 0"
              @change="toggleSelectAll"
              class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 transition-colors bg-white dark:bg-gray-700"
            />
            <span class="text-sm">全选所有账号</span>
          </label>
        </div>

        <!-- 按 issuer 分组的账号列表 -->
        <div v-for="group in groupedAccounts" :key="group.issuer">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
            {{ group.issuer }}
          </h3>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="account in group.accounts"
              :key="account.id"
              class="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <!-- 右上角标签 -->
              <div
                class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
                :class="account.isPublic ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
              >
                {{ account.isPublic ? '公开' : '隐私' }}
              </div>
              <div class="p-3">
                <div class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    :checked="selectedIds.has(account.id)"
                    @change="toggleSelect(account.id)"
                    class="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 flex-shrink-0 bg-white dark:bg-gray-700"
                  />
                  <div class="flex-1 min-w-0 pr-10">
                    <div class="font-bold text-gray-900 dark:text-gray-100 truncate mb-0.5">{{ account.name }}</div>
                    <div class="font-mono text-xs text-gray-400 truncate">{{ account.secret }}</div>
                  </div>
                </div>
                <!-- 操作按钮 -->
                <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-1">
                  <button
                    @click="editAccount(account)"
                    class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    编辑
                  </button>
                  <button
                    @click="handleDelete(account.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出弹窗 -->
    <div
      v-if="showExportForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @mousedown.self="showExportForm = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm" @mousedown.stop>
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">导出账号</h3>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ selectedIds.size > 0 ? `将导出选中的 ${selectedIds.size} 个账号` : `将导出全部 ${accounts.length} 个账号` }}
            </p>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择格式</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="radio" v-model="exportFormat" value="aegis" class="w-4 h-4" />
                <span class="text-sm">Aegis JSON</span>
              </label>
              <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="radio" v-model="exportFormat" value="json" class="w-4 h-4" />
                <span class="text-sm">简单 JSON</span>
              </label>
              <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="radio" v-model="exportFormat" value="tsv" class="w-4 h-4" />
                <span class="text-sm">TSV (Tab)</span>
              </label>
              <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="radio" v-model="exportFormat" value="csv" class="w-4 h-4" />
                <span class="text-sm">CSV</span>
              </label>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button
              @click="showExportForm = false"
              class="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              取消
            </button>
            <button
              @click="handleExport"
              class="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              导出
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入弹窗 -->
    <div
      v-if="showImportForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @mousedown.self="showImportForm = false; importError = ''"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm" @mousedown.stop>
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">导入账号</h3>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              支持 Aegis JSON、简单 JSON、TSV、CSV 格式，自动识别
            </p>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">粘贴内容或选择文件</label>
              <label class="cursor-pointer px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                选择文件
                <input
                  type="file"
                  accept=".txt,.csv,.tsv,.json"
                  class="hidden"
                  @change="handleFileSelect"
                />
              </label>
            </div>
            <textarea
              v-model="importContent"
              rows="8"
              placeholder="示例：
user@example.com, Google, JBSWY3DPEHPK3PXP
admin@company.com, GitHub, HXDMVJECJJWSRB3H"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            ></textarea>
          </div>
          <div v-if="importError" class="text-red-500 dark:text-red-400 text-sm">{{ importError }}</div>
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="showImportForm = false; importContent = ''; importError = ''"
              class="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              取消
            </button>
            <button
              @click="handleImport"
              :disabled="importLoading"
              class="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {{ importLoading ? '导入中...' : '导入' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div
      v-if="showAddForm || editingAccount"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @mousedown.self="closeForm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" @mousedown.stop>
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{{ editingAccount ? '编辑账号' : '添加账号' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">账号名称</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="例如: Google - work@company.com"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">发行方 (Issuer)</label>
            <input
              v-model="form.issuer"
              type="text"
              placeholder="例如: Google, GitHub, AWS"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密钥 (Secret)</label>
            <input
              v-model="form.secret"
              type="text"
              required
              placeholder="例如: JBSWY3DPEHPK3PXP"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.isPublic"
                type="checkbox"
                class="w-4 h-4 rounded"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">公开显示（未登录时可见）</span>
            </label>
          </div>
          <div v-if="formError" class="text-red-500 dark:text-red-400 text-sm">{{ formError }}</div>
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeForm"
              class="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="formLoading"
              class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ formLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 扫描二维码弹窗 -->
    <div
      v-if="showQrScanner"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @mousedown.self="stopQrScan"
      @paste="handlePaste"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" @mousedown.stop>
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">扫描二维码</h3>
        <div class="space-y-4">
          <!-- Tab 切换 -->
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button
              @click="switchToCamera"
              class="flex-1 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
              :class="scanMode === 'camera' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
            >
              摄像头扫描
            </button>
            <button
              @click="scanMode = 'image'"
              class="flex-1 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
              :class="scanMode === 'image' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
            >
              上传图片
            </button>
          </div>

          <!-- 摄像头扫描内容 -->
          <div v-if="scanMode === 'camera'" class="space-y-4">
            <!-- 权限提示 -->
            <div v-if="cameraPermissionDenied" class="text-center py-6">
              <div class="text-4xl mb-3">📷</div>
              <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">需要摄像头权限</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">请在浏览器设置中允许访问摄像头</p>
              <button
                @click="retryQrScan"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                重试
              </button>
            </div>
            <!-- 摄像头扫描器 -->
            <div v-else id="qr-reader" class="w-full rounded-lg overflow-hidden"></div>
          </div>

          <!-- 上传图片内容 -->
          <div v-else class="space-y-4">
            <label
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer block"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <div v-if="scanningImage">
                <div class="text-4xl mb-3">⏳</div>
                <p class="text-gray-500 dark:text-gray-400 animate-pulse">正在识别图片...</p>
              </div>
              <div v-else>
                <div class="text-4xl mb-3">📤</div>
                <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">点击选择图片或拖拽到此处</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">支持 PNG、JPG、WEBP 格式</p>
                <p class="text-xs text-gray-400 mt-2">也可以直接粘贴 (Ctrl+V / Cmd+V)</p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="hidden"
                @change="handleQrImageUpload"
              />
            </label>
          </div>

          <!-- 临时DOM元素用于图片扫描 -->
          <div id="qr-reader-temp" class="hidden"></div>

          <!-- 错误提示 -->
          <div v-if="qrError && !cameraPermissionDenied" class="text-red-500 dark:text-red-400 text-sm text-center">{{ qrError }}</div>

          <!-- 取消按钮 -->
          <div class="flex gap-3 pt-2">
            <button
              @click="stopQrScan"
              class="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import {
  login,
  logout,
  getToken,
  getAdminAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  importAccounts,
  exportAccounts,
  batchDeleteAccounts,
  batchSetVisibility,
  type Account,
} from '../utils/api';

const password = ref('');
const loginLoading = ref(false);
const loginError = ref('');
const isLoggedIn = ref(!!getToken());

const accounts = ref<Account[]>([]);
const loading = ref(true);
const selectedIds = ref<Set<string>>(new Set());
const showMoreMenu = ref(false);

// 按 issuer 分组的账号列表
const groupedAccounts = computed(() => {
  const groups: { [key: string]: Account[] } = {};

  for (const account of accounts.value) {
    const issuer = account.issuer || '其他';
    if (!groups[issuer]) {
      groups[issuer] = [];
    }
    groups[issuer].push(account);
  }

  // 对每组内的账号按名称排序
  for (const key in groups) {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  // 转换为数组并按 issuer 排序（"其他"排最后）
  return Object.entries(groups)
    .sort(([a], [b]) => {
      if (a === '其他') return 1;
      if (b === '其他') return -1;
      return a.localeCompare(b);
    })
    .map(([issuer, accs]) => ({ issuer, accounts: accs }));
});

const showAddForm = ref(false);
const editingAccount = ref<Account | null>(null);
const form = ref({
  name: '',
  issuer: '',
  secret: '',
  isPublic: false,
});
const formLoading = ref(false);
const formError = ref('');

const showImportForm = ref(false);
const importContent = ref('');
const importLoading = ref(false);
const importError = ref('');

const showExportForm = ref(false);
const exportFormat = ref<'aegis' | 'json' | 'tsv' | 'csv'>('aegis');

async function handleLogin() {
  loginLoading.value = true;
  loginError.value = '';
  try {
    await login(password.value);
    password.value = '';
    isLoggedIn.value = true;
    await fetchAccounts();
  } catch (e) {
    loginError.value = (e as Error).message;
  } finally {
    loginLoading.value = false;
  }
}

function handleLogout() {
  logout();
  isLoggedIn.value = false;
  accounts.value = [];
}

async function fetchAccounts() {
  loading.value = true;
  try {
    accounts.value = await getAdminAccounts();
  } catch (e) {
    console.error(e);
    // Token 过期被清除时，重置登录状态
    if (!getToken()) {
      isLoggedIn.value = false;
      accounts.value = [];
    }
  } finally {
    loading.value = false;
  }
}

function editAccount(account: Account) {
  editingAccount.value = account;
  form.value = {
    name: account.name,
    issuer: account.issuer,
    secret: account.secret,
    isPublic: account.isPublic ?? false,
  };
}

function closeForm() {
  showAddForm.value = false;
  editingAccount.value = null;
  form.value = { name: '', issuer: '', secret: '', isPublic: false };
  formError.value = '';
}

async function handleSubmit() {
  formLoading.value = true;
  formError.value = '';
  try {
    if (editingAccount.value) {
      await updateAccount(editingAccount.value.id, form.value);
    } else {
      await createAccount(form.value);
    }
    closeForm();
    await fetchAccounts();
  } catch (e) {
    formError.value = (e as Error).message;
  } finally {
    formLoading.value = false;
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定要删除这个账号吗？')) return;
  try {
    await deleteAccount(id);
    await fetchAccounts();
  } catch (e) {
    alert((e as Error).message);
  }
}

async function handleImport() {
  if (!importContent.value.trim()) {
    importError.value = '请输入要导入的内容';
    return;
  }
  importLoading.value = true;
  importError.value = '';
  try {
    const result = await importAccounts(importContent.value);
    let msg = `成功导入 ${result.imported} 个账号`;
    if (result.skipped > 0) {
      msg += `\n跳过 ${result.skipped} 条无效数据`;
    }
    if (result.duplicates.length > 0) {
      msg += `\n\n以下账号已存在，已跳过：\n${result.duplicates.slice(0, 10).join('\n')}`;
      if (result.duplicates.length > 10) {
        msg += `\n...等 ${result.duplicates.length} 条`;
      }
    }
    alert(msg);
    showImportForm.value = false;
    importContent.value = '';
    await fetchAccounts();
  } catch (e) {
    importError.value = (e as Error).message;
  } finally {
    importLoading.value = false;
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    importContent.value = e.target?.result as string || '';
  };
  reader.readAsText(file);
  input.value = '';
}

function toggleSelect(id: string) {
  const newSet = new Set(selectedIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  selectedIds.value = newSet;
}

function toggleSelectAll() {
  if (selectedIds.value.size === accounts.value.length) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(accounts.value.map((a) => a.id));
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.size === 0) return;
  if (!confirm(`确定要删除选中的 ${selectedIds.value.size} 个账号吗？`)) return;
  try {
    await batchDeleteAccounts(Array.from(selectedIds.value));
    selectedIds.value = new Set();
    await fetchAccounts();
  } catch (e) {
    alert((e as Error).message);
  }
}

async function handleBatchSetPublic(isPublic: boolean) {
  if (selectedIds.value.size === 0) return;
  const action = isPublic ? '公开' : '隐私';
  if (!confirm(`确定要将选中的 ${selectedIds.value.size} 个账号设为${action}吗？`)) return;
  try {
    await batchSetVisibility(Array.from(selectedIds.value), isPublic);
    selectedIds.value = new Set();
    await fetchAccounts();
  } catch (e) {
    alert((e as Error).message);
  }
}

async function handleExport() {
  try {
    const result = await exportAccounts();
    const idsToExport = selectedIds.value.size > 0 ? selectedIds.value : new Set(accounts.value.map((a) => a.id));
    const accountsToExport = result.accounts.filter((a) => idsToExport.has(a.id));

    let content: string;
    let ext: string;
    let mimeType: string;

    if (exportFormat.value === 'aegis') {
      // Aegis 兼容 JSON 格式
      const aegisData = {
        version: 1,
        header: {
          slots: null,
          params: null
        },
        db: {
          version: 2,
          entries: accountsToExport.map((acc) => ({
            type: 'totp',
            uuid: acc.id,
            name: acc.name,
            issuer: acc.issuer,
            note: '',
            favorite: false,
            info: {
              secret: acc.secret,
              algo: 'SHA1',
              digits: acc.digits || 6,
              period: acc.period || 30
            },
            groups: []
          }))
        }
      };
      content = JSON.stringify(aegisData, null, 2);
      ext = 'json';
      mimeType = 'application/json';
    } else if (exportFormat.value === 'json') {
      // 简单 JSON 格式
      const jsonData = {
        version: 1,
        exportDate: new Date().toISOString(),
        keys: accountsToExport.map((acc) => ({
          name: acc.name,
          issuer: acc.issuer,
          secret: acc.secret,
          isPublic: acc.isPublic
        }))
      };
      content = JSON.stringify(jsonData, null, 2);
      ext = 'json';
      mimeType = 'application/json';
    } else {
      // 文本格式 (TSV/CSV)
      let separator = '\t';
      if (exportFormat.value === 'csv') {
        separator = ',';
      }
      ext = exportFormat.value;
      mimeType = exportFormat.value === 'csv' ? 'text/csv' : 'text/tab-separated-values';

      const header = ['No', 'name', 'issuer', 'secret', 'isPublic'].join(separator);
      const rows = accountsToExport.map((acc, index) =>
        [index + 1, acc.name, acc.issuer, acc.secret, acc.isPublic ? 'true' : 'false'].join(separator)
      );
      content = [header, ...rows].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showExportForm.value = false;
  } catch (e) {
    alert((e as Error).message);
  }
}

// 二维码扫描相关
const showQrScanner = ref(false);
const qrError = ref('');
const cameraPermissionDenied = ref(false);
const permissionWatching = ref(false);
const scanningImage = ref(false);
const scanMode = ref<'camera' | 'image'>('camera');
let html5QrCode: Html5Qrcode | null = null;
let permissionStatus: PermissionStatus | null = null;

// 监听摄像头权限变化
async function watchCameraPermission() {
  if (permissionWatching.value) return;

  try {
    // 检查浏览器是否支持权限查询
    if (!navigator.permissions?.query) return;

    permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
    permissionWatching.value = true;

    permissionStatus.onchange = () => {
      if (permissionStatus?.state === 'granted' && cameraPermissionDenied.value && showQrScanner.value) {
        // 权限已开启，自动重试
        retryQrScan();
      }
    };
  } catch {
    // 部分浏览器不支持 camera 权限查询，忽略
  }
}

function stopWatchingPermission() {
  if (permissionStatus) {
    permissionStatus.onchange = null;
    permissionStatus = null;
  }
  permissionWatching.value = false;
}

function parseOtpauthUri(uri: string): { name: string; issuer: string; secret: string } | null {
  try {
    // otpauth://totp/Label?secret=XXX&issuer=YYY
    const url = new URL(uri);
    if (url.protocol !== 'otpauth:') return null;

    const params = url.searchParams;
    const secret = params.get('secret');
    if (!secret) return null;

    // Label 可能是 issuer:account 或者只是 account
    const label = decodeURIComponent(url.pathname.replace(/^\/+/, '').replace(/^totp\//, ''));
    let issuer = params.get('issuer') || '';
    let name = label;

    if (label.includes(':')) {
      const parts = label.split(':');
      if (!issuer) issuer = parts[0];
      name = parts.slice(1).join(':');
    }

    return { name, issuer, secret: secret.toUpperCase() };
  } catch {
    return null;
  }
}

async function startQrScan() {
  showQrScanner.value = true;
  qrError.value = '';
  cameraPermissionDenied.value = false;
  scanMode.value = 'camera';

  await nextTick();
  await startCamera();
}

async function startCamera() {
  if (scanMode.value !== 'camera') return;

  await nextTick();

  try {
    html5QrCode = new Html5Qrcode('qr-reader', { verbose: false });
    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 15,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1,
        disableFlip: false,
      },
      async (decodedText) => {
        const parsed = parseOtpauthUri(decodedText);
        if (parsed) {
          await stopQrScan();
          form.value = {
            name: parsed.name,
            issuer: parsed.issuer,
            secret: parsed.secret,
            isPublic: false,
          };
          showAddForm.value = true;
        } else {
          qrError.value = '无效的二维码格式';
        }
      },
      () => {} // 忽略扫描中的错误
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // 检测权限相关错误
    if (
      errorMessage.includes('Permission') ||
      errorMessage.includes('NotAllowedError') ||
      errorMessage.includes('denied') ||
      errorMessage.includes('dismissed')
    ) {
      cameraPermissionDenied.value = true;
      // 开始监听权限变化，用户开启权限后自动重试
      watchCameraPermission();
    } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('no camera')) {
      qrError.value = '未检测到摄像头设备';
    } else {
      qrError.value = '无法访问摄像头: ' + errorMessage;
    }
  }
}

async function switchToCamera() {
  if (scanMode.value === 'camera') return;

  scanMode.value = 'camera';
  qrError.value = '';

  await nextTick();
  await startCamera();
}

async function retryQrScan() {
  cameraPermissionDenied.value = false;
  qrError.value = '';
  await startQrScan();
}

async function stopQrScan() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch {
      // 忽略停止错误
    }
    html5QrCode = null;
  }
  stopWatchingPermission();
  showQrScanner.value = false;
  qrError.value = '';
  cameraPermissionDenied.value = false;
  scanningImage.value = false;
  scanMode.value = 'camera';
}

// 处理图片上传识别二维码
async function handleQrImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  input.value = ''; // 重置以便重复选择相同文件

  await processQrImage(file);
}

// 处理拖拽上传图片
async function handleDrop(event: DragEvent) {
  const files = event.dataTransfer?.files;
  if (!files?.length) return;

  const file = files[0];
  if (file.type.startsWith('image/')) {
    scanMode.value = 'image';
    await processQrImage(file);
  }
}

// 处理粘贴图片
async function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        event.preventDefault();
        await processQrImage(file);
        return;
      }
    }
  }
}

// 处理图片识别二维码
async function processQrImage(file: File) {
  // 停止摄像头（如果正在运行）
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch {
      // 忽略
    }
    html5QrCode = null;
  }

  scanMode.value = 'image';
  scanningImage.value = true;
  qrError.value = '';

  await nextTick();

  try {
    // 尝试多种方式识别
    const result = await scanQrFromImage(file);

    if (result) {
      const parsed = parseOtpauthUri(result);
      if (parsed) {
        await stopQrScan();
        form.value = {
          name: parsed.name,
          issuer: parsed.issuer,
          secret: parsed.secret,
          isPublic: false,
        };
        showAddForm.value = true;
      } else {
        qrError.value = '无效的二维码格式，请确保是 TOTP 二维码';
      }
    } else {
      qrError.value = '未能识别图片中的二维码，请尝试裁剪图片只保留二维码部分';
    }
  } catch (err) {
    qrError.value = '图片处理失败: ' + (err instanceof Error ? err.message : String(err));
  } finally {
    scanningImage.value = false;
  }
}

// 从图片中扫描二维码（支持多种尝试）
async function scanQrFromImage(file: File): Promise<string | null> {
  // 使用固定的 DOM 元素 ID
  const tempScanner = new Html5Qrcode('qr-reader-temp', { verbose: false });

  try {
    // 首先直接尝试扫描原图
    const result = await tempScanner.scanFileV2(file, true);
    return result.decodedText;
  } catch {
    // 原图扫描失败，尝试预处理后再扫描
  }

  // 尝试图片预处理后识别
  try {
    const processedBlob = await preprocessImage(file);
    const processedFile = new File([processedBlob], 'processed.png', { type: 'image/png' });
    const result = await tempScanner.scanFileV2(processedFile, true);
    return result.decodedText;
  } catch {
    // 预处理后也失败
  }

  // 尝试更激进的预处理
  try {
    const processedBlob = await preprocessImageAggressive(file);
    const processedFile = new File([processedBlob], 'processed.png', { type: 'image/png' });
    const result = await tempScanner.scanFileV2(processedFile, true);
    return result.decodedText;
  } catch {
    // 所有尝试都失败
  }

  return null;
}

// 图片预处理：增强对比度、转灰度
async function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 canvas 上下文'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 转为灰度并增强对比度
      for (let i = 0; i < data.length; i += 4) {
        // 转灰度
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // 增强对比度
        const contrast = 1.5;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const newValue = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

        data[i] = newValue;
        data[i + 1] = newValue;
        data[i + 2] = newValue;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法生成图片'));
        }
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('无法加载图片'));
    img.src = URL.createObjectURL(file);
  });
}

// 更激进的预处理：二值化
async function preprocessImageAggressive(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 canvas 上下文'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 计算平均亮度用于自适应阈值
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const avgBrightness = totalBrightness / (data.length / 4);
      const threshold = avgBrightness * 0.8; // 自适应阈值

      // 二值化
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const newValue = gray > threshold ? 255 : 0;

        data[i] = newValue;
        data[i + 1] = newValue;
        data[i + 2] = newValue;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法生成图片'));
        }
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('无法加载图片'));
    img.src = URL.createObjectURL(file);
  });
}

onMounted(() => {
  if (isLoggedIn.value) {
    fetchAccounts();
  } else {
    loading.value = false;
  }
  // 点击外部关闭下拉菜单
  document.addEventListener('click', closeMoreMenu);
});

function closeMoreMenu(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.relative')) {
    showMoreMenu.value = false;
  }
}

onUnmounted(() => {
  stopQrScan();
  document.removeEventListener('click', closeMoreMenu);
});
</script>
