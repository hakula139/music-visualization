<template>
  <a-layout-header class="sticky top-0 z-50 flex items-center justify-between px-6">
    <span class="text-header">{{ META_INFO.TITLE }}</span>
    <a-button
      type="text"
      @click="gotoRepo"
    >
      <template #icon>
        <github-outlined class="text-header" />
      </template>
    </a-button>
  </a-layout-header>
</template>

<script setup lang="ts">
// #region imports

import { META_INFO } from '@/configs';

// #endregion

const gotoRepo = (): void => {
  window.location.href = META_INFO.REPO_URL;
};
</script>

<style scoped>
.text-header {
  @apply text-2xl text-white;
}
</style>
