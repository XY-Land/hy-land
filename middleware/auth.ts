export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) {
        return
    }

    // check if user is authenticated

    return useChainAccount().isConnected.value ? undefined : navigateTo(`/login?redirect_to=${to.path}`)
})
