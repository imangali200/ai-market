<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

import { useToast } from '~/composables/useToast';
interface Branch { id: number; name: string; branchName?: string; adminId: number; responsibleName?: string }

const token = useCookie('token')
const { $axios } = useNuxtApp()
const toast = useToast()
const branchData = ref<Branch[]>([])
const loading = ref(false)

async function getBranches() {
    loading.value = true
    try {
        const res = await $axios.get('branch', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        branchData.value = res.data
    } catch (error) {
        // console.error(error)
        toast.error('Ошибка при загрузке складов', { position: 'top-center'  })
    } finally {
        loading.value = false
    }
}

const removeBranch = async (id: number) => {
    if (!confirm('Удалить этот склад?')) return
    try {
        const branchRes = await $axios.delete(`branch/${id}`, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        if (branchRes.status === 200) {
            toast.success('Успешно удалено', { position: 'top-center'  })
        }
        getBranches()
    } catch (error) {
        // console.error(error)
        toast.error('Ошибка при удалении', { position: 'top-center'  })
    }
}

onMounted(() => {
    getBranches()
})
</script>

<template>
    <div class="tw-py-6 animate-fadeIn">
        <!-- Breadcrumb -->
        <div class="tw-flex tw-items-center tw-gap-3 tw-mb-6 tw-flex-wrap">
            <router-link to="/superAdmin" class="tw-flex tw-items-center tw-gap-2 tw-text-cyan-400 tw-no-underline hover:tw-text-cyan-300 tw-transition-colors tw-text-sm">
                <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Главная
            </router-link>
            <span class="tw-text-white/30">→</span>
            <span class="tw-text-white/60 tw-text-sm">Склады</span>
        </div>

        <!-- Actions -->
        <div class="tw-flex tw-justify-end tw-gap-3 tw-mb-6 tw-pb-6 tw-border-b tw-border-white/10">
            <router-link to="/superAdmin/warehouses/trash" class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-red-500/15 tw-border tw-border-red-500/30 tw-rounded-xl tw-text-red-400 tw-font-semibold tw-text-sm tw-no-underline hover:tw-bg-red-500/25 tw-transition-all">
                <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>Корзина</span>
            </router-link>
            <router-link to="/superAdmin/warehouses/create" class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-font-semibold tw-text-sm tw-no-underline hover:tw-translate-y-[-2px] hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all">
                <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Добавить</span>
            </router-link>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tw-text-center tw-py-16">
            <div class="tw-w-12 tw-h-12 tw-border-4 tw-border-cyan-500/20 tw-border-t-cyan-500 tw-rounded-full tw-animate-spin tw-mx-auto"></div>
            <p class="tw-mt-4 tw-text-white/50">Загрузка...</p>
        </div>

        <template v-else>
            <!-- Empty State -->
            <div v-if="!branchData.length" class="tw-text-center tw-py-16 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl">
                <div class="tw-text-5xl tw-mb-4">🏢</div>
                <h3 class="tw-text-xl tw-font-bold tw-text-white tw-mb-2">Нет складов</h3>
                <p class="tw-text-white/50 tw-mb-6">Добавьте первый склад</p>
                <router-link to="/superAdmin/warehouses/create" class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-font-semibold tw-no-underline hover:tw-translate-y-[-2px] hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Добавить склад
                </router-link>
            </div>

            <!-- Warehouses Grid -->
            <div v-else class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                <div v-for="data in branchData" :key="data.id" class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-overflow-hidden hover:tw-border-violet-500/30 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl tw-transition-all tw-duration-300">
                    <div class="tw-flex tw-justify-between tw-items-center tw-p-5 tw-bg-gradient-to-r tw-from-violet-500 tw-to-violet-600">
                        <div class="tw-w-11 tw-h-11 tw-bg-white/20 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-white">
                            <svg class="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </div>
                        <div class="tw-px-3 tw-py-1.5 tw-bg-white/20 tw-rounded-lg tw-text-white tw-font-semibold tw-text-sm">#{{ data.id }}</div>
                    </div>
                    
                    <div class="tw-p-5">
                        <h3 class="tw-text-lg tw-font-bold tw-text-white tw-mb-3">{{ data.branchName }}</h3>
                        <div class="tw-mb-4">
                            <span class="tw-text-xs tw-text-white/40 tw-uppercase tw-tracking-wider">Ответственный</span>
                            <p class="tw-text-white/90 tw-text-sm tw-mt-0.5">{{ data.responsibleName }}</p>
                        </div>
                    </div>
                    
                    <div class="tw-flex tw-gap-2 tw-px-5 tw-pb-5">
                        <router-link :to="`/superAdmin/warehouses/edit/${data.id}`" class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-2.5 tw-bg-cyan-500/20 tw-rounded-xl tw-text-cyan-400 tw-font-semibold tw-text-sm hover:tw-bg-cyan-500/30 tw-transition-all tw-no-underline">
                            <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Изменить
                        </router-link>
                        <button @click="removeBranch(data.id)" class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-2.5 tw-bg-red-500/20 tw-rounded-xl tw-text-red-400 tw-font-semibold tw-text-sm hover:tw-bg-red-500/30 tw-transition-all">
                            <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
