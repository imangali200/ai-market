<template>
    <div class="tw-py-8 animate-fadeIn">
        <!-- Header -->
        <div class="tw-text-center tw-mb-8">
            <h1 class="tw-text-3xl tw-font-bold tw-text-white tw-mb-2">Панель администратора</h1>
            <p class="tw-text-white/60">Управление складом и товарами</p>
        </div>

        <!-- Warehouse Info Card -->
        <div class="tw-mb-6 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl">
            <div class="tw-flex tw-items-center tw-gap-4">
                <div class="tw-w-12 tw-h-12 tw-rounded-xl tw-bg-gradient-to-br tw-from-emerald-500 tw-to-emerald-600 tw-flex tw-items-center tw-justify-center tw-text-white">
                    <svg class="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div>
                    <p class="tw-text-white/60 tw-text-sm">Вы являетесь администратором склада</p>
                    <p class="tw-text-white tw-text-xl tw-font-semibold" v-if="profileData && profileData.branch">{{ profileData.branch }}</p>
                    <div v-else class="tw-h-6 tw-w-32 tw-bg-white/10 tw-rounded tw-animate-pulse"></div>
                </div>
            </div>
        </div>
        
        <!-- Action Cards -->
        <div class="tw-flex tw-flex-col sm:tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
            <!-- Accept Goods -->
            <router-link to="/admin/new-receipts" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-cyan-500/50 hover:tw-bg-cyan-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-cyan-500 tw-to-cyan-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">Принять товары</h3>
                    <p class="tw-text-sm tw-text-white/60">Accept goods</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>

            <!-- History -->
            <router-link to="/admin/history" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-violet-500/50 hover:tw-bg-violet-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-violet-500 tw-to-violet-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">История</h3>
                    <p class="tw-text-sm tw-text-white/60">History</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>

            <!-- Import -->
            <router-link to="/admin/import" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-amber-500/50 hover:tw-bg-amber-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-amber-500 tw-to-orange-500 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">Импорт</h3>
                    <p class="tw-text-sm tw-text-white/60">Import data</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'warehouse',
    middleware: 'auth'
})

const { $axios } = useNuxtApp()
const token = useCookie('token')

export interface profile {
    id: number,
    phoneNumber: string,
    name: string,
    surname: string,
    code: string | number | null,
    branch: string | null,
    password: string,
    isActive: boolean,
    role: string,
    postLikes: object,
    createAt: string,
    deletedAt: string | null
}

const profileData = ref<profile | null>(null)

async function getBranchesName() {
    try {
        const getBranch = await $axios.get('/profile', {
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        })
        profileData.value = getBranch.data
    } catch (error) {
        // console.error(error)
    }
}

onMounted(() => {
    getBranchesName()
})
</script>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
