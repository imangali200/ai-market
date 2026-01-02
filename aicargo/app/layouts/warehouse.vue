<template>
    <div class="admin-app">
        <header class="admin-header">
            <div class="admin-header-content">
                <router-link to="/admin" class="admin-logo">
                    <svg width="28" height="28" viewBox="0 0 192 192" fill="currentColor">
                        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2266 61.6848C97.3051 61.6848 97.3843 61.6848 97.4627 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3175 35.2355 52.0339 45.7381 38.683C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C120.004 17.1113 137.552 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/>
                    </svg>
                    <span class="logo-text">Admin</span>
                </router-link>
                
                <!-- Desktop Navigation -->
                <nav class="admin-nav desktop-nav">
                    <router-link to="/admin" class="nav-link">Главная</router-link>
                    <router-link to="/admin/new-receipts" class="nav-link">Новые</router-link>
                    <router-link to="/admin/history" class="nav-link">История</router-link>
                    <router-link to="/admin/import" class="nav-link">Импорт</router-link>
                </nav>
                
                <button @click="logout" class="logout-btn desktop-logout">Выйти</button>
                
                <!-- Mobile Burger Button -->
                <button @click="menuOpen = !menuOpen" class="burger-btn">
                    <svg v-if="!menuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12h18M3 6h18M3 18h18"/>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <!-- Mobile Menu -->
            <div v-if="menuOpen" class="mobile-menu">
                <nav class="mobile-nav">
                    <router-link to="/admin" class="mobile-link" @click="menuOpen = false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        Главная
                    </router-link>
                    <router-link to="/admin/new-receipts" class="mobile-link" @click="menuOpen = false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        Принять товары
                    </router-link>
                    <router-link to="/admin/history" class="mobile-link" @click="menuOpen = false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        История
                    </router-link>
                    <router-link to="/admin/import" class="mobile-link" @click="menuOpen = false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Импорт
                    </router-link>
                </nav>
                <button @click="logout" class="mobile-logout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9"/></svg>
                    Выйти
                </button>
            </div>
        </header>
        <main class="admin-main">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const token = useCookie('token')
const refreshToken = useCookie('refreshToken')
const router = useRouter()
const menuOpen = ref(false)

function logout() {
    token.value = null
    refreshToken.value = null
    menuOpen.value = false
    router.push('/auth/login')
}

// Close menu on route change
watch(() => router.currentRoute.value.path, () => {
    menuOpen.value = false
})
</script>

<style scoped>
.admin-app {
    min-height: 100vh;
    width: 100%;
    background: #0a0a0a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.admin-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #000;
    border-bottom: 1px solid #222;
}

.admin-header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
}

.admin-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    text-decoration: none;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
}

/* Desktop Navigation */
.desktop-nav {
    display: none;
    gap: 4px;
    flex: 1;
}

.nav-link {
    padding: 8px 14px;
    color: #888;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s;
    white-space: nowrap;
}

.nav-link:hover {
    background: #1a1a1a;
    color: #fff;
}

.nav-link.router-link-active {
    background: #222;
    color: #fff;
}

.desktop-logout {
    display: none;
    padding: 8px 20px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}

.desktop-logout:hover {
    background: #222;
}

/* Burger Button */
.burger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    margin-left: auto;
    transition: all 0.2s;
}

.burger-btn:hover {
    background: #222;
}

/* Mobile Menu */
.mobile-menu {
    background: #000;
    border-top: 1px solid #222;
    padding: 16px;
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mobile-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    color: #888;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    border-radius: 12px;
    transition: all 0.2s;
}

.mobile-link:hover,
.mobile-link.router-link-active {
    background: #1a1a1a;
    color: #fff;
}

.mobile-logout {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    margin-top: 12px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 12px;
    color: #ef4444;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.mobile-logout:hover {
    background: #1a1a1a;
}

.admin-main {
    padding: 16px;
}

/* Desktop styles */
@media (min-width: 768px) {
    .admin-header-content {
        padding: 12px 24px;
        gap: 24px;
    }
    
    .desktop-nav {
        display: flex;
    }
    
    .desktop-logout {
        display: block;
    }
    
    .burger-btn {
        display: none;
    }
    
    .mobile-menu {
        display: none;
    }
    
    .admin-main {
        padding: 24px;
    }
}
</style>
