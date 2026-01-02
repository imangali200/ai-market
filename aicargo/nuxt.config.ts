// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  plugins: [
    '~/plugins/toast.client.ts'
  ],

  // PWA конфигурациясы - Safari UI жасыру үшін
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Ai-Market',
      short_name: 'Ai-Market',
      description: 'Товарларды бақылау қосымшасы',
      theme_color: '#000000',
      background_color: '#000000',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      id: '/',
      icons: [
        {
          src: '/images/ai-market-logo.jpg',
          sizes: '192x192',
          type: 'image/jpeg',
          purpose: 'any maskable'
        },
        {
          src: '/images/ai-market-logo.jpg',
          sizes: '512x512',
          type: 'image/jpeg',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: false
    },
    devOptions: {
      enabled: false,
      type: 'module'
    }
  },

  // iOS Safari үшін қосымша meta tags
  app: {
    head: {
      title: 'Ai-Market - Карго тасымалдау және тауарларды бақылау',
      meta: [
        { name: 'description', content: 'Ai-Market - Қытайдан Қазақстанға тауарларды жылдам әрі сенімді жеткізу. Трэк-номер арқылы тауарларды бақылау жүйесі.' },
        { name: 'keywords', content: 'карго, Қытайдан жеткізу, тауар бақылау, Ai-Market, логистика' },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://ai-market.kz/' },
        { property: 'og:title', content: 'Ai-Market - Карго тасымалдау' },
        { property: 'og:description', content: 'Тауарларыңызды бізбен бірге бақылаңыз. Қытайдан Қазақстанға тиімді жеткізу.' },
        { property: 'og:image', content: 'https://ai-market.kz/images/ai-market-logo.jpg' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://ai-market.kz/' },
        { name: 'twitter:title', content: 'Ai-Market - Карго тасымалдау' },
        { name: 'twitter:description', content: 'Тауарларыңызды бізбен бірге бақылаңыз.' },
        { name: 'twitter:image', content: 'https://ai-market.kz/images/ai-market-logo.jpg' },

        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Ai-Market' },
        { name: 'theme-color', content: '#000000' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/images/ai-market-logo.jpg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/ai-market-logo.jpg' },
        { rel: 'apple-touch-icon', sizes: '167x167', href: '/images/ai-market-logo.jpg' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/images/ai-market-logo.jpg' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://ai-cargo.onrender.com/'
    }
  }
});
