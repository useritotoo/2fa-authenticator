<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-gray-800">2FA Authenticator</router-link>
        <router-link
          to="/admin"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          管理
        </router-link>
      </div>
    </nav>
    <main class="max-w-4xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
