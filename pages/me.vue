<script setup lang="ts">
import User from '~/components/me/user.vue'
import type { AccordionItem } from '#ui/components/Accordion.vue'

definePageMeta({
    layout: 'with-dock',
    middleware: 'auth'
})

const accordionItems = [
    {
        label: 'Funding Account',
        icon: 'material-symbols:wallet',
        content: 'Funding Account',
        value: 'funding'
    },
    {
        label: 'Trading Account',
        icon: 'arcticons:ks-trade-plus',
        content: 'Trading Account',
        value: 'trading'
    }
] satisfies AccordionItem[]
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex">
            <User />
            <div class="ml-auto">
                <div class="flex gap-2">
                    <UButton color="info" icon="i-heroicons-arrow-right-on-rectangle" variant="outline" @click="navigateTo('/login')" />
                    <!-- <UButton color="info" variant="outline">Switch</UButton> -->
                </div>
            </div>
        </div>

        <h2 class="pt-4">Your balances:</h2>
        <!-- <USkeleton class="w-50 h-10" /> -->
        <span class="text-4xl text-balance"> -- USD</span>
        <div class="flex gap-4">
            <UButton>Buy</UButton>
            <UButton>Deposit</UButton>
            <UButton>Withdraw</UButton>
        </div>
        <UAccordion default-value="funding"  :items="accordionItems" :unmount-on-hide="false">
            <template #content="{item}">
                <template v-if="item.label === 'Funding Account'">
                    <MeFundingAccount />
                </template>
                <template v-if="item.label === 'Trading Account'">
                    <Suspense>
                        <template #fallback>
                            <USkeleton class="w-full h-40" />
                        </template>
                        <MeTradingAccount />
                    </Suspense>
                    
                </template>
            </template>
        </UAccordion>
    </div>
</template>
