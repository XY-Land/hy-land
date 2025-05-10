export function redirectToLogin() {
    const router = useRouter()
    const route = useRoute()

    router.push({
        path: '/login',
        query: {
            redirect_to: route.fullPath,
        }
    })
}
