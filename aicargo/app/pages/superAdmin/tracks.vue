<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

import { useToast } from '~/composables/useToast'
const { $axios } = useNuxtApp()
const token = useCookie('token')
const router = useRouter()
const toast = useToast()

export interface Products {
    id: number
    productId: string
    productName: string
    client_registered: string 
    china_warehouse: string | null
    aicargo: string | null
    given_to_client: string | null
    deletedAt: null | string
}

const products = ref<Products[]>([])
const currentPage = ref(1)
const perPage = 20
const loading = ref(false)
const searchValue = ref('')
const removeSearchButton = ref(false)

// Computed
const paginatedProducts = computed(() => {
    if (!products.value.length) return []
    const start = (currentPage.value - 1) * perPage
    return products.value.slice(start, start + perPage)
})

const totalPages = computed(() => {
    return Math.ceil(products.value.length / perPage)
})

// Methods
function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

async function getProducts() {
    loading.value = true
    try {
        const response = await $axios.get('products', {
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        })
        products.value = response.data
        searchValue.value = ''
        removeSearchButton.value = false
        currentPage.value = 1
    } catch (error) {
        console.error(error)
        toast.error('Ошибка при загрузке товаров', { position: 'top-center' })
    } finally {
        loading.value = false
    }
}

const search = async () => {
    if (!searchValue.value.trim()) {
        toast.warning('Введите трек-код', { position: 'top-center' })
        return
    }
    
    loading.value = true
    try {
        const res = await $axios.get('products/productId', {
            params: { productId: searchValue.value },
            headers: { Authorization: `Bearer ${token.value}` }
        })
        products.value = Array.isArray(res.data) ? res.data : [res.data]
        removeSearchButton.value = true
        currentPage.value = 1
    } catch (error: any) {
        console.error(error)
        if (error.response?.status === 404) {
            products.value = []
            toast.warning('Товар не найден', { position: 'top-center' })
        } else {
            toast.error('Ошибка при поиске', { position: 'top-center' })
        }
        removeSearchButton.value = true
    } finally {
        loading.value = false
    }
}

const toHistory = (productId: string) => {
    router.push(`/superAdmin/track/${productId}`)
}

const getProductStatus = (product: Products) => {
    if (product.given_to_client) return { text: 'Выдан клиенту', date: product.given_to_client, class: 'tw-text-emerald-400' }
    if (product.aicargo) return { text: 'На складе AiCargo', date: product.aicargo, class: 'tw-text-cyan-400' }
    if (product.china_warehouse) return { text: 'Склад в Китае', date: product.china_warehouse, class: 'tw-text-amber-400' }
    return { text: 'Зарегистрирован', date: product.client_registered, class: 'tw-text-white/60' }
}

const formatDate = (time: string) => {
    if (!time) return '—'
    const date = new Date(time)
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    getProducts()
})
</script>

<template>
    <div class="tw-py-6 animate-fadeIn">
        <!-- Header -->
        <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-mb-4">
                <router-link class="tw-text-cyan-400 hover:tw-text-cyan-300 tw-transition-colors" to="/superAdmin">Главная</router-link>
                <span class="tw-text-white/60">→</span>
                <span class="tw-text-white/60">Товары</span>
            </div>
            <h1 class="tw-text-2xl tw-font-bold tw-text-white tw-mb-2">Все товары</h1>
            <p class="tw-text-white/60">Управление треками и посылками</p>
        </div>

        <!-- Search -->
        <div class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-p-4 tw-mb-6">
            <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
                <input 
                    @keyup.enter="search" 
                    v-model="searchValue"
                    class="tw-flex-1 sm:tw-max-w-xs tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-px-4 tw-py-2.5 tw-text-white tw-outline-none focus:tw-border-cyan-500/50 tw-transition-colors placeholder:tw-text-white/40"
                    placeholder="Поиск по трек-коду" 
                    type="text"
                >
                <div class="tw-flex tw-gap-2">
                    <button 
                        @click="search"
                        :disabled="loading"
                        class="tw-px-5 tw-py-2.5 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-font-medium hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all disabled:tw-opacity-50"
                    >
                        Найти
                    </button>
                    <button 
                        @click="getProducts" 
                        v-if="removeSearchButton"
                        class="tw-px-4 tw-py-2.5 tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-rounded-xl tw-text-red-400 hover:tw-bg-red-500/30 tw-transition-all"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tw-text-center tw-py-16">
            <div class="tw-w-12 tw-h-12 tw-border-4 tw-border-cyan-500/20 tw-border-t-cyan-500 tw-rounded-full tw-animate-spin tw-mx-auto"></div>
            <p class="tw-mt-4 tw-text-white/60">Жүктелуде...</p>
        </div>

        <!-- Content -->
        <div v-else>
            <!-- Stats -->
            <div class="tw-mb-4 tw-text-white/60 tw-text-sm">
                Көрсетілуде {{ paginatedProducts.length }} / {{ products.length }}
            </div>

            <!-- Table Card -->
            <div class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-overflow-hidden">
                <!-- Table Header -->
                <div class="tw-hidden sm:tw-grid tw-grid-cols-12 tw-gap-4 tw-px-5 tw-py-3 tw-bg-white/[0.02] tw-border-b tw-border-white/10">
                    <span class="tw-col-span-1 tw-text-white/60 tw-text-sm tw-font-medium">#ID</span>
                    <span class="tw-col-span-3 tw-text-white/60 tw-text-sm tw-font-medium">Трек-код</span>
                    <span class="tw-col-span-3 tw-text-white/60 tw-text-sm tw-font-medium">Состояние</span>
                    <span class="tw-col-span-3 tw-text-white/60 tw-text-sm tw-font-medium">Дата создания</span>
                    <span class="tw-col-span-2 tw-text-white/60 tw-text-sm tw-font-medium">Действия</span>
                </div>

                <!-- Table Body -->
                <div class="tw-divide-y tw-divide-white/5">
                    <div 
                        v-for="product in paginatedProducts" 
                        :key="product.id" 
                        class="tw-px-5 tw-py-4 hover:tw-bg-white/[0.02] tw-transition-colors"
                    >
                        <!-- Desktop View -->
                        <div class="tw-hidden sm:tw-grid tw-grid-cols-12 tw-gap-4 tw-items-center">
                            <div class="tw-col-span-1">
                                <span class="tw-text-white/60 tw-text-sm">{{ product.id }}</span>
                            </div>
                            <div class="tw-col-span-3">
                                <span class="tw-text-white tw-font-mono tw-font-medium">{{ product.productId }}</span>
                            </div>
                            <div class="tw-col-span-3">
                                <span :class="getProductStatus(product).class" class="tw-font-medium">
                                    {{ getProductStatus(product).text }}
                                </span>
                                <span class="tw-text-white/40 tw-text-xs tw-block">
                                    {{ formatDate(getProductStatus(product).date) }}
                                </span>
                            </div>
                            <div class="tw-col-span-3">
                                <span class="tw-text-white/60 tw-text-sm">{{ formatDate(product.client_registered) }}</span>
                            </div>
                            <div class="tw-col-span-2">
                                <button 
                                    @click="toHistory(product.productId)"
                                    class="tw-px-4 tw-py-2 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-text-sm tw-font-medium hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all"
                                >
                                    История
                                </button>
                            </div>
                        </div>

                        <!-- Mobile View -->
                        <div class="tw-block sm:tw-hidden">
                            <div class="tw-flex tw-justify-between tw-items-start tw-mb-3">
                                <div>
                                    <p class="tw-text-white tw-font-mono tw-font-semibold">{{ product.productId }}</p>
                                    <p class="tw-text-xs tw-text-white/40">ID: {{ product.id }}</p>
                                </div>
                                <span :class="getProductStatus(product).class" class="tw-text-xs tw-font-medium">
                                    {{ getProductStatus(product).text }}
                                </span>
                            </div>
                            <div class="tw-grid tw-grid-cols-2 tw-gap-2 tw-text-sm tw-mb-3">
                                <div>
                                    <p class="tw-text-white/40 tw-text-xs">Создан</p>
                                    <p class="tw-text-white/70 tw-text-xs">{{ formatDate(product.client_registered) }}</p>
                                </div>
                                <div>
                                    <p class="tw-text-white/40 tw-text-xs">Обновлён</p>
                                    <p class="tw-text-white/70 tw-text-xs">{{ formatDate(getProductStatus(product).date) }}</p>
                                </div>
                            </div>
                            <button 
                                @click="toHistory(product.productId)"
                                class="tw-w-full tw-py-2.5 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-rounded-xl tw-text-white tw-text-sm tw-font-medium hover:tw-shadow-lg hover:tw-shadow-cyan-500/30 tw-transition-all"
                            >
                                История
                            </button>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="!paginatedProducts.length" class="tw-px-5 tw-py-16 tw-text-center">
                        <div class="tw-w-16 tw-h-16 tw-rounded-2xl tw-bg-white/5 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                            <svg class="tw-w-8 tw-h-8 tw-text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                        </div>
                        <p class="tw-text-white/60">Товары не найдены</p>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-mt-6 tw-flex-wrap">
                <button 
                    @click="changePage(currentPage - 1)" 
                    :disabled="currentPage === 1"
                    class="tw-px-4 tw-py-2 tw-rounded-xl tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/60 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed hover:tw-bg-white/10 tw-transition-all"
                >
                    ←
                </button>

                <template v-for="page in totalPages" :key="page">
                    <button 
                        v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                        @click="changePage(page)"
                        :class="page === currentPage ? 'tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-text-white tw-shadow-lg tw-shadow-cyan-500/30' : 'tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/60 hover:tw-bg-white/10'"
                        class="tw-px-4 tw-py-2 tw-rounded-xl tw-min-w-[44px] tw-transition-all"
                    >
                        {{ page }}
                    </button>
                    <span 
                        v-else-if="page === currentPage - 2 || page === currentPage + 2" 
                        class="tw-px-2 tw-text-white/40"
                    >...</span>
                </template>

                <button 
                    @click="changePage(currentPage + 1)" 
                    :disabled="currentPage === totalPages"
                    class="tw-px-4 tw-py-2 tw-rounded-xl tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/60 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed hover:tw-bg-white/10 tw-transition-all"
                >
                    →
                </button>
            </div>

            <p v-if="totalPages > 1" class="tw-text-center tw-text-white/40 tw-text-sm tw-mt-3">
                Страница {{ currentPage }} из {{ totalPages }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
