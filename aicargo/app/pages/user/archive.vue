<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth', 'user-active']
})

import { useToast } from '~/composables/useToast'

interface Product {
    id: number
    productId: string
    description: string | null
    client_registered: string | null
    china_warehouse: string | null
    aicargo: string | null
    given_to_client: string | null
}

const { $axios } = useNuxtApp()
const token = useCookie('token')
const toast = useToast()
const router = useRouter()

const products = ref<Product[]>([])
const loading = ref(false)
const currentPage = ref(1)
const perPage = 10

const paginatedProducts = computed(() => {
    if (!products.value.length) return []
    const start = (currentPage.value - 1) * perPage
    return products.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(products.value.length / perPage))

async function getArchiveProducts() {
    loading.value = true
    try {
        const response = await $axios.get('products/archive', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        products.value = response.data
    } catch (error: any) {
        console.error(error)
        if (error.response?.status !== 404) {
            toast.error('Ошибка при загрузке архива', { position: 'top-center'  })
        }
        products.value = []
    } finally {
        loading.value = false
    }
}

async function restoreProduct(productId: string) {
    if (!confirm(`Восстановить трек ${productId}?`)) return
    try {
        await $axios.post(`products/${productId}/restore`, {}, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success('Трек восстановлен', { position: 'top-center'  })
        await getArchiveProducts()
    } catch (error: any) {
        console.error(error)
        toast.error('Ошибка при восстановлении', { position: 'top-center'  })
    }
}

function formatDate(date: string | null) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function goBack() {
    router.push('/user')
}

onMounted(() => {
    getArchiveProducts()
})
</script>

<template>
    <div class="tw-py-6 animate-fadeIn">
        <!-- Header -->
        <div class="tw-flex tw-items-center tw-gap-4 tw-mb-6">
            <button @click="goBack" class="tw-w-11 tw-h-11 tw-bg-white/5 tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-white/70 hover:tw-bg-white/10 hover:tw-text-white tw-transition-all">
                <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h1 class="tw-flex-1 tw-text-2xl tw-font-bold tw-text-white">🗄️ Архив</h1>
            <span class="tw-px-4 tw-py-2 tw-bg-violet-500/20 tw-border tw-border-violet-500/30 tw-rounded-full tw-text-violet-400 tw-text-sm tw-font-semibold">{{ products.length }} треков</span>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tw-text-center tw-py-12">
            <div class="tw-w-12 tw-h-12 tw-border-4 tw-border-violet-500/20 tw-border-t-violet-500 tw-rounded-full tw-animate-spin tw-mx-auto"></div>
            <p class="tw-mt-4 tw-text-white/60">Загрузка...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!products.length" class="tw-text-center tw-py-16 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl">
            <div class="tw-text-5xl tw-mb-4">🗑️</div>
            <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-2">Архив пуст</h3>
            <p class="tw-text-white/60 tw-mb-4">Удалённые треки появятся здесь</p>
            <router-link to="/user" class="tw-inline-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-cyan-500 tw-to-cyan-600 tw-text-white tw-px-6 tw-py-3 tw-rounded-xl tw-font-semibold hover:tw-from-cyan-600 hover:tw-to-cyan-700 tw-transition-all">
                <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                На главную
            </router-link>
        </div>

        <!-- Products List -->
        <div v-else>
            <!-- Mobile Cards -->
            <div class="tw-block lg:tw-hidden tw-space-y-3">
                <div v-for="product in paginatedProducts" :key="product.id" class="tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-xl tw-p-4 hover:tw-border-violet-500/30 tw-transition-all">
                    <div class="tw-flex tw-items-start tw-justify-between tw-mb-3">
                        <div>
                            <p class="tw-text-xs tw-text-white/60">Трек-код</p>
                            <p class="tw-font-mono tw-font-bold tw-text-white">{{ product.productId.toUpperCase() }}</p>
                        </div>
                        <span class="tw-px-3 tw-py-1 tw-bg-white/10 tw-rounded-full tw-text-xs tw-text-white/60">В архиве</span>
                    </div>
                    <p v-if="product.description" class="tw-text-sm tw-text-white/70 tw-mb-3 tw-line-clamp-2">{{ product.description }}</p>
                    <div class="tw-flex tw-items-center tw-justify-between tw-pt-3 tw-border-t tw-border-white/10">
                        <span class="tw-text-sm tw-text-white/60">{{ formatDate(product.client_registered) }}</span>
                        <button @click="restoreProduct(product.productId)" class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-emerald-500/20 tw-rounded-lg tw-text-emerald-400 tw-text-sm tw-font-semibold hover:tw-bg-emerald-500/30 tw-transition-all">
                            <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Восстановить
                        </button>
                    </div>
                </div>
            </div>

            <!-- Desktop Table -->
            <div class="tw-hidden lg:tw-block tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-overflow-hidden">
                <table class="tw-w-full">
                    <thead>
                        <tr class="tw-bg-white/5">
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Трек-код</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Описание</th>
                            <th class="tw-text-left tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Дата создания</th>
                            <th class="tw-text-center tw-px-5 tw-py-4 tw-text-white/70 tw-font-semibold tw-text-sm">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in paginatedProducts" :key="product.id" class="tw-border-t tw-border-white/5 hover:tw-bg-white/[0.02] tw-transition-all">
                            <td class="tw-px-5 tw-py-4"><span class="tw-font-mono tw-font-semibold tw-text-white">{{ product.productId.toUpperCase() }}</span></td>
                            <td class="tw-px-5 tw-py-4 tw-text-white/70 tw-max-w-[200px] tw-truncate">{{ product.description || '—' }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-white/60">{{ formatDate(product.client_registered) }}</td>
                            <td class="tw-px-5 tw-py-4 tw-text-center">
                                <button @click="restoreProduct(product.productId)" class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-emerald-500/20 tw-rounded-lg tw-text-emerald-400 tw-text-sm tw-font-semibold hover:tw-bg-emerald-500/30 tw-transition-all">
                                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    Восстановить
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="tw-flex tw-justify-center tw-items-center tw-gap-3 tw-mt-5">
                <button @click="currentPage--" :disabled="currentPage === 1" class="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/70 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed hover:tw-bg-violet-500/20 hover:tw-border-violet-500/30 hover:tw-text-violet-400 tw-transition-all tw-flex tw-items-center tw-justify-center">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div class="tw-px-4 tw-py-2 tw-bg-gradient-to-r tw-from-violet-500 tw-to-violet-600 tw-rounded-lg tw-text-white tw-font-semibold tw-text-sm">{{ currentPage }} / {{ totalPages }}</div>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-white/5 tw-border tw-border-white/10 tw-text-white/70 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed hover:tw-bg-violet-500/20 hover:tw-border-violet-500/30 hover:tw-text-violet-400 tw-transition-all tw-flex tw-items-center tw-justify-center">
                    <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>
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
