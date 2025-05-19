<script lang="ts" setup>
import { PasskeyChainAccountResolver } from '~/utils/sui/accountResolver/passkey'
const account = useChainAccount()
const isOpen = ref(false)
const client = useSuiClient()
const emit = defineEmits<{ success: [] }>()

const isPasskeySupported = ref(false)
onMounted(() => {
    if (window.PublicKeyCredential) {
        isPasskeySupported.value = true
    }
})

async function create() {
    const provider = await PasskeyChainAccountResolver.new(client)
    account.setProvider(provider)
    isOpen.value = false

    emit('success')
}

async function restore() {
    const provider = await PasskeyChainAccountResolver.restore(client)
    account.setProvider(provider)
    isOpen.value = false

    emit('success')
}

</script>

<template>
    <UModal v-model:open="isOpen" title="Login by passkey">
        <UButton :disabled="!isPasskeySupported" class="h-16" size="xl" icon="i-heroicons-key"
            :color="isPasskeySupported ? 'primary' : 'secondary'" trailingIcon="i-heroicons-chevron-right">
            By Passkey {{ isPasskeySupported ? '(Recommended)' : '(Not supported on current context)' }}
            <span class="flex-auto" />
        </UButton>

        <template #body>
            <div class="flex flex-col gap-4">
                <UButton label="Success" size="xl" variant="ghost" color="neutral" @click="create">
                    <UIcon name="material-symbols:add-box-rounded" />
                    Create (I don't have a passkey account)
                </UButton>
                <UButton label="Success" size="xl" variant="ghost" color="neutral" @click="restore">
                    <UIcon name="ic:round-restore" />
                    Restore (I already have a passkey account)
                </UButton>
            </div>
        </template>
    </UModal>
</template>
