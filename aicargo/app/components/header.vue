<template>
    <header class="threads-header">
        <div class="threads-header-content">
            <a href="#" @click.prevent="goToHome" class="threads-logo">
                <img src="/images/ai-market-logo.jpg" alt="Ai-Market" class="logo-img" />
            </a>

            <button v-if="!isLoggedIn" @click="goToLogin" class="auth-btn">
                Войти
            </button>
            <button v-else @click="goToSearch" class="search-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
    role: 'user' | 'admin' | 'superAdmin'
}

const router = useRouter()
const token = useCookie('token')

const isLoggedIn = computed(() => !!token.value)

function goToHome() {
    if (!token.value) {
        router.push('/auth/login')
        return
    }

    try {
        const payload = jwtDecode<JwtPayload>(token.value)
        if (payload.role === 'admin') {
            router.push('/admin')
        } else if (payload.role === 'superAdmin') {
            router.push('/superAdmin')
        } else {
            router.push('/user')
        }
    } catch {
        router.push('/auth/login')
    }
}

function goToLogin() {
    router.push('/auth/login')
}

function goToSearch() {
    router.push('/user/search')
}
</script>

<style scoped>
.threads-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(180deg, #0a0a0a 0%, #000 100%);
    border-bottom: 1px solid #1a1a1a;
}

.threads-header-content {
    max-width: 620px;
    margin: 0 auto;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.threads-logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-decoration: none;
    transition: all 0.3s ease;
}

.threads-logo:hover {
    transform: translateX(-50%) scale(1.05);
}

.logo-img {
    height: 56px;
    width: auto;
}

.auth-btn {
    margin-left: auto;
    padding: 10px 20px;
    background: #fff;
    border: none;
    border-radius: 10px;
    color: #000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.auth-btn:hover {
    background: #e5e5e5;
}

.search-btn {
    margin-left: auto;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: #777;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.search-btn:hover {
    background: #222;
    color: #fff;
}
</style>
