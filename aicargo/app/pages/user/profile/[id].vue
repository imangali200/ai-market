<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth', 'user-active']
})

interface Post {
    id: number
    link: string
    review: string
    imgUrl: string | null
    likesCount: number
    comments?: any[]
    createAt: string
}

interface Profile {
    id: number
    name: string
    surname: string
    posts: Post[]
}

const { $axios } = useNuxtApp()
const token = useCookie('token')
const route = useRoute()
const router = useRouter()

const profile = ref<Profile | null>(null)
const loading = ref(false)
const currentUser = ref<any>(null)

// Comment states
const showComments = ref(false)
const activePostId = ref<number | null>(null)
const newComment = ref('')
const sendingComment = ref(false)

const userId = computed(() => route.params.id as string)

async function getCurrentUser() {
    try {
        const response = await $axios.get('profile', {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        currentUser.value = response.data
    } catch (error) {
        console.error('Get current user error:', error)
    }
}

async function getUserProfile() {
    loading.value = true
    try {
        const response = await $axios.get(`profile/${userId.value}`, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        profile.value = response.data
    } catch (error: any) {
        console.error('Profile error:', error.response?.data || error)
    } finally {
        loading.value = false
    }
}

// Open comments panel
function openComments(postId: number) {
    activePostId.value = postId
    showComments.value = true
    newComment.value = ''
}

// Close comments panel
function closeComments() {
    showComments.value = false
    activePostId.value = null
    newComment.value = ''
}

// Send comment
async function sendComment() {
    if (!newComment.value.trim() || !activePostId.value) return
    
    sendingComment.value = true
    try {
        const response = await $axios.post('post/comment', 
            {
                postId: activePostId.value,
                text: newComment.value.trim()
            },
            { headers: { 'Authorization': `Bearer ${token.value}` } }
        )
        
        const post = posts.value.find(p => p.id === activePostId.value)
        if (post) {
            if (!post.comments) post.comments = []
            post.comments.push({
                id: response.data?.id || Date.now(),
                text: newComment.value.trim(),
                createAt: new Date().toISOString(),
                author: {
                    id: currentUser.value?.id,
                    name: currentUser.value?.name,
                    surname: currentUser.value?.surname
                }
            })
        }
        
        newComment.value = ''
    } catch (error: any) {
        console.error(error)
    } finally {
        sendingComment.value = false
    }
}

const activePost = computed(() => {
    return posts.value.find(p => p.id === activePostId.value)
})

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

function goBack() {
    router.back()
}

const posts = computed(() => profile.value?.posts || [])

onMounted(() => {
    getCurrentUser()
})

watch(userId, (newId) => {
    if (newId) {
        getUserProfile()
    }
}, { immediate: true })
</script>

<template>
    <div class="profile-page">
        <!-- Loading -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
        </div>

        <div v-else-if="profile" class="profile-content">
            
            <!-- Profile Header -->
            <div class="profile-header">
                <div class="profile-left">
                    <h1 class="profile-name">{{ profile.name }}</h1>
                    <p class="profile-username">{{ profile.name?.toLowerCase() }}_{{ profile.surname?.toLowerCase() }}</p>
                </div>
                <div class="profile-avatar">
                    {{ profile.name?.charAt(0).toUpperCase() || 'U' }}
                </div>
            </div>

            <!-- Stats Row -->
            <div class="profile-stats">
                <span class="stat">{{ posts.length }} постов</span>
            </div>

            <!-- Action Button -->
            <button @click="goBack" class="back-button">← Назад</button>

            <!-- Tabs -->
            <div class="profile-tabs">
                <button class="tab active">Посты</button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <div v-if="!posts.length" class="empty-state">
                    <p>Нет постов</p>
                </div>
                <div v-else class="posts-list">
                    <div v-for="post in posts" :key="post.id" class="post-item">
                        <div class="post-avatar">{{ profile.name?.charAt(0).toUpperCase() }}</div>
                        <div class="post-content">
                            <div class="post-header">
                                <span class="post-author">{{ profile.name }}</span>
                                <span class="post-time">{{ formatDate(post.createAt) }}</span>
                            </div>
                            <div v-if="post.imgUrl" class="post-image-wrapper">
                                <img :src="post.imgUrl" :alt="post.review" class="post-image" loading="lazy">
                            </div>
                            <p class="post-text">{{ post.review }}</p>
                            <a v-if="post.link" :href="post.link.startsWith('http') ? post.link : 'https://' + post.link" target="_blank" class="post-link">
                                🔗 {{ post.link }}
                            </a>
                            <div class="post-actions">
                                <span class="post-action">❤️ {{ post.likesCount }}</span>
                                <button class="post-action comment-btn" @click="openComments(post.id)">
                                    💬 {{ post.comments?.length || 0 }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else class="empty-state">
            <span class="empty-icon">😕</span>
            <h3>Профиль не найден</h3>
            <button @click="goBack" class="btn">← Назад</button>
        </div>
    </div>
        </div>
    </div>

    <!-- Comments Panel -->
    <Teleport to="body">
        <div v-if="showComments" class="comments-overlay-container">
            <div class="comments-backdrop" @click="closeComments"></div>
            <div class="comments-panel">
                <div class="panel-header">
                    <h3>💬 Пікірлер <span class="count">{{ activePost?.comments?.length || 0 }}</span></h3>
                    <button class="close-panel" @click="closeComments">✕</button>
                </div>

                <div class="comments-list">
                    <div v-if="!activePost?.comments?.length" class="empty-comments">
                        <div class="empty-icon">💭</div>
                        <p>Пікірлер жоқ</p>
                        <p class="subtext">Бірінші болып пікір қалдырыңыз!</p>
                    </div>
                    <div v-else class="comments-scroll">
                        <div v-for="comment in activePost.comments" :key="comment.id" class="comment-item">
                            <div class="comment-avatar">{{ comment.author?.name?.charAt(0).toUpperCase() || 'U' }}</div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="author-name">@{{ comment.author?.name || 'user' }}</span>
                                    <span v-if="comment.createAt" class="comment-time">{{ formatTime(comment.createAt) }}</span>
                                </div>
                                <p class="comment-text">{{ comment.text }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="comment-input-area">
                    <input 
                        v-model="newComment" 
                        type="text" 
                        placeholder="Пікір қалдыру..." 
                        @keyup.enter="sendComment"
                    >
                    <button @click="sendComment" :disabled="!newComment.trim() || sendingComment" class="send-btn">
                        {{ sendingComment ? '...' : '➤' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.profile-page { padding: 8px 0; }

.loading { display: flex; justify-content: center; padding: 60px 0; }
.spinner { width: 24px; height: 24px; border: 2px solid #333; border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.profile-content { }

/* Header */
.profile-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.profile-left { flex: 1; }
.profile-name { font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 2px; }
.profile-username { font-size: 15px; color: #ccc; margin: 0; }

.profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; color: #fff; flex-shrink: 0; }

/* Stats */
.profile-stats { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.stat { font-size: 15px; color: #ccc; }

/* Back Button */
.back-button { width: 100%; padding: 14px; background: transparent; border: 1px solid #333; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; }
.back-button:hover { background: #111; }

/* Tabs */
.profile-tabs { display: flex; border-bottom: 1px solid #222; margin-bottom: 0; }
.tab { flex: 1; padding: 16px 0; background: transparent; border: none; border-bottom: 1px solid transparent; color: #bbb; font-size: 15px; font-weight: 600; cursor: pointer; }
.tab.active { color: #fff; border-bottom-color: #fff; }

/* Tab Content */
.tab-content { min-height: 200px; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 8px; }
.empty-state p { font-size: 15px; color: #888; margin: 0; }
.btn { padding: 12px 24px; background: #fff; border: none; border-radius: 20px; color: #000; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 16px; }

/* Posts List */
.posts-list { }
.post-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #222; }
.post-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; color: #fff; flex-shrink: 0; }
.post-content { flex: 1; }
.post-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.post-author { font-size: 15px; font-weight: 600; color: #fff; }
.post-time { font-size: 14px; color: #aaa; }
.post-text { font-size: 15px; color: #fff; line-height: 1.4; margin: 0 0 12px; }
.post-link { display: inline-block; font-size: 14px; color: #7dd3fc; text-decoration: none; margin-bottom: 12px; font-weight: 500; }
.post-link:hover { text-decoration: underline; color: #fff; }
.post-image-wrapper { margin: 8px 0 12px; height: 280px; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; border: 1px solid #222; }
.post-image { width: 100%; height: 100%; object-fit: cover; }

.post-actions { display: flex; gap: 16px; margin-top: 8px; }
.post-action { font-size: 14px; color: #fff; display: flex; align-items: center; gap: 4px; background: transparent; border: none; padding: 0; cursor: default; }
.comment-btn { cursor: pointer; transition: transform 0.2s; }
.comment-btn:hover { transform: scale(1.1); }

/* Comments Panel Styles */
.comments-overlay-container { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
.comments-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
.comments-panel { position: relative; width: 100%; max-width: 500px; background: #111; height: 80vh; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; animation: slideUp 0.3s ease-out; border: 1px solid #333; border-bottom: none; }

@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.panel-header { padding: 20px; border-bottom: 1px solid #222; display: flex; align-items: center; justify-content: space-between; }
.panel-header h3 { margin: 0; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 8px; }
.panel-header .count { color: #555; font-size: 14px; font-weight: 400; }
.close-panel { background: #222; border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.comments-list { flex: 1; overflow: hidden; position: relative; }
.comments-scroll { height: 100%; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.empty-comments { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-comments p { color: #fff; margin: 0 0 4px; }
.empty-comments .subtext { color: #555; font-size: 14px; }

.comment-item { display: flex; gap: 12px; }
.comment-avatar { width: 36px; height: 36px; border-radius: 50%; background: #222; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #fff; flex-shrink: 0; }
.comment-content { flex: 1; }
.comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.author-name { font-size: 14px; font-weight: 600; color: #fff; }
.comment-time { font-size: 12px; color: #555; }
.comment-text { font-size: 14px; color: #ddd; margin: 0; line-height: 1.4; }

.comment-input-area { padding: 20px; border-top: 1px solid #222; background: #000; display: flex; gap: 12px; }
.comment-input-area input { flex: 1; background: #111; border: 1px solid #333; border-radius: 20px; padding: 12px 18px; color: #fff; font-size: 14px; }
.comment-input-area input:focus { outline: none; border-color: #555; }
.send-btn { background: #fff; color: #000; border: none; width: 44px; height: 44px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
