<script setup lang="ts">
definePageMeta({
    layout: 'default'
})

import { useToast } from '~/composables/useToast'
import { watch } from 'vue'

interface Product {
    id: number
    productId: string
    productName: string | null
    client_registered: string | null
    china_warehouse: string | null
    aicargo: string | null
    given_to_client: string | null
}

interface Profile {
    id: number
    code: string
    isActive: boolean
}

const WHATSAPP_NUMBER = "77083791496"

const { $axios } = useNuxtApp()
const token = useCookie('token')
const toast = useToast()
const router = useRouter()

const profile = ref<Profile | null>(null)
const allProducts = ref<Product[]>([])
const loading = ref(true)
const searchQuery = ref('')
const isSearchMode = ref(false)
const activeTab = ref<'active' | 'archive'>('active')
const archiveProducts = ref<Product[]>([])
const isLoggedIn = computed(() => !!token.value)

const showAddModal = ref(false)
const newTrackCode = ref('')
const newDescription = ref('')
const addLoading = ref(false)

const activeProducts = computed(() => allProducts.value)
const archivedProducts = computed(() => archiveProducts.value)
const products = computed(() => activeTab.value === 'active' ? activeProducts.value : archivedProducts.value)

const whatsappLink = computed(() => {
    if (!profile.value) return '#'
    const message = `Здравствуйте. Прошу вас зарегистрировать меня на сайте Ai-MARKET. Я клиент Ai-CARGO. Мой индивидуальный код: ${profile.value.code}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
})

async function getProfile() {
    try {
        const response = await $axios.get('profile', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        profile.value = response.data
    } catch {
        profile.value = null
    }
}

async function getProducts() {
    if (!token.value) return
    try {
        const response = await $axios.get('products/my', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        allProducts.value = response.data
    } catch {
        allProducts.value = []
    }
}

async function getArchiveProducts() {
    if (!token.value) return
    try {
        const response = await $axios.get('products/archive', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        archiveProducts.value = response.data
    } catch {
        archiveProducts.value = []
    }
}

watch(activeTab, (newTab) => {
    if (newTab === 'archive') {
        getArchiveProducts()
    } else {
        getProducts()
    }
})

async function addTrack() {
    if (!newTrackCode.value.trim() || !newDescription.value.trim()) return

    addLoading.value = true
    try {
        await $axios.post('products',
            { productId: newTrackCode.value.trim(), productName: newDescription.value.trim() },
            { headers: { 'Authorization': `Bearer ${token.value}` } }
        )
        toast.success('Трек добавлен!', { position: 'top-center' })
        newTrackCode.value = ''
        newDescription.value = ''
        showAddModal.value = false
        await getProducts()
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Ошибка', { position: 'top-center' })
    } finally {
        addLoading.value = false
    }
}

async function searchTrack() {
    if (!searchQuery.value.trim()) {
        await getProducts()
        isSearchMode.value = false
        return
    }

    loading.value = true
    try {
        const response = await $axios.get('products/' + searchQuery.value.trim(), {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        allProducts.value = response.data || []
        isSearchMode.value = true
    } catch {
        allProducts.value = []
        isSearchMode.value = true
    } finally {
        loading.value = false
    }
}

async function deleteTrack(e: Event, productId: string) {
    e.stopPropagation()
    const isArchive = activeTab.value === 'archive'
    const message = isArchive ? 'Удалить навсегда: ' : 'Удалить: '
    if (!confirm(message + productId + '?')) return

    try {
        await $axios.delete('products/' + productId, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success(isArchive ? 'Удалено навсегда' : 'Удалено в архив', { position: 'top-center' })
        if (isArchive) {
            await getArchiveProducts()
        } else {
            await getProducts()
        }
    } catch {
        toast.error('Ошибка', { position: 'top-center' })
    }
}

async function restoreTrack(e: Event, productId: string) {
    e.stopPropagation()
    try {
        await $axios.post(`products/${productId}/restore`, {}, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success('Восстановлено!', { position: 'top-center' })
        await getArchiveProducts()
    } catch {
        toast.error('Ошибка при восстановлении', { position: 'top-center' })
    }
}

function getProgress(product: Product) {
    return [product.client_registered, product.china_warehouse, product.aicargo].filter(Boolean).length
}

function formatDate(date: string | null) {
    if (!date) return null
    return new Date(date).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}



function clearSearch() {
    searchQuery.value = ''
    isSearchMode.value = false
    getProducts()
}

function getSteps(product: Product) {
    return [
        { title: 'Регистрация', date: product.client_registered, step: 1, color: '#ef4444' },
        { title: 'Китай', date: product.china_warehouse, step: 2, color: '#eab308' },
        { title: 'AIcargo', date: product.aicargo, step: 3, color: '#22c55e' }
    ]
}

function goToLogin() {
    router.push('/auth/login')
}

function getStatusClass(product: Product) {
    if (activeTab.value === 'archive') return 'archived'
    if (product.aicargo) return 'status-aicargo'
    if (product.china_warehouse) return 'status-china'
    return 'status-registered'
}

const refreshToken = useCookie('refreshToken')

function logout() {
    token.value = null
    refreshToken.value = null
    router.push('/auth/login')
}

onMounted(async () => {
    if (token.value) {
        await getProfile()
        if (profile.value?.isActive) {
            await getProducts()
        }
    }
    loading.value = false
})
</script>

<template>
    <!-- Loading -->
    <div v-if="loading" class="loading-screen">
        <div class="spinner"></div>
    </div>

    <div v-else-if="!isLoggedIn" class="login-required">
        <div class="login-card">
            <div class="login-icon">📦</div>
            <h2>Мои товары</h2>
            <p>Войдите, чтобы просмотреть товары</p>
            <button class="login-btn" @click="goToLogin">Войти</button>
        </div>
    </div>

    <!-- Если isActive = false -->
    <div v-else-if="profile && !profile.isActive" class="activation-page">
        <div class="activation-card">
            <div class="activation-icon">⏳</div>
            <h2>Аккаунт не активирован</h2>
            <p>Ваш аккаунт ожидает активации администратором. Отправьте заявку через WhatsApp для быстрой активации.</p>

            <div class="user-code">
                <span class="code-label">Ваш код:</span>
                <span class="code-value">{{ profile.code }}</span>
            </div>

            <a :href="whatsappLink" target="_blank" class="whatsapp-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Отправить в WhatsApp
            </a>

            <p class="hint-text">После подтверждения администратором ваш аккаунт будет активирован</p>

            <button class="logout-btn" @click="logout">Выйти</button>
        </div>
    </div>

    <div v-else class="products-page">
        <div class="page-header">
            <h1>Мои товары</h1>
            <button @click="showAddModal = true" class="add-btn">+ Добавить</button>
        </div>

        <div class="page-tabs">
            <button class="page-tab" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
                Активные <span class="tab-count">{{ activeProducts.length }}</span>
            </button>
            <button class="page-tab" :class="{ active: activeTab === 'archive' }" @click="activeTab = 'archive'">
                Архив <span class="tab-count">{{ archivedProducts.length }}</span>
            </button>
        </div>

        <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
            <input v-model="searchQuery" @keyup.enter="searchTrack" type="text" placeholder="Поиск по трек-коду..." />
            <button v-if="isSearchMode" @click="clearSearch" class="search-clear">✕</button>
        </div>

        <div v-if="!products.length" class="empty">
            <div class="empty-icon">{{ activeTab === 'active' ? '📦' : '✅' }}</div>
            <h3>{{ activeTab === 'active' ? 'Нет активных товаров' : 'Архив пуст' }}</h3>
            <p>{{ activeTab === 'active' ? 'Добавьте свой первый трек' : 'Полученные товары появятся здесь' }}</p>
            <button v-if="activeTab === 'active'" @click="showAddModal = true" class="btn-primary">+ Добавить
                трек</button>
        </div>

        <div v-else class="products-list">
            <div v-for="product in products" :key="product.id" class="product-card">
                <div class="card-header" :class="getStatusClass(product)">
                    <div class="card-header-info">
                        <span class="card-label">Трек-код</span>
                        <h2 class="card-code">{{ product.productId.toUpperCase() }}</h2>
                    </div>
                    <div class="card-actions">
                        <button v-if="activeTab === 'archive'" @click="restoreTrack($event, product.productId)"
                            class="card-restore" title="Восстановить">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </button>
                        <button @click="deleteTrack($event, product.productId)" class="card-delete"
                            :title="activeTab === 'archive' ? 'Удалить навсегда' : 'Удалить в архив'">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path
                                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="card-progress" :class="getStatusClass(product)">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: (getProgress(product) / 3 * 100) + '%' }"></div>
                    </div>
                </div>
                <div class="card-desc">
                    <span class="desc-label">Описание</span>
                    <p class="desc-text">{{ product.productName || 'Не указано' }}</p>
                </div>
                <div class="card-timeline">
                    <div v-for="step in getSteps(product)" :key="step.step" class="timeline-row">
                        <div class="timeline-dot" :class="{ active: step.date }"
                            :style="step.date ? { background: step.color } : {}">
                            <svg v-if="step.date" width="12" height="12" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="3">
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                            <span v-else>{{ step.step }}</span>
                        </div>
                        <span class="timeline-title" :class="{ active: step.date }">{{ step.title }}</span>
                        <span class="timeline-date" :style="step.date ? { color: step.color } : {}">
                            {{ step.date ? formatDate(step.date) : '—' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
                <div class="modal">
                    <div class="modal-header">
                        <button @click="showAddModal = false" class="modal-cancel">Отмена</button>
                        <h3>Новый трек</h3>
                        <button @click="addTrack"
                            :disabled="addLoading || !newTrackCode.trim() || !newDescription.trim()"
                            class="modal-submit">{{ addLoading ? '...' : 'Добавить' }}</button>
                    </div>
                    <div class="modal-body">
                        <input v-model="newTrackCode" type="text" placeholder="Трек-код" class="modal-input" />
                        <textarea v-model="newDescription" placeholder="Описание товара..." rows="4"
                            class="modal-textarea"></textarea>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.loading-screen {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #333;
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.login-required {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-card {
    text-align: center;
    padding: 40px 24px;
    border: 1px solid #333;
    border-radius: 20px;
    max-width: 320px;
}

.login-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.login-card h2 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
}

.login-card p {
    font-size: 15px;
    color: #777;
    margin: 0 0 24px;
}

.login-btn {
    width: 100%;
    padding: 14px 24px;
    background: #fff;
    color: #000;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.login-btn:hover {
    background: #eee;
}

/* Activation Page */
.activation-page {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.activation-card {
    text-align: center;
    padding: 40px 24px;
    border: 1px solid #333;
    border-radius: 24px;
    max-width: 380px;
    width: 100%;
}

.activation-icon {
    font-size: 64px;
    margin-bottom: 20px;
}

.activation-card h2 {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px;
}

.activation-card>p {
    font-size: 15px;
    color: #888;
    line-height: 1.6;
    margin: 0 0 24px;
}

.user-code {
    background: #111;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.code-label {
    font-size: 14px;
    color: #666;
}

.code-value {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 1px;
}

.whatsapp-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px;
    background: #25D366;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
}

.whatsapp-btn:hover {
    background: #20BD5A;
}

.whatsapp-btn svg {
    width: 22px;
    height: 22px;
}

.hint-text {
    font-size: 13px;
    color: #555;
    margin: 16px 0 24px;
    line-height: 1.5;
}

.logout-btn {
    width: 100%;
    padding: 14px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 12px;
    color: #888;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.logout-btn:hover {
    background: #111;
    color: #fff;
}

.products-page {
    padding: 16px 0;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.page-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.add-btn {
    padding: 10px 20px;
    background: #fff;
    border: none;
    border-radius: 20px;
    color: #000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.add-btn:hover {
    background: #e5e5e5;
}

.page-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #222;
}

.page-tab {
    flex: 1;
    padding: 14px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #666;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: -1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.page-tab.active {
    color: #fff;
    border-bottom-color: #fff;
}

.tab-count {
    background: #333;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 13px;
}

.page-tab.active .tab-count {
    background: #fff;
    color: #000;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    background: #111;
    border: 1px solid #333;
    border-radius: 12px;
    margin-bottom: 20px;
}

.search-icon {
    color: #555;
    flex-shrink: 0;
}

.search-box input {
    flex: 1;
    height: 44px;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 15px;
}

.search-box input::placeholder {
    color: #555;
}

.search-clear {
    background: transparent;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 8px;
}

.empty {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty h3 {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
}

.empty p {
    color: #777;
    margin: 0 0 20px;
}

.btn-primary {
    padding: 12px 24px;
    background: #fff;
    border: none;
    border-radius: 20px;
    color: #000;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.products-list {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.product-card {
    background: #000;
    border-radius: 20px;
    overflow: hidden;
}

.card-header {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-header.archived {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.card-header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.card-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.card-code {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    margin: 0;
    letter-spacing: 1px;
}

.card-actions {
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.card-restore,
.card-delete {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
}

.card-restore:hover {
    background: rgba(255, 255, 255, 0.4);
}

.card-delete:hover {
    background: rgba(244, 63, 94, 0.4);
}

.card-progress {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    padding: 0 20px 16px;
}

.card-progress.archived {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.progress-bar {
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #fff;
    border-radius: 3px;
}

.card-header.status-registered,
.card-progress.status-registered {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card-header.status-china,
.card-progress.status-china {
    background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
}

.card-header.status-aicargo,
.card-progress.status-aicargo {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.card-desc {
    background: #1a1a1a;
    padding: 14px 20px;
}

.desc-label {
    font-size: 12px;
    color: #666;
    display: block;
    margin-bottom: 2px;
}

.desc-text {
    font-size: 15px;
    color: #fff;
    margin: 0;
}

.card-timeline {
    background: #000;
    padding: 8px 0;
}

.timeline-row {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    gap: 12px;
}

.timeline-dot {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    flex-shrink: 0;
}

.timeline-dot.active {
    color: #fff;
}

.timeline-title {
    flex: 1;
    font-size: 15px;
    color: #555;
    font-weight: 500;
}

.timeline-title.active {
    color: #fff;
}

.timeline-date {
    font-size: 13px;
    color: #444;
    font-weight: 500;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
}

.modal {
    width: 100%;
    max-width: 600px;
    background: #000;
    min-height: 100vh;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
    border-bottom: 1px solid #222;
}

.modal-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.modal-cancel {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 15px;
    cursor: pointer;
    padding: 8px;
}

.modal-submit {
    padding: 8px 16px;
    background: #fff;
    border: none;
    border-radius: 20px;
    color: #000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.modal-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.modal-input,
.modal-textarea {
    width: 100%;
    padding: 16px;
    background: #111;
    border: 1px solid #333;
    border-radius: 12px;
    color: #fff;
    font-size: 16px;
    outline: none;
    box-sizing: border-box;
}

.modal-input::placeholder,
.modal-textarea::placeholder {
    color: #555;
}

.modal-textarea {
    resize: none;
    font-family: inherit;
}
</style>
