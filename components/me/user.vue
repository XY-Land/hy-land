<script setup lang="ts">
import Avatar from './avatar'

const {
    label,
    address,
    scheme
} = useChainAccount()

function copyAddress() {
    if (address.value) {
        navigator.clipboard.writeText(address.value!)
        useToast().add({
            title: 'Address copied',
            color: 'success'
        })
    }
}

</script>

<template>
    <UUser chip size="xl">
        <template #avatar>
            <Avatar />
        </template>
        <template #name>
            {{ scheme ?? 'Unknown' }} wallet
        </template>
        <template #description>
            <span class="flex gap-1">
                <span class="truncate max-w-[200px] inline-block">{{ address ? (address.length > 12 ? address.slice(0, 6)
                    + '...' + address.slice(-6) : address) : '' }}</span>
                <UButton
                    icon="i-heroicons-document-duplicate"
                    variant="ghost" color="neutral" size="sm"
                    class="w-5 h-5 flex items-center justify-center" @click="copyAddress">
                </UButton>
            </span>
        </template>
    </UUser>
</template>
