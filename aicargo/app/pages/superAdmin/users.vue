<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

import { useToast } from '~/composables/useToast'
const { $axios } = useNuxtApp()
const token = useCookie('token')
const router = useRouter()

export interface User {
    branch: boolean | string
    code: null | string
    id: number
    role: 'superAdmin' | 'admin' | 'user'
    name: string
    surname: string
    phoneNumber: string
    password: string
    isActive: boolean
    createAt: string
    deletedAt: null | string
}

export interface Branch {
    branchName: string
    deleteAt: string
    id: number
    responsibleName: string
}

const toast = useToast()
const users = ref<User[]>([])
const allUsers = ref<User[]>([])
const branches = ref<Branch[]>([])
const selectedBranch = ref<string>('')
const currentPage = ref(1)
const perPage = 20
const loading = ref(false)
const removeSearchButton = ref<boolean>(false)
const searchValue = ref<string>("")

const routeToEdit = (id: number) => {
    router.push(`edit/${id}`)
}

const paginatedUsers = computed(() => {
    if (!users) return []
    const start = (currentPage.value - 1) * perPage
    return users.value.slice(start, start + perPage)
})

const totalPages = computed(() => {
    return Math.ceil(users.value.length / perPage)
})

function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

async function getBranches() {
    try {
        const res = await $axios.get('branch', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        branches.value = res.data
    } catch (error) {
        // console.error(error)
    }
}

async function getUsers() {
    loading.value = true
    try {
        const response = await $axios.get('admin', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        const sortedUsers = [
            ...response.data.filter((u: User) => u.role === 'superAdmin'),
            ...response.data.filter((u: User) => u.role === 'admin'),
            ...response.data.filter((u: User) => u.role === 'user')
        ]
        allUsers.value = sortedUsers
        users.value = sortedUsers
        searchValue.value = ''
        removeSearchButton.value = false
        selectedBranch.value = ''
    } catch (error) {
        // console.error(error)
    } finally {
        loading.value = false
    }
}

const filterByBranch = () => {
    currentPage.value = 1
    if (!selectedBranch.value) {
        users.value = allUsers.value
    } else {
        users.value = allUsers.value.filter(user => user.branch === selectedBranch.value)
    }
}

const search = async () => {
    try {
        const res = await $axios.get('/user/search', {
            params: { search: searchValue.value },
            headers: { Authorization: `Bearer ${token.value}` }
        })
        // If branch filter is active, apply it to search results
        if (selectedBranch.value) {
            users.value = res.data.filter((user: User) => user.branch === selectedBranch.value)
        } else {
            users.value = res.data
        }
        removeSearchButton.value = true
    } catch (error) {
        // console.error(error)
    }
}

const deleteUser = async (id: number) => {
    if (!confirm("Действительно хотите удалить?")) return
    try {
        await $axios.delete(`user/${id}`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        toast.success('Успешно удалено', { position: 'top-center'  })
        getUsers()
    } catch (error) {
        // console.error(error)
    }
}

const disactive = async (id: number) => {
    try {
        const resActive = await $axios.put(`user/active/${id}`, {}, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        if (resActive.status === 200) {
            toast.success('Статус пользователя изменен', { position: 'top-center'  })
            getUsers()
        }
    } catch (error) {
        // console.error(error)
        toast.error('Ошибка от сервера')
    }
}

const formatData = (time: string) => {
    if (!time) return ''
    return new Date(time).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

onMounted(() => {
    getBranches()
    getUsers()
})
</script>

<template>
    <div class="tw-py-6 animate-fadeIn">
        <!-- Breadcrumb -->
        <div class="tw-flex tw-items-center tw-gap-3 tw-mb-6">
            <router-link to="/superAdmin" class="tw-flex tw-items-center tw-gap-2 tw-text-cyan-400 tw-no-underline hover:tw-text-cyan-300 tw-transition-colors tw-text-sm">
                <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Главная
            </router-link>
            <span class="tw-text-white/30">→</span>
            <span class="tw-text-white/60 tw-text-sm">Пользователи</span>
        </div>

        <!-- Search & Actions -->
        <div class="tw-flex tw-flex-col md:tw-flex-row tw-gap-4 tw-mb-6">
            <div class="tw-flex-1 tw-max-w-xl">
                <div class="tw-flex tw-items-center tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-overflow-hidden focus-within:tw-border-cyan-500 focus-within:tw-shadow-lg focus-within:tw-shadow-cyan-500/10 tw-transition-all">
                    <div class="tw-px-4 tw-text-white/40">
                        <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input @keyup.enter="search" v-model="searchValue" class="tw-flex-1 tw-h-11 tw-bg-transparent tw-border-none tw-outline-none tw-text-white placeholder:tw-text-white/30 tw-text-sm" placeholder="Поиск по имени, коду, телефону..." type="text">
                    <button @click="search" class="tw-h-9 tw-px-4 tw-m-1 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-lg tw-text-white tw-font-semibold tw-text-sm hover:tw-from-cyan-600 hover:tw-to-cyan-700 tw-transition-all">Найти</button>
                    <button v-if="removeSearchButton" @click="getUsers" class="tw-w-9 tw-h-9 tw-m-1 tw-ml-0 tw-bg-red-500/20 tw-rounded-lg tw-text-red-400 tw-flex tw-items-center tw-justify-center hover:tw-bg-red-500/30 tw-transition-all">
                        <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <!-- Branch Filter -->
            <div class="tw-min-w-[200px]">
                <select 
                    v-model="selectedBranch" 
                    @change="filterByBranch"
                    class="tw-w-full tw-h-11 tw-px-4 tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-text-white tw-outline-none focus:tw-border-violet-500 tw-transition-all tw-cursor-pointer tw-text-sm"
                >
                    <option value="" class="tw-bg-[#1e293b]">Все склады</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.branchName" class="tw-bg-[#1e293b]">
                        {{ branch.branchName }}
                    </option>
                </select>
            </div>

            <div class="tw-flex tw-gap-3">
                <router-link to="/superAdmin/trash" class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-red-500/15 tw-border tw-border-red-500/30 tw-rounded-xl tw-text-red-400 tw-font-semibold tw-text-sm tw-no-underline hover:tw-bg-red-500/25 tw-transition-all">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    <span>Корзина</span>
                </router-link>
                <router-link to="/superAdmin/create" class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-font-semibold tw-text-sm tw-no-underline hover:tw-translate-y-[-2px] hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span>Добавить</span>
                </router-link>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tw-text-center tw-py-16">
            <div class="tw-w-12 tw-h-12 tw-border-4 tw-border-cyan-500/20 tw-border-t-cyan-500 tw-rounded-full tw-animate-spin tw-mx-auto"></div>
            <p class="tw-mt-4 tw-text-white/50">Загрузка...</p>
        </div>

        <!-- Content -->
        <div v-else>
            <p class="tw-text-white/50 tw-text-sm tw-mb-4">Показано {{ paginatedUsers.length }} из {{ users.length }}</p>

            <!-- Mobile Cards -->
            <div class="tw-block lg:tw-hidden tw-space-y-3">
                <div v-for="user in paginatedUsers" :key="'mobile-' + user.id" class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-xl tw-p-4 hover:tw-border-white/20 tw-transition-all">
                    <div class="tw-flex tw-justify-between tw-items-start tw-mb-4">
                        <div class="tw-flex tw-items-center tw-gap-3">
                            <div :class="['tw-w-11 tw-h-11 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm', user.role === 'superAdmin' ? 'tw-bg-gradient-to-br tw-from-amber-500 tw-to-orange-500' : user.role === 'admin' ? 'tw-bg-gradient-to-br tw-from-violet-500 tw-to-purple-600' : 'tw-bg-gradient-to-br tw-from-cyan-500 tw-to-cyan-600']">{{ user.name.charAt(0) }}{{ user.surname.charAt(0) }}</div>
                            <div>
                                <p class="tw-font-semibold tw-text-white">{{ user.name }} {{ user.surname }}</p>
                                <p class="tw-text-xs tw-text-white/50">ID: {{ user.id }} • {{ user.role }}</p>
                            </div>
                        </div>
                        <span v-if="user.role === 'user'" :class="['tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold', user.isActive ? 'tw-bg-emerald-500/20 tw-text-emerald-400' : 'tw-bg-red-500/20 tw-text-red-400']">{{ user.isActive ? 'Активен' : 'Неактивен' }}</span>
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
                            <span class="tw-text-[10px] tw-text-white/40 tw-uppercase tw-tracking-wider">Дата</span>
                            <p class="tw-text-white tw-text-sm">{{ formatData(user.createAt) }}</p>
                        </div>
                    </div>

                    <div class="tw-flex tw-gap-2">
                        <button v-if="user.role === 'user'" @click="disactive(user.id)" :class="['tw-flex-1 tw-py-2.5 tw-rounded-lg tw-font-semibold tw-text-sm tw-transition-all', user.isActive ? 'tw-bg-pink-500/20 tw-text-pink-400 hover:tw-bg-pink-500/30' : 'tw-bg-emerald-500/20 tw-text-emerald-400 hover:tw-bg-emerald-500/30']">{{ user.isActive ? 'Деакт.' : 'Акт.' }}</button>
                        <button @click="routeToEdit(user.id)" class="tw-flex-1 tw-py-2.5 tw-bg-cyan-500/20 tw-rounded-lg tw-text-cyan-400 tw-font-semibold tw-text-sm hover:tw-bg-cyan-500/30 tw-transition-all">Изменить</button>
                        <button @click="deleteUser(user.id)" class="tw-px-4 tw-py-2.5 tw-bg-red-500/20 tw-rounded-lg tw-text-red-400 tw-font-semibold tw-text-sm hover:tw-bg-red-500/30 tw-transition-all">Уд.</button>
                    </div>
                </div>

                <div v-if="!paginatedUsers.length" class="tw-text-center tw-py-12 tw-text-white/40">Пользователи не найдены</div>
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
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Состояние</th>
                            <th class="tw-text-center tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in paginatedUsers" :key="'desktop-' + user.id" class="tw-border-t tw-border-white/5 hover:tw-bg-white/[0.02] tw-transition-all">
                            <td class="tw-px-5 tw-py-4 tw-text-white tw-text-sm">{{ user.id }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white tw-text-sm">{{ user.code || '—' }}</td>
                            <td class="tw-px-5 tw-py-4">
                                <span :class="['tw-px-3 tw-py-1 tw-rounded-md tw-text-xs tw-font-semibold', user.role === 'superAdmin' ? 'tw-bg-amber-500/20 tw-text-amber-400' : user.role === 'admin' ? 'tw-bg-violet-500/20 tw-text-violet-400' : 'tw-bg-cyan-500/20 tw-text-cyan-400']">{{ user.role }}</span>
                            </td>
                            <td class="tw-px-5 tw-py-4 tw-text-white tw-text-sm">{{ user.phoneNumber }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white tw-text-sm">{{ user.name }} {{ user.surname }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white tw-text-sm">{{ user.password }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white/70 tw-text-sm">
                                <template v-if="user.role === 'admin'">{{ user.branch || 'Не привязан' }}</template>
                                <template v-else-if="user.role === 'superAdmin'">{{ user.branch }}</template>
                                <template v-else>{{ formatData(user.createAt) }}</template>
                            </td>
                            <td class="tw-px-5 tw-py-4">
                                <div class="tw-flex tw-justify-center tw-gap-1.5 tw-flex-wrap">
                                    <button v-if="user.role === 'user'" @click="disactive(user.id)" :class="['tw-px-2.5 tw-py-1 tw-rounded-md tw-text-xs tw-font-semibold tw-transition-all', user.isActive ? 'tw-bg-pink-500/20 tw-text-pink-400 hover:tw-bg-pink-500/30' : 'tw-bg-emerald-500/20 tw-text-emerald-400 hover:tw-bg-emerald-500/30']">{{ user.isActive ? 'Деакт.' : 'Акт.' }}</button>
                                    <button @click="routeToEdit(user.id)" class="tw-px-2.5 tw-py-1 tw-bg-cyan-500/20 tw-rounded-md tw-text-cyan-400 tw-text-xs tw-font-semibold hover:tw-bg-cyan-500/30 tw-transition-all">изм.</button>
                                    <button @click="deleteUser(user.id)" class="tw-px-2.5 tw-py-1 tw-bg-red-500/20 tw-rounded-md tw-text-red-400 tw-text-xs tw-font-semibold hover:tw-bg-red-500/30 tw-transition-all">уд.</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="!paginatedUsers.length">
                            <td colspan="8" class="tw-text-center tw-py-12 tw-text-white/40">Пользователи не найдены</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-mt-6 tw-flex-wrap">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/70 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed hover:tw-bg-cyan-500/20 hover:tw-border-cyan-500/30 tw-transition-all tw-flex tw-items-center tw-justify-center">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>

                <template v-for="page in totalPages" :key="page">
                    <button v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)" @click="changePage(page)" :class="['tw-min-w-[40px] tw-h-10 tw-rounded-lg tw-font-semibold tw-text-sm tw-transition-all', page === currentPage ? 'tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-text-white' : 'tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/70 hover:tw-bg-white/10']">{{ page }}</button>
                    <span v-else-if="page === currentPage - 2 || page === currentPage + 2" class="tw-px-1 tw-text-white/40">...</span>
                </template>

                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/70 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed hover:tw-bg-cyan-500/20 hover:tw-border-cyan-500/30 tw-transition-all tw-flex tw-items-center tw-justify-center">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>

            <p v-if="totalPages > 1" class="tw-text-center tw-text-white/40 tw-text-sm tw-mt-3">Страница {{ currentPage }} из {{ totalPages }}</p>
        </div>
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
