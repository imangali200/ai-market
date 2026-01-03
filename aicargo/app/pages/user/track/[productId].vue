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

const route = useRoute()
const router = useRouter()
const productId = route.params.productId
const { $axios } = useNuxtApp()
const token = useCookie('token')
const toast = useToast()

const product = ref<Product | null>(null)
const loading = ref(false)

async function getProduct() {
    loading.value = true
    try {
        const response = await $axios.get(`products/track/${productId}`, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        product.value = response.data
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Ошибка', { position: 'top-center' })
    } finally {
        loading.value = false
    }
}

async function deleteTrack() {
    if (!confirm('Удалить этот трек?')) return
    try {
        await $axios.delete(`products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success('Удалено', { position: 'top-center' })
        router.push('/user/products')
    } catch {
        toast.error('Ошибка', { position: 'top-center' })
    }
}

function formatDate(date: string | null) {
    if (!date) return null
    return new Date(date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function goBack() {
    router.push('/user/products')
}

const steps = computed(() => {
    if (!product.value) return []
    return [
        { title: 'Регистрация', date: product.value.client_registered, step: 1, color: '#ef4444' },
        { title: 'Китай', date: product.value.china_warehouse, step: 2, color: '#eab308' },
        { title: 'AIcargo', date: product.value.aicargo, step: 3, color: '#22c55e' }
    ]
})

const currentStep = computed(() => {
    if (!product.value) return 0
    if (product.value.aicargo) return 3
    if (product.value.china_warehouse) return 2
    if (product.value.client_registered) return 1
    return 0
})

onMounted(() => getProduct())
</script>

<template>
    <div class="track-page">
        <!-- Loading -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
        </div>

        <!-- Content -->
        <div v-else-if="product" class="track-content">
            
            <!-- Green Header Card -->
            <div class="header-card">
                <div class="header-top">
                    <div class="header-info">
                        <span class="header-label">Трек-код</span>
                        <h1 class="header-code">{{ product.productId.toUpperCase() }}</h1>
                    </div>
                    <button @click="deleteTrack" class="delete-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
                    </button>
                </div>
                <div class="header-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: (currentStep / 3 * 100) + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- Description Card -->
            <div class="desc-card">
                <span class="desc-label">Описание</span>
                <p class="desc-text">{{ product.description || 'Не указано' }}</p>
            </div>

            <!-- Timeline -->
            <div class="timeline">
                <div v-for="step in steps" :key="step.step" class="timeline-item">
                    <div class="timeline-dot" :class="{ active: step.date }" :style="step.date ? { background: step.color } : {}">
                        <svg v-if="step.date" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
                        <span v-else>{{ step.step }}</span>
                    </div>
                    <span class="timeline-title" :class="{ active: step.date }">{{ step.title }}</span>
                    <span class="timeline-date" :class="{ active: step.date }" :style="step.date ? { color: step.color } : {}">
                        {{ step.date ? formatDate(step.date) : '—' }}
                    </span>
                </div>
            </div>

        </div>

        <!-- Not Found -->
        <div v-else class="empty">
            <div class="empty-icon">📦</div>
            <h3>Трек не найден</h3>
            <button @click="goBack" class="btn">← Назад</button>
        </div>
    </div>
</template>

<style scoped>
.track-page { padding: 16px 0; }

.loading { display: flex; justify-content: center; padding: 60px 0; }
.spinner { width: 24px; height: 24px; border: 2px solid #333; border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.track-content { display: flex; flex-direction: column; gap: 12px; }

.header-card { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px; padding: 20px; }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.header-info { display: flex; flex-direction: column; gap: 4px; }
.header-label { font-size: 14px; color: rgba(255,255,255,0.8); }
.header-code { font-size: 28px; font-weight: 800; color: #fff; margin: 0; letter-spacing: 1px; }
.delete-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: background 0.2s; }
.delete-btn:hover { background: rgba(255,255,255,0.3); }
.header-progress { margin-top: 8px; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #fff; border-radius: 3px; transition: width 0.5s; }

.desc-card { background: #1a1a1a; border-radius: 16px; padding: 16px 20px; }
.desc-label { font-size: 13px; color: #666; display: block; margin-bottom: 4px; }
.desc-text { font-size: 16px; color: #fff; margin: 0; }

.timeline { background: #000; border-radius: 16px; padding: 8px 0; }
.timeline-item { display: flex; align-items: center; padding: 14px 20px; gap: 14px; }
.timeline-dot { width: 32px; height: 32px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #666; flex-shrink: 0; }
.timeline-dot.active { color: #fff; }
.timeline-title { flex: 1; font-size: 16px; color: #555; font-weight: 500; }
.timeline-title.active { color: #fff; }
.timeline-date { font-size: 14px; color: #444; font-weight: 500; }
.timeline-date.active { font-weight: 600; }

.empty { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty h3 { font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 20px; }
.btn { padding: 12px 24px; background: #fff; border: none; border-radius: 20px; color: #000; font-size: 15px; font-weight: 600; cursor: pointer; }
</style>
