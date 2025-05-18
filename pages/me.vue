<script setup lang="ts">
import User from '~/components/me/user.vue'
import { useDeepbookClient } from '~/composables/deepbookClient'

definePageMeta({
    layout: 'with-dock',
    middleware: 'auth'
})

const {
    label,
    address,
    scheme
} = useChainAccount()

const client = useSuiClient()
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex">
            <User />
            <div class="ml-auto">
                <div class="flex gap-2">
                    <UButton color="info" variant="outline">Logout</UButton>
                    <UButton color="info" variant="outline">Switch</UButton>
                </div>
            </div>
        </div>

        <h2 class="pt-4">Your balances:</h2>
        <span class="text-4xl text-balance">$ 100.00</span>
        <div class="flex gap-4">
            <UButton>Buy</UButton>
            <UButton>Deposit</UButton>
            <UButton>Withdraw</UButton>
        </div>
        <h2 class=" pt-4">Your Assets:</h2>
        <div>
            <!-- assets list -->
        </div>
    </div>
</template>
