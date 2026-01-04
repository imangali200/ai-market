<script setup lang="ts">
definePageMeta({
    layout: 'default'
})

import { useToast } from '~/composables/useToast'

interface Post {
    id: number
    link: string
    review: string
    imgUrl: string | null
    likesCount: number
    createAt: string
}

interface Profile {
    id: number
    phoneNumber: string
    name: string
    surname: string
    code: string
    branch: string
    isActive: boolean
    role: string
    createAt: string
    posts: Post[]
    postLikes: Post[]
    saved: Post[]
}

const WHATSAPP_NUMBER = "77083791496" // Замените на реальный номер

const { $axios } = useNuxtApp()
const token = useCookie('token')
const toast = useToast()
const router = useRouter()

const profile = ref<Profile | null>(null)
const loading = ref(false)
const activeTab = ref<'posts' | 'likes' | 'saved'>('posts')
const isLoggedIn = computed(() => !!token.value)

const whatsappLink = computed(() => {
    if (!profile.value) return '#'
    const message = `Здравствуйте. Прошу вас зарегистрировать меня на сайте Ai-MARKET. Я клиент Ai-CARGO. Мой индивидуальный код: ${profile.value.code}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
})

async function getProfile() {
    loading.value = true
    try {
        const response = await $axios.get('profile', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        profile.value = response.data
    } catch {
        profile.value = null
    } finally {
        loading.value = false
    }
}

const refreshToken = useCookie('refreshToken')

async function logout() {
    token.value = null
    refreshToken.value = null
    router.push('/auth/login')
}

function formatDate(date: string) {
    const now = new Date()
    const postDate = new Date(date)
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000)
    
    if (diff < 60) return 'сейчас'
    if (diff < 3600) return Math.floor(diff / 60) + ' мин'
    if (diff < 86400) return Math.floor(diff / 3600) + ' ч'
    if (diff < 604800) return Math.floor(diff / 86400) + ' дн'
    return postDate.toLocaleDateString('ru-RU')
}

function goToLogin() {
    router.push('/auth/login')
}

async function deletePost(postId: number) {
    if (!confirm('Удалить этот пост?')) return
    
    try {
        await $axios.delete(`post/${postId}`, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success('Пост удален', { position: 'top-center' })
        // Remove post from local state
        if (profile.value) {
            profile.value.posts = profile.value.posts.filter(p => p.id !== postId)
        }
    } catch (error: any) {
        console.error('Delete error:', error)
        toast.error(error.response?.data?.message || 'Ошибка при удалении', { position: 'top-center' })
    }
}

// Like алып тастау
async function unlikePost(postId: number) {
    try {
        await $axios.get('post/likes/' + postId, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success('Лайк алынды', { position: 'top-center' })
        // Remove from local state
        if (profile.value) {
            profile.value.postLikes = profile.value.postLikes.filter(p => p.id !== postId)
        }
    } catch (error: any) {
        console.error('Unlike error:', error)
        toast.error('Қате болды', { position: 'top-center' })
    }
}

// Saved алып тастау
async function unsavePost(postId: number) {
    try {
        await $axios.post('post/save/' + postId, {}, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success('Сақталғаннан алынды', { position: 'top-center' })
        // Remove from local state
        if (profile.value) {
            profile.value.saved = profile.value.saved.filter(p => p.id !== postId)
        }
    } catch (error: any) {
        console.error('Unsave error:', error)
        toast.error('Қате болды', { position: 'top-center' })
    }
}

onMounted(() => {
    if (token.value) {
        getProfile()
    }
})
</script>

<template>
    <div v-if="!isLoggedIn" class="login-required">
        <div class="login-card">
            <div class="login-icon">👤</div>
            <h2>Профиль</h2>
            <p>Войдите, чтобы просмотреть профиль</p>
            <button class="login-btn" @click="goToLogin">Войти</button>
        </div>
    </div>

    <div v-else-if="loading" class="loading-screen">
        <div class="spinner"></div>
    </div>

    <!-- Если isActive = false, показываем блок активации -->
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Отправить в WhatsApp
            </a>

            <p class="hint-text">После подтверждения администратором ваш аккаунт будет активирован</p>

            <button class="logout-btn" @click="logout">Выйти</button>
        </div>
    </div>

    <div v-else-if="profile" class="profile-page">
        <div class="profile-header">
            <div class="profile-info">
                <h1 class="profile-name">{{ profile.name }} {{ profile.surname }}</h1>
                <p class="profile-username">@{{ profile.code }}</p>
            </div>
            <div class="profile-avatar">{{ profile.name.charAt(0).toUpperCase() }}</div>
        </div>

        <div class="profile-stats">
            <span class="stat">{{ profile.posts?.length || 0 }} постов</span>
        </div>

        <div class="profile-actions">
            <button class="action-btn logout" @click="logout">Выйти</button>
            <a :href="'tel:' + profile.phoneNumber" class="action-btn phone">📞 {{ profile.phoneNumber }}</a>
        </div>

        <div class="profile-tabs">
            <button :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">Посты</button>
            <button :class="{ active: activeTab === 'likes' }" @click="activeTab = 'likes'">Лайки</button>
            <button :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">Сохраненное</button>
        </div>

        <div v-if="activeTab === 'posts'" class="tab-content">
            <div v-if="!profile.posts?.length" class="empty-tab">
                <p>Нет постов</p>
            </div>
            <div v-else class="posts-list">
                <div v-for="post in profile.posts" :key="post.id" class="post-card">
                    <button class="delete-btn" @click="deletePost(post.id)" title="Удалить">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <div class="post-header-info">
                        <div class="post-avatar">{{ profile.name?.charAt(0).toUpperCase() || 'U' }}</div>
                        <div class="post-meta-info">
                            <span class="post-author">{{ profile.name }}</span>
                            <span class="post-time">{{ formatDate(post.createAt) }}</span>
                        </div>
                    </div>
                    <div v-if="post.imgUrl" class="post-image-wrapper">
                        <img :src="post.imgUrl" :alt="post.review" class="post-image" loading="lazy">
                    </div>
                    <p class="post-text">{{ post.review }}</p>
                    <a v-if="post.link" :href="post.link.startsWith('http') ? post.link : 'https://' + post.link" target="_blank" class="post-link">🔗 {{ post.link }}</a>
                    <div class="post-actions">
                        <span class="post-action">♡ {{ post.likesCount }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'likes'" class="tab-content">
            <div v-if="!profile.postLikes?.length" class="empty-tab">
                <p>Нет понравившихся постов</p>
            </div>
            <div v-else class="posts-list">
                <div v-for="post in profile.postLikes" :key="post.id" class="post-card">
                    <button class="unlike-btn" @click="unlikePost(post.id)" title="Лайк алып тастау">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff3040" stroke="#ff3040" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <div class="post-header-info">
                        <div class="post-avatar">{{ profile.name?.charAt(0).toUpperCase() || 'U' }}</div>
                        <div class="post-meta-info">
                            <span class="post-author">{{ profile.name }}</span>
                            <span class="post-time">{{ formatDate(post.createAt) }}</span>
                        </div>
                    </div>
                    <div v-if="post.imgUrl" class="post-image-wrapper">
                        <img :src="post.imgUrl" :alt="post.review" class="post-image" loading="lazy">
                    </div>
                    <p class="post-text">{{ post.review }}</p>
                    <a v-if="post.link" :href="post.link.startsWith('http') ? post.link : 'https://' + post.link" target="_blank" class="post-link">🔗 {{ post.link }}</a>
                    <div class="post-actions">
                        <span class="post-action">♡ {{ post.likesCount }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'saved'" class="tab-content">
            <div v-if="!profile.saved?.length" class="empty-tab">
                <p>Нет сохраненных постов</p>
            </div>
            <div v-else class="posts-list">
                <div v-for="post in profile.saved" :key="post.id" class="post-card saved-post">
                    <button class="unsave-btn" @click="unsavePost(post.id)" title="Сақталғаннан алып тастау">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                    <div v-if="post.imgUrl" class="post-image-wrapper">
                        <img :src="post.imgUrl" :alt="post.review" class="post-image" loading="lazy">
                    </div>
                    <p class="post-text">{{ post.review }}</p>
                    <a v-if="post.link" :href="post.link.startsWith('http') ? post.link : 'https://' + post.link" target="_blank" class="post-link">🔗 {{ post.link }}</a>
                    <div class="post-meta">
                        <span>♡ {{ post.likesCount }}</span>
                        <span>{{ formatDate(post.createAt) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-required { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.login-card { text-align: center; padding: 40px 24px; border: 1px solid #333; border-radius: 20px; max-width: 320px; }
.login-icon { font-size: 64px; margin-bottom: 16px; }
.login-card h2 { font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 8px; }
.login-card p { font-size: 15px; color: #777; margin: 0 0 24px; }
.login-btn { width: 100%; padding: 14px 24px; background: #fff; color: #000; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
.login-btn:hover { background: #eee; }

.loading-screen { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
.spinner { width: 32px; height: 32px; border: 3px solid #333; border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Activation Page */
.activation-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.activation-card { text-align: center; padding: 40px 24px; border: 1px solid #333; border-radius: 24px; max-width: 380px; width: 100%; }
.activation-icon { font-size: 64px; margin-bottom: 20px; }
.activation-card h2 { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 12px; }
.activation-card > p { font-size: 15px; color: #888; line-height: 1.6; margin: 0 0 24px; }

.user-code { background: #111; border: 1px solid #333; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
.code-label { font-size: 14px; color: #666; }
.code-value { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 1px; }

.whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 16px; background: #25D366; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; color: #fff; text-decoration: none; cursor: pointer; transition: all 0.2s; }
.whatsapp-btn:hover { background: #20BD5A; }
.whatsapp-btn svg { width: 22px; height: 22px; }

.hint-text { font-size: 13px; color: #555; margin: 16px 0 24px; line-height: 1.5; }

.logout-btn { width: 100%; padding: 14px; background: transparent; border: 1px solid #333; border-radius: 12px; color: #888; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.logout-btn:hover { background: #111; color: #fff; }

/* Profile Page */
.profile-page { padding: 20px 0; }
.profile-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.profile-info { flex: 1; }
.profile-name { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 4px; }
.profile-username { font-size: 15px; color: #777; margin: 0; }
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #fff; }

.profile-stats { margin-bottom: 20px; }
.stat { font-size: 15px; color: #fff; }

.profile-actions { display: flex; gap: 12px; margin-bottom: 24px; }
.action-btn { flex: 1; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; text-decoration: none; transition: all 0.2s; }
.action-btn.logout { background: transparent; border: 1px solid #333; color: #fff; }
.action-btn.logout:hover { background: #222; }
.action-btn.phone { background: #222; border: none; color: #fff; }
.action-btn.phone:hover { background: #333; }

.profile-tabs { display: flex; border-bottom: 1px solid #222; margin-bottom: 20px; }
.profile-tabs button { flex: 1; padding: 14px 0; background: transparent; border: none; color: #777; font-size: 15px; font-weight: 600; cursor: pointer; position: relative; transition: color 0.2s; }
.profile-tabs button.active { color: #fff; }
.profile-tabs button.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #fff; }

.tab-content { min-height: 200px; }
.empty-tab { text-align: center; padding: 40px 0; }
.empty-tab p { color: #555; font-size: 15px; margin: 0; }

.post-header-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.post-meta-info { display: flex; flex-direction: column; gap: 2px; }
.post-author { font-size: 15px; font-weight: 600; color: #fff; }
.post-time { font-size: 13px; color: #555; }

.posts-list { display: flex; flex-direction: column; gap: 16px; }
.post-image-wrapper { margin: 8px -16px 12px; height: 300px; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; border-top: 1px solid #222; border-bottom: 1px solid #222; }
.post-image { width: 100%; height: 100%; object-fit: cover; }

.unlike-btn { position: absolute; top: 12px; right: 12px; background: #111; border: 1px solid #333; color: #ff3040; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; }
.unlike-btn:hover { border-color: #ff3040; background: rgba(255,48,64,0.1); }

.unsave-btn { position: absolute; top: 12px; right: 12px; background: #111; border: 1px solid #333; color: #ffc107; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; }
.unsave-btn:hover { border-color: #ffc107; background: rgba(255,193,7,0.1); }

.delete-btn { position: absolute; top: 12px; right: 12px; background: #111; border: 1px solid #333; color: #666; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; }
.delete-btn:hover { color: #ff4444; border-color: #ff4444; background: rgba(255,68,68,0.1); }
</style>
