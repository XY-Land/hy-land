// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    app: {
        head: {
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
            ]
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    modules: [
        // '@nuxt/content',
        // '@nuxt/eslint',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxt/ui-pro',
        '@nuxt/fonts',
        '@nuxtjs/i18n',
        '@vueuse/nuxt',
        '@pinia/nuxt'
    ],
    css: ['~/assets/css/main.css'],
    experimental: {

    },
    vite: {
        plugins: [tailwindcss()],
    },
    ssr: false,
    devtools: { enabled: true },
    compatibilityDate: '2024-11-01',
    eslint: {
        config: {
            stylistic: {
                blockSpacing: true,
                indent: 4,
            },
        },
    },
    devServer: {
        host: '[::]',
    },

})