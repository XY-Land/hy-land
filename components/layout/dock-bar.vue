<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
const route = useRoute()
const router = useRouter()
const currentValue = ref<string>()

watchEffect(() => {
    const re = /\/(trade|swap|explore|me).*/gm
    const match = re.exec(route.path)
    if (match && match[1]) {
        currentValue.value = `/${match[1]}`
    }
}, {flush: 'sync'})

// 仅负责底部导航渲染
const tabs = ref<TabsItem[]>([
    {
        label: 'Trade',
        value: '/trade',
        icon: 'i-heroicons-banknotes-20-solid',
    },
    {
        label: 'FlushSwap',
        value: '/swap',
        icon: 'i-heroicons-arrow-path-20-solid',
    },
    {
        label: 'Explore',
        value: '/explore',
        icon: 'i-heroicons-magnifying-glass-20-solid',
    },
    {
        label: 'Me',
        value: '/me',
        icon: 'i-heroicons-user-20-solid',
    },
])
</script>

<template>
    <UTabs
        class="fixed bottom-0 w-full"
        as="nav"
        v-model:model-value="currentValue"
        :content="false"
        :items="tabs"
        size="xl"
        @update:model-value="(value) => value && router.push(value as string)"
    />
</template>