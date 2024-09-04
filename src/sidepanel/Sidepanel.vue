<script setup lang="ts">
import { ref } from 'vue'
import { onMessage, sendMessage } from 'webext-bridge/popup'
import { storageDemo } from '~/logic/storage'

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

async function enableHover() {
  await sendMessage('TOGGLE_HOVER', {
    enable: true,
  }, 'background')
}

const elementData = ref({})

onMessage('ELEMENT_INFO', async ({ data }) => {
  console.log('data', data)
  elementData.value = data.elementInfo
})
</script>

<template>
  <main class="w-full px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Sidepanel</div>
    <SharedSubtitle />

    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>

    <button class="btn mt-2" @click="enableHover">
      Enable Hover
    </button>

    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>

    <div class="mt-2">
      {{ elementData }}
    </div>
  </main>
</template>
