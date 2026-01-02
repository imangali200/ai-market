<template>
  <div class="tw-py-6 animate-fadeIn">
    <!-- Header -->
    <div class="tw-mb-6">
      <div class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-mb-4">
        <router-link class="tw-text-cyan-400 hover:tw-text-cyan-300 tw-transition-colors" to="/superAdmin">Главная</router-link>
        <span class="tw-text-white/60">→</span>
        <span class="tw-text-white/60">Импорт</span>
      </div>
      <h1 class="tw-text-2xl tw-font-bold tw-text-white tw-mb-2">Импорт трек-кодов</h1>
      <p class="tw-text-white/60">Загрузите файл с трек-кодами для массового обновления статусов</p>
    </div>

    <!-- Import Type Tabs -->
    <div class="tw-flex tw-gap-3 tw-mb-6">
      <button 
        @click="activeTab = 'china'"
        :class="[
          'tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-font-semibold tw-transition-all',
          activeTab === 'china' 
            ? 'tw-bg-gradient-to-r tw-from-amber-500 tw-to-orange-500 tw-text-white tw-shadow-lg tw-shadow-amber-500/30' 
            : 'tw-bg-white/5 tw-text-white/60 hover:tw-bg-white/10'
        ]"
      >
        <span class="tw-text-lg">🇨🇳</span>
        Қытайға келді
      </button>
      <button 
        @click="activeTab = 'taraz'"
        :class="[
          'tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-font-semibold tw-transition-all',
          activeTab === 'taraz' 
            ? 'tw-bg-gradient-to-r tw-from-violet-500 tw-to-purple-500 tw-text-white tw-shadow-lg tw-shadow-violet-500/30' 
            : 'tw-bg-white/5 tw-text-white/60 hover:tw-bg-white/10'
        ]"
      >
        <span class="tw-text-lg">📦</span>
        Таразға келді
      </button>
    </div>

    <!-- China Import Card -->
    <div v-if="activeTab === 'china'" class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-amber-500/20 tw-rounded-2xl tw-p-6 tw-mb-6">
      <div class="tw-flex tw-items-center tw-gap-3 tw-mb-6">
        <div class="tw-w-12 tw-h-12 tw-rounded-xl tw-bg-gradient-to-br tw-from-amber-500 tw-to-orange-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xl">
          🇨🇳
        </div>
        <div>
          <h2 class="tw-text-lg tw-font-semibold tw-text-white">Қытай складына келді</h2>
          <p class="tw-text-white/60 tw-text-sm">Трек-кодтарды Қытай складына жеткен деп белгілеу</p>
        </div>
      </div>

      <div class="tw-space-y-4">
        <!-- File Input -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center">
          <label class="tw-text-white/70 tw-font-medium tw-w-24 tw-flex-shrink-0">Файл:</label>
          <div class="tw-flex tw-items-center tw-gap-3 tw-flex-1">
            <input 
              ref="chinaFileInput"
              type="file" 
              accept=".xlsx,.txt"
              @change="onChinaFileChange" 
              class="tw-hidden"
            >
            <button 
              type="button"
              @click="openChinaFilePicker"
              class="tw-px-4 tw-py-2.5 tw-bg-gradient-to-r tw-from-amber-500 tw-to-orange-500 tw-rounded-xl tw-text-white tw-font-medium tw-text-sm hover:tw-shadow-lg hover:tw-shadow-amber-500/30 tw-transition-all tw-flex tw-items-center tw-gap-2"
            >
              <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              Файл таңдау
            </button>
            <span class="tw-text-white/60 tw-text-sm tw-truncate">
              {{ chinaFile ? chinaFile.name : 'Файл таңдалмаған' }}
            </span>
          </div>
        </div>

        <!-- Time Input -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center">
          <label class="tw-text-white/70 tw-font-medium tw-w-24 tw-flex-shrink-0">Уақыт:</label>
          <input 
            type="datetime-local"
            v-model="chinaTime"
            class="tw-flex-1 sm:tw-max-w-xs tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-px-4 tw-py-2.5 tw-text-white tw-outline-none focus:tw-border-amber-500/50 tw-transition-colors"
          >
        </div>

        <!-- Upload Button -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center tw-pt-2">
          <div class="tw-w-24 tw-hidden sm:tw-block"></div>
          <button 
            @click="uploadChinaFile"
            :disabled="chinaLoading || !chinaFile"
            class="tw-px-6 tw-py-3 tw-bg-gradient-to-r tw-from-amber-500 tw-to-orange-600 tw-rounded-xl tw-text-white tw-font-semibold hover:tw-shadow-lg hover:tw-shadow-amber-500/30 tw-transition-all disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-flex tw-items-center tw-justify-center tw-gap-2"
          >
            <svg v-if="chinaLoading" class="tw-w-5 tw-h-5 tw-animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            {{ chinaLoading ? 'Жүктелуде...' : 'Загрузить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Taraz Import Card -->
    <div v-if="activeTab === 'taraz'" class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-violet-500/20 tw-rounded-2xl tw-p-6 tw-mb-6">
      <div class="tw-flex tw-items-center tw-gap-3 tw-mb-6">
        <div class="tw-w-12 tw-h-12 tw-rounded-xl tw-bg-gradient-to-br tw-from-violet-500 tw-to-purple-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xl">
          📦
        </div>
        <div>
          <h2 class="tw-text-lg tw-font-semibold tw-text-white">Таразға келді</h2>
          <p class="tw-text-white/60 tw-text-sm">Трек-кодтарды AiCargo складына жеткен деп белгілеу</p>
        </div>
      </div>

      <div class="tw-space-y-4">
        <!-- File Input -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center">
          <label class="tw-text-white/70 tw-font-medium tw-w-24 tw-flex-shrink-0">Файл:</label>
          <div class="tw-flex tw-items-center tw-gap-3 tw-flex-1">
            <input 
              ref="tarazFileInput"
              type="file" 
              accept=".xlsx,.txt"
              @change="onTarazFileChange" 
              class="tw-hidden"
            >
            <button 
              type="button"
              @click="openTarazFilePicker"
              class="tw-px-4 tw-py-2.5 tw-bg-gradient-to-r tw-from-violet-500 tw-to-purple-500 tw-rounded-xl tw-text-white tw-font-medium tw-text-sm hover:tw-shadow-lg hover:tw-shadow-violet-500/30 tw-transition-all tw-flex tw-items-center tw-gap-2"
            >
              <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              Файл таңдау
            </button>
            <span class="tw-text-white/60 tw-text-sm tw-truncate">
              {{ tarazFile ? tarazFile.name : 'Файл таңдалмаған' }}
            </span>
          </div>
        </div>

        <!-- Time Input -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center">
          <label class="tw-text-white/70 tw-font-medium tw-w-24 tw-flex-shrink-0">Уақыт:</label>
          <input 
            type="datetime-local"
            v-model="tarazTime"
            class="tw-flex-1 sm:tw-max-w-xs tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-px-4 tw-py-2.5 tw-text-white tw-outline-none focus:tw-border-violet-500/50 tw-transition-colors"
          >
        </div>

        <!-- Upload Button -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center tw-pt-2">
          <div class="tw-w-24 tw-hidden sm:tw-block"></div>
          <button 
            @click="uploadTarazFile"
            :disabled="tarazLoading || !tarazFile"
            class="tw-px-6 tw-py-3 tw-bg-gradient-to-r tw-from-violet-500 tw-to-purple-600 tw-rounded-xl tw-text-white tw-font-semibold hover:tw-shadow-lg hover:tw-shadow-violet-500/30 tw-transition-all disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-flex tw-items-center tw-justify-center tw-gap-2"
          >
            <svg v-if="tarazLoading" class="tw-w-5 tw-h-5 tw-animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            {{ tarazLoading ? 'Жүктелуде...' : 'Загрузить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Warning -->
    <div class="tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-rounded-2xl tw-p-4 tw-mb-6">
      <div class="tw-flex tw-items-start tw-gap-3">
        <div class="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-red-500/20 tw-flex tw-items-center tw-justify-center tw-text-red-400 tw-flex-shrink-0">
          <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <p class="tw-text-red-400 tw-font-medium">Максимум 900 трек-код</p>
          <p class="tw-text-red-400/70 tw-text-sm">Если больше — разделите на части и импортируйте заново</p>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-p-5">
      <div class="tw-flex tw-items-center tw-gap-3 tw-mb-4">
        <div class="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-cyan-500/20 tw-flex tw-items-center tw-justify-center tw-text-cyan-400">
          <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="tw-text-white tw-font-semibold">Нұсқаулық</h3>
      </div>
      <ul class="tw-space-y-2 tw-text-white/60 tw-text-sm">
        <li class="tw-flex tw-items-start tw-gap-2">
          <span class="tw-text-cyan-400">•</span>
          <span><strong class="tw-text-amber-400">🇨🇳 Қытайға келді</strong> — трек-кодтардың Қытай складына жеткенін белгілеу</span>
        </li>
        <li class="tw-flex tw-items-start tw-gap-2">
          <span class="tw-text-cyan-400">•</span>
          <span><strong class="tw-text-violet-400">📦 Таразға келді</strong> — трек-кодтардың AiCargo складына жеткенін белгілеу</span>
        </li>
        <li class="tw-flex tw-items-start tw-gap-2">
          <span class="tw-text-cyan-400">•</span>
          Трек-коды должны быть размещены начиная с первого столбца (A)
        </li>
        <li class="tw-flex tw-items-start tw-gap-2">
          <span class="tw-text-cyan-400">•</span>
          Файл должен быть в формате .xlsx или .txt
        </li>
        <li class="tw-flex tw-items-start tw-gap-2">
          <span class="tw-text-cyan-400">•</span>
          Каждый трек-код на отдельной строке
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const { $axios } = useNuxtApp()
const token = useCookie('token')

const activeTab = ref<'china' | 'taraz'>('china')

// China import state
const chinaFileInput = ref<HTMLInputElement | null>(null)
const chinaFile = ref<File | null>(null)
const chinaTime = ref<string>(getDefaultTime())
const chinaLoading = ref<boolean>(false)

// Taraz import state
const tarazFileInput = ref<HTMLInputElement | null>(null)
const tarazFile = ref<File | null>(null)
const tarazTime = ref<string>(getDefaultTime())
const tarazLoading = ref<boolean>(false)

function getDefaultTime(): string {
  const now = new Date()
  return now.toISOString().slice(0, 16)
}

function formatTimeForApi(datetimeLocal: string): string {
  return datetimeLocal.replace("T", " ")
}

// China file handlers
const openChinaFilePicker = () => {
  chinaFileInput.value?.click()
}

const onChinaFileChange = (e: any) => {
  chinaFile.value = e.target.files[0]
}

const uploadChinaFile = async () => {
  if (!chinaFile.value) {
    toast.error("Файл не выбран!", { position: 'top-center' })
    return
  }

  if (!chinaTime.value) {
    toast.error("Уақыт таңдалмаған!", { position: 'top-center' })
    return
  }

  chinaLoading.value = true

  try {
    const formData = new FormData()
    formData.append("file", chinaFile.value)
    formData.append("time", formatTimeForApi(chinaTime.value))
    formData.append("type", "china")

    await $axios.post(
      "admin/tracks/uploads",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "multipart/form-data"
        }
      }
    )

    toast.success("Қытай складына келді деп белгіленді!", { position: 'top-center' })
    chinaFile.value = null

  } catch (err) {
    toast.error("Файлды жүктеу кезінде қате болды", { position: 'top-center' })
    console.error(err)
  } finally {
    chinaLoading.value = false
  }
}

// Taraz file handlers
const openTarazFilePicker = () => {
  tarazFileInput.value?.click()
}

const onTarazFileChange = (e: any) => {
  tarazFile.value = e.target.files[0]
}

const uploadTarazFile = async () => {
  if (!tarazFile.value) {
    toast.error("Файл не выбран!", { position: 'top-center' })
    return
  }

  if (!tarazTime.value) {
    toast.error("Уақыт таңдалмаған!", { position: 'top-center' })
    return
  }

  tarazLoading.value = true

  try {
    const formData = new FormData()
    formData.append("file", tarazFile.value)
    formData.append("time", formatTimeForApi(tarazTime.value))
    formData.append("type", "taraz")

    await $axios.post(
      "/admin/tracks/uploads-taraz",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "multipart/form-data"
        }
      }
    )

    toast.success("Таразға келді деп белгіленді!", { position: 'top-center' })
    tarazFile.value = null

  } catch (err) {
    toast.error("Файлды жүктеу кезінде қате болды", { position: 'top-center' })
    console.error(err)
  } finally {
    tarazLoading.value = false
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>





