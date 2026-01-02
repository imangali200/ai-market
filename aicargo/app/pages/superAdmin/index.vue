<template>
    <div class="tw-py-8 animate-fadeIn">
        <div class="tw-text-center tw-mb-8">
            <h1 class="tw-text-3xl tw-font-bold tw-text-white tw-mb-2">Панель управления</h1>
            <p class="tw-text-white/60">Выберите раздел для управления</p>
        </div>
        
        <div class="tw-flex tw-flex-col sm:tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
            <router-link to="/superAdmin/users" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-cyan-500/50 hover:tw-bg-cyan-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-cyan-500 tw-to-cyan-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">Пользователи</h3>
                    <p class="tw-text-sm tw-text-white/50">Управление пользователями системы</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>

            <router-link to="/superAdmin/warehouses" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-violet-500/50 hover:tw-bg-violet-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-violet-500 tw-to-violet-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">Склады</h3>
                    <p class="tw-text-sm tw-text-white/50">Управление складами и филиалами</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>

            <router-link to="/superAdmin/import" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-emerald-500/50 hover:tw-bg-emerald-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-emerald-500 tw-to-green-500 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">Импорт</h3>
                    <p class="tw-text-sm tw-text-white/50">Қытай / Тараз статустарын импорттау</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>

            <router-link to="/superAdmin/history" class="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-bg-white/[0.03] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-no-underline tw-transition-all tw-duration-300 hover:tw-translate-y-[-4px] hover:tw-shadow-2xl hover:tw-border-pink-500/50 hover:tw-bg-pink-500/10 group">
                <div class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-gradient-to-br tw-from-pink-500 tw-to-rose-500 tw-flex tw-items-center tw-justify-center tw-text-white tw-flex-shrink-0">
                    <svg class="tw-w-7 tw-h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="tw-flex-1">
                    <h3 class="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">История</h3>
                    <p class="tw-text-sm tw-text-white/50">Импортталған трек-кодтар тарихы</p>
                </div>
                <div class="tw-w-8 tw-h-8 tw-bg-white/5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-white/40 group-hover:tw-text-white group-hover:tw-bg-white/10 tw-transition-all">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})
</script>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
