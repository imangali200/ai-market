<script setup lang="ts">
    definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

import type { User } from './users.vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()
const { $axios } = useNuxtApp()
const token = useCookie('token')
const router = useRouter()

const archiveUsers = ref<User[]>([])
const loading = ref(false)

const getKorzina = async () => {
    loading.value = true
    try {
        const res = await $axios.get('admin/archive', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        archiveUsers.value = res.data || []
    } catch (error) {
        // console.error(error)
    } finally {
        loading.value = false
    }
}

const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const restoreUser = async (id: number) => {
    if (!confirm("Восстановить пользователя?")) return
    try {
        const restoreData = await $axios.patch(`user/archive/${id}`, {}, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        if (restoreData.status === 200) {
            toast.success('Пользователь восстановлен', { position: 'top-center'  })
        }
        getKorzina()
    } catch (error) {
        // console.error(error)
        toast.error('Ошибка при восстановлении', { position: 'top-center'  })
    }
}

function goBack() {
    router.push('/superAdmin/users')
}

onMounted(() => {
    getKorzina()
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
            <router-link to="/superAdmin/users" class="tw-text-cyan-400 tw-no-underline hover:tw-text-cyan-300 tw-transition-colors tw-text-sm">Пользователи</router-link>
            <span class="tw-text-white/30">→</span>
            <span class="tw-text-white/60 tw-text-sm">Корзина</span>
        </div>

        <!-- Header -->
        <div class="tw-flex tw-flex-wrap tw-justify-between tw-items-center tw-gap-4 tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-4">
                <h1 class="tw-text-2xl tw-font-bold tw-text-white">🗑️ Корзина</h1>
                <span class="tw-px-3 tw-py-1.5 tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-rounded-full tw-text-red-400 tw-text-sm tw-font-semibold">{{ archiveUsers.length }} пользователей</span>
            </div>
            <button @click="goBack" class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-cyan-500/15 tw-border tw-border-cyan-500/30 tw-rounded-xl tw-text-cyan-400 tw-font-semibold tw-text-sm hover:tw-bg-cyan-500/25 tw-transition-all">
                <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Назад
            </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tw-text-center tw-py-16">
            <div class="tw-w-12 tw-h-12 tw-border-4 tw-border-red-500/20 tw-border-t-red-500 tw-rounded-full tw-animate-spin tw-mx-auto"></div>
            <p class="tw-mt-4 tw-text-white/50">Загрузка...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!archiveUsers.length" class="tw-text-center tw-py-16 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl">
            <div class="tw-text-5xl tw-mb-4">🗑️</div>
            <h3 class="tw-text-xl tw-font-bold tw-text-white tw-mb-2">Корзина пуста</h3>
            <p class="tw-text-white/50 tw-mb-6">Удалённые пользователи появятся здесь</p>
            <router-link to="/superAdmin/users" class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-font-semibold tw-no-underline hover:tw-translate-y-[-2px] hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all">
                <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                К пользователям
            </router-link>
        </div>

        <!-- Content -->
        <template v-else>
            <!-- Mobile Cards -->
            <div class="tw-block lg:tw-hidden tw-space-y-3">
                <div v-for="user in archiveUsers" :key="'mobile-' + user.id" class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-xl tw-p-4 hover:tw-border-red-500/30 tw-transition-all">
                    <div class="tw-flex tw-justify-between tw-items-start tw-mb-4">
                        <div class="tw-flex tw-items-center tw-gap-3">
                            <div class="tw-w-11 tw-h-11 tw-rounded-xl tw-bg-gradient-to-br tw-from-red-500 tw-to-red-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm">{{ user.name.charAt(0) }}{{ user.surname.charAt(0) }}</div>
                            <div>
                                <p class="tw-font-semibold tw-text-white">{{ user.name }} {{ user.surname }}</p>
                                <p class="tw-text-xs tw-text-white/50">ID: {{ user.id }} • {{ user.role }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-mb-4 tw-pb-4 tw-border-b tw-border-white/10">
                        <div>
                            <span class="tw-text-[10px] tw-text-white/40 tw-uppercase tw-tracking-wider">Код</span>
                            <p class="tw-text-white tw-text-sm">{{ user.code || '—' }}</p>
                        </div>
                        <div>
                            <span class="tw-text-[10px] tw-text-white/40 tw-uppercase tw-tracking-wider">Телефон</span>
                            <p class="tw-text-white tw-text-sm">{{ user.phoneNumber }}</p>
                        </div>
                        <div>
                            <span class="tw-text-[10px] tw-text-white/40 tw-uppercase tw-tracking-wider">Пароль</span>
                            <p class="tw-text-white tw-text-sm">{{ user.password }}</p>
                        </div>
                        <div>
                            <span class="tw-text-[10px] tw-text-white/40 tw-uppercase tw-tracking-wider">Удалён</span>
                            <p class="tw-text-white tw-text-sm">{{ formatDate(user.deletedAt!) }}</p>
                        </div>
                    </div>
                    <button @click="restoreUser(user.id)" class="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-3 tw-bg-emerald-500/20 tw-rounded-xl tw-text-emerald-400 tw-font-semibold hover:tw-bg-emerald-500/30 tw-transition-all">
                        <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Восстановить
                    </button>
                </div>
            </div>

            <!-- Desktop Table -->
            <div class="tw-hidden lg:tw-block tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-overflow-hidden">
                <table class="tw-w-full">
                    <thead>
                        <tr class="tw-bg-white/5">
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">#ID</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Код</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Роль</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Телефон</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">ФИО</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Пароль</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Удалён</th>
                            <th class="tw-text-center tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Действия</th>
                    </tr>
                </thead>
                <tbody>
                        <tr v-for="user in archiveUsers" :key="'desktop-' + user.id" class="tw-border-t tw-border-white/5 hover:tw-bg-white/[0.02] tw-transition-all">
                            <td class="tw-px-5 tw-py-4 tw-text-white">{{ user.id }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white">{{ user.code || '—' }}</td>
                            <td class="tw-px-5 tw-py-4">
                                <span :class="['tw-px-3 tw-py-1 tw-rounded-md tw-text-xs tw-font-semibold', user.role === 'superAdmin' ? 'tw-bg-amber-500/20 tw-text-amber-400' : user.role === 'admin' ? 'tw-bg-violet-500/20 tw-text-violet-400' : 'tw-bg-cyan-500/20 tw-text-cyan-400']">{{ user.role }}</span>
                        </td>
                            <td class="tw-px-5 tw-py-4 tw-text-white">{{ user.phoneNumber }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white">{{ user.name }} {{ user.surname }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white">{{ user.password }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white/70">{{ formatDate(user.deletedAt!) }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-center">
                                <button @click="restoreUser(user.id)" class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-emerald-500/20 tw-rounded-lg tw-text-emerald-400 tw-text-sm tw-font-semibold hover:tw-bg-emerald-500/30 tw-transition-all">
                                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    Восстановить
                                </button>
                        </td>
                    </tr>
                </tbody>
            </table>
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
