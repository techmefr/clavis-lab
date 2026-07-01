export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    ssr: false,
    devtools: { enabled: true },
    css: ['~/assets/main.css'],
    app: {
        head: {
            title: 'clavis-lab',
            link: [
                { rel: 'icon', type: 'image/png', href: '/favicon.png' },
                { rel: 'shortcut icon', href: '/favicon.ico' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap',
                },
            ],
        },
    },
})
