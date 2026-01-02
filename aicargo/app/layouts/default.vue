<script setup lang="ts">
import Header from '~/components/header.vue'
import BottomNav from '~/components/BottomNav.vue'
</script>

<template>
    <div class="threads-app">
        <Header />
        <main class="threads-main">
            <div class="threads-container">
                <slot />
            </div>
        </main>
        <BottomNav />
    </div>
</template>

<style scoped>
.threads-app { min-height: 100vh; min-height: 100dvh; width: 100%; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
.threads-main { flex: 1; padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px)); }
.threads-container { max-width: 620px; margin: 0 auto; padding: 0 16px; }
</style>
