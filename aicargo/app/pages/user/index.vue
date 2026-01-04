<script setup lang="ts">
definePageMeta({
    layout: 'default'
})

import { useToast } from '~/composables/useToast'

interface Author {
    id: number
    name: string
    surname: string
    code: string
}

interface Comment {
    id: number
    text: string
    createAt: string
    author?: Author
}

interface Post {
    id: number
    link: string
    review: string
    imgUrl?: string
    likesCount: number
    isLiked?: boolean
    isSaved?: boolean
    createAt: string
    author?: Author
    comments?: Comment[]
    commentsCount?: number
}

interface UserProfile {
    id: number
    phoneNumber: string
    name: string
    surname: string
    code: string
    isActive: boolean
}

const { $axios } = useNuxtApp()
const token = useCookie('token')
const toast = useToast()
const router = useRouter()

const userProfile = ref<UserProfile | null>(null)
const isLoggedIn = computed(() => !!token.value)

const posts = ref<Post[]>([])
const loading = ref(false)
const allPostsSeen = ref(false)

const expandedComments = ref<Set<number>>(new Set())
const commentText = ref<{ [key: number]: string }>({})

const showLoginModal = ref(false)

// Получить ID просмотренных постов из localStorage
function getSeenPostIds(): Set<number> {
    if (typeof window === 'undefined') return new Set()
    const stored = localStorage.getItem('seenPosts')
    return stored ? new Set(JSON.parse(stored)) : new Set()
}

// Сохранить ID просмотренных постов
function saveSeenPostIds(ids: Set<number>) {
    if (typeof window === 'undefined') return
    localStorage.setItem('seenPosts', JSON.stringify([...ids]))
}

// Отметить посты как просмотренные
function markPostsAsSeen(postIds: number[]) {
    const seenIds = getSeenPostIds()
    postIds.forEach(id => seenIds.add(id))
    saveSeenPostIds(seenIds)
}

// Сбросить просмотренные посты
function resetSeenPosts() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('seenPosts')
    allPostsSeen.value = false
    getPosts()
}

async function getPosts() {
    loading.value = true
    try {
        const response = await $axios.get('post')
        const allPosts: Post[] = Array.isArray(response.data) ? response.data : [response.data]

        // Уақыт бойынша сұрыптау - ең соңғылары бірінші
        allPosts.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime())

        // Получить ID просмотренных постов
        const seenIds = getSeenPostIds()

        // Фильтровать - показать только новые посты
        const newPosts = allPosts.filter(post => !seenIds.has(post.id))

        if (newPosts.length === 0 && allPosts.length > 0) {
            // Все посты просмотрены
            allPostsSeen.value = true
            posts.value = []
        } else {
            posts.value = newPosts
            // Отметить показанные посты как просмотренные
            markPostsAsSeen(newPosts.map(p => p.id))
        }
    } catch {
        posts.value = []
    } finally {
        loading.value = false
    }
}

async function likePost(postId: number) {
    if (!token.value) {
        showLoginModal.value = true
        return
    }

    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    const wasLiked = post.isLiked
    const oldCount = post.likesCount

    post.isLiked = !post.isLiked
    post.likesCount = post.isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1)

    try {
        await $axios.get('post/likes/' + postId, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
    } catch {
        post.isLiked = wasLiked
        post.likesCount = oldCount
    }
}

async function savePost(postId: number) {
    if (!token.value) {
        showLoginModal.value = true
        return
    }

    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    const wasSaved = post.isSaved
    post.isSaved = !post.isSaved

    try {
        await $axios.post('post/save/' + postId, {}, {
            headers: { 'Authorization': `Bearer ${token.value}` }
        })
        toast.success(post.isSaved ? 'Сохранено!' : 'Удалено из сохраненных', { position: 'top-center' })
    } catch {
        post.isSaved = wasSaved
        toast.error('Ошибка!', { position: 'top-center' })
    }
}

async function loadComments(postId: number) {
    try {
        const response = await $axios.get(`post/${postId}/comment`)
        const post = posts.value.find(p => p.id === postId)
        if (post) {
            post.comments = Array.isArray(response.data) ? response.data : []
        }
    } catch { }
}

function toggleComments(postId: number) {
    if (expandedComments.value.has(postId)) {
        expandedComments.value.delete(postId)
    } else {
        expandedComments.value.add(postId)
        loadComments(postId)
    }
}

async function submitComment(postId: number) {
    if (!token.value) {
        showLoginModal.value = true
        return
    }

    const text = commentText.value[postId]?.trim()
    if (!text) return

    const post = posts.value.find(p => p.id === postId)

    const newComment: Comment = {
        id: Date.now(),
        text: text,
        createAt: new Date().toISOString(),
        author: {
            id: userProfile.value?.id || 0,
            name: userProfile.value?.name || 'User',
            surname: userProfile.value?.surname || '',
            code: userProfile.value?.code || ''
        }
    }

    if (post) {
        if (!post.comments) post.comments = []
        post.comments.push(newComment)
        post.commentsCount = (post.commentsCount || 0) + 1
    }

    commentText.value[postId] = ''

    try {
        await $axios.post('post/comment',
            { postId, text },
            { headers: { 'Authorization': `Bearer ${token.value}` } }
        )
    } catch {
        if (post && post.comments) {
            post.comments = post.comments.filter(c => c.id !== newComment.id)
            post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1)
        }
        toast.error('Ошибка!', { position: 'top-center' })
    }
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

function goToProfile(authorId: number | undefined) {
    if (authorId) router.push('/user/profile/' + authorId)
}

async function loadUserProfile() {
    if (token.value) {
        try {
            const response = await $axios.get('profile', {
                headers: { 'Authorization': `Bearer ${token.value}` }
            })
            userProfile.value = response.data
        } catch { }
    }
}

function goToLogin() {
    router.push('/auth/login')
}

onMounted(() => {
    getPosts()
    loadUserProfile()
})
</script>

<template>
    <div class="feed">
        <div v-if="loading" class="loading-inline">
            <div class="spinner"></div>
        </div>

        <!-- Все посты просмотрены -->
        <div v-else-if="allPostsSeen" class="empty-feed">
            <div class="empty-icon">✅</div>
            <h3>Вы всё просмотрели!</h3>
            <p>Новых постов пока нет</p>
            <button @click="resetSeenPosts" class="reset-btn">Показать снова</button>
        </div>

        <div v-else-if="!posts.length" class="empty-feed">
            <div class="empty-icon">📝</div>
            <h3>Нет постов</h3>
            <p>Создайте первый пост!</p>
        </div>

        <div v-else class="posts">
            <div v-for="post in posts" :key="post.id" class="post">
                <!-- Header: Avatar + Name + Time -->
                <div class="post-header">
                    <div class="post-avatar" @click="goToProfile(post.author?.id)">
                        {{ post.author?.name?.charAt(0).toUpperCase() || 'U' }}
                    </div>
                    <div class="post-user-info" @click="goToProfile(post.author?.id)">
                        <span class="post-name">{{ post.author?.name || 'user' }}</span>
                        <span class="post-time">{{ formatDate(post.createAt) }}</span>
                    </div>
                    <button class="post-more">•••</button>
                </div>

                <!-- Description & Link -->
                <div class="post-content">
                    <p class="post-text">{{ post.review }}</p>
                    <a v-if="post.link" :href="post.link.startsWith('http') ? post.link : 'https://' + post.link"
                        target="_blank" class="post-link">🔗 {{ post.link }}</a>
                </div>

                <!-- Post Image -->
                <div v-if="post.imgUrl" class="post-image">
                    <img :src="post.imgUrl" alt="Post image" loading="lazy" />
                </div>

                <!-- Actions: Like, Comment, Repost, Save -->
                <div class="post-actions">
                    <button class="action-btn" :class="{ liked: post.isLiked }" @click="likePost(post.id)">
                        <svg v-if="!post.isLiked" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="#ff3040" stroke="#ff3040"
                            stroke-width="2">
                            <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span v-if="post.likesCount">{{ post.likesCount }}</span>
                    </button>
                    <button class="action-btn" @click="toggleComments(post.id)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path
                                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                    </button>
                    <button class="action-btn save-btn" :class="{ saved: post.isSaved }" @click="savePost(post.id)">
                        <svg v-if="!post.isSaved" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"
                            stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                </div>

                <div v-if="expandedComments.has(post.id)" class="comments-section">
                    <div v-if="isLoggedIn" class="comment-input-row">
                        <div class="comment-avatar">{{ userProfile?.name?.charAt(0).toUpperCase() || 'U' }}</div>
                        <input v-model="commentText[post.id]" @keyup.enter="submitComment(post.id)" type="text"
                            placeholder="Оставьте комментарий..." class="comment-input" />
                        <button @click="submitComment(post.id)" :disabled="!commentText[post.id]?.trim()"
                            class="comment-submit">Отправить</button>
                    </div>
                    <div v-else class="login-prompt" @click="goToLogin">
                        <span>Войдите, чтобы оставить комментарий →</span>
                    </div>

                    <div v-if="post.comments?.length" class="comments-list">
                        <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                            <div class="comment-avatar small" @click="goToProfile(comment.author?.id)">{{
                                comment.author?.name?.charAt(0).toUpperCase() || 'U' }}</div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-name" @click="goToProfile(comment.author?.id)">{{
                                        comment.author?.name || 'user' }}</span>
                                    <span class="comment-time">{{ formatDate(comment.createAt) }}</span>
                                </div>
                                <p class="comment-text">{{ comment.text }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-else class="no-comments">
                        <p>Комментариев пока нет</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <div v-if="showLoginModal" class="modal-overlay" @click="showLoginModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-icon">🔐</div>
                <h3>Требуется авторизация</h3>
                <p>Войдите, чтобы выполнить это действие</p>
                <div class="modal-buttons">
                    <button class="modal-btn primary" @click="goToLogin">Войти</button>
                    <button class="modal-btn secondary" @click="showLoginModal = false">Закрыть</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.loading-inline {
    display: flex;
    justify-content: center;
    padding: 40px 0;
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

.empty-feed {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-feed h3 {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
}

.empty-feed p {
    color: #777;
    margin: 0 0 20px;
}

.reset-btn {
    padding: 12px 24px;
    background: #fff;
    border: none;
    border-radius: 20px;
    color: #000;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.reset-btn:hover {
    background: #e5e5e5;
}

.feed {
    padding: 0;
}

.posts {
    display: flex;
    flex-direction: column;
}

.post {
    padding: 12px 16px;
    border-bottom: 1px solid #262626;
    overflow: hidden;
}

/* Header: Avatar + Name + Time */
.post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.post-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
    flex-shrink: 0;
    cursor: pointer;
    border: 2px solid #333;
}

.post-user-info {
    flex: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.post-name {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
}

.post-name:hover {
    text-decoration: underline;
}

.post-time {
    font-size: 14px;
    color: #737373;
}

.post-more {
    padding: 8px;
    background: transparent;
    border: none;
    color: #737373;
    cursor: pointer;
    font-size: 18px;
    letter-spacing: 2px;
}

.post-more:hover {
    color: #fff;
}

/* Content: Text + Link */
.post-content {
    margin-bottom: 12px;
    overflow: hidden;
}

.post-text {
    font-size: 15px;
    color: #fff;
    line-height: 1.5;
    margin: 0 0 8px;
    white-space: pre-wrap;
}

.post-link {
    display: block;
    font-size: 14px;
    color: #e0f1ff;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.post-link:hover {
    text-decoration: underline;
}

/* Image */
.post-image {
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #262626;
}

.post-image img {
    width: 100%;
    max-height: 600px;
    object-fit: contain;
    display: block;
    background: #000;
}

/* Actions: Like, Comment, Repost, Save */
.post-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 0;
    background: transparent;
    border: none;
    color: #f5f5f5;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.action-btn:hover {
    opacity: 0.7;
}

.action-btn svg {
    width: 24px;
    height: 24px;
}

.action-btn.liked svg {
    color: #ff3040;
}

.action-btn.saved {
    color: #fff;
}

.save-btn {
    margin-left: auto;
}

.comments-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #262626;
}

.comment-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-top: 1px solid #222;
}

.comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #333, #555);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #888;
    flex-shrink: 0;
}

.comment-avatar.small {
    width: 28px;
    height: 28px;
    font-size: 11px;
    cursor: pointer;
    background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
    color: #fff;
}

.comment-input {
    flex: 1;
    height: 40px;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 14px;
}

.comment-input::placeholder {
    color: #555;
}

.comment-submit {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 20px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.comment-submit:hover:not(:disabled) {
    background: #fff;
    color: #000;
}

.comment-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.login-prompt {
    padding: 16px;
    border-top: 1px solid #222;
    text-align: center;
    cursor: pointer;
    color: #1d9bf0;
    font-size: 14px;
    transition: all 0.2s;
}

.login-prompt:hover {
    background: #111;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
}

.comment-item {
    display: flex;
    gap: 10px;
}

.comment-content {
    flex: 1;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
}

.comment-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
}

.comment-name:hover {
    text-decoration: underline;
}

.comment-time {
    font-size: 13px;
    color: #555;
}

.comment-text {
    font-size: 14px;
    color: #ccc;
    line-height: 1.4;
    margin: 0;
}

.no-comments {
    padding: 20px 0;
    text-align: center;
}

.no-comments p {
    font-size: 14px;
    color: #555;
    margin: 0;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: #000;
    border: 1px solid #333;
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    max-width: 320px;
    width: 100%;
}

.modal-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.modal-content h3 {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
}

.modal-content p {
    font-size: 14px;
    color: #777;
    margin: 0 0 24px;
}

.modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.modal-btn {
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.modal-btn.primary {
    background: #fff;
    color: #000;
}

.modal-btn.primary:hover {
    background: #eee;
}

.modal-btn.secondary {
    background: transparent;
    color: #fff;
    border: 1px solid #333;
}

.modal-btn.secondary:hover {
    background: #111;
}
</style>
