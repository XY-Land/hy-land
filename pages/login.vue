<script setup lang="ts">
import ByPasskey from '~/components/login/by-passkey.vue'
import BySocial from '~/components/login/by-social.vue'
import ByLegacy from '~/components/login/by-legacy.vue'
const router = useRouter()

const props = defineProps<{
    redirect_to?: string
}>()

const loginSuccess = () => {
    router.push(props.redirect_to || '/me')
}

</script>

<template>
    <div class="flex flex-col gap-8">
        <div class="flex h-full gap-2">
            <UAvatar icon="i-heroicons-chevron-right"  size="xl" />
            <h1 class="text-4xl">Login</h1>
        </div>
        <ByPasskey @success="loginSuccess" />
        <BySocial />
        <ByLegacy @success="loginSuccess" />
    </div>
</template>
