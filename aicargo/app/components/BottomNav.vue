<template>
    <nav class="bottom-nav">
        <router-link to="/user" class="nav-item" :class="{ active: route.path === '/user' }">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
        </router-link>
        <router-link to="/user/search" class="nav-item" :class="{ active: route.path === '/user/search' }">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
            </svg>
        </router-link>
        <router-link to="/user/create-post" class="nav-item nav-create">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        </router-link>
        <router-link to="/user/products" class="nav-item" :class="{ active: route.path === '/user/products' }">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
        </router-link>
        <router-link to="/user/me" class="nav-item" :class="{ active: route.path === '/user/me' }">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        </router-link>
    </nav>
</template>

<script setup lang="ts">
const route = useRoute()
</script>

<style scoped>
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: #000;
    border-top: 1px solid #222;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 12px 0;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.nav-item {
    width: 56px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s;
    text-decoration: none;
}

.nav-icon {
    width: 26px;
    height: 26px;
    color: #555;
    transition: all 0.2s;
}

.nav-item:hover .nav-icon {
    color: #888;
}

.nav-item.active .nav-icon {
    color: #fff;
}

.nav-create {
    width: 64px;
    height: 44px;
    background: #262626;
    border-radius: 14px;
}

.nav-create .nav-icon {
    color: #fff;
}

.nav-create:hover {
    background: #333;
}
</style>
