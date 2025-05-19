<template>
    <div class="flex flex-col gap-4 grow-1">
        <PoolSelector class="w-full" v-model:model-value="currentPool" />
        <div :class="{ 'grow-1': !currentPool }" class="flex gap-4 w-full">
            <div class="w-2/3">
                <template v-if="currentPool">
                    <OrderPanel :current-pool="currentPool" />
                </template>
                <template v-else>
                    <USkeleton class="w-full h-full" />
                </template>
            </div>
            <div class="w-1/3">
                <Suspense>
                    <template #default>
                        <TopBid v-if="currentPool" :pool-key="currentPool.pool_name" />
                        <USkeleton v-else class="w-full h-full" />
                    </template>
                    <template #fallback>
                        <USkeleton class="w-full h-full" />
                    </template>
                </Suspense>
            </div>
        </div>
        <KLine class="grow-1 h-min-[280px]" v-if="currentPool" :pool-id="currentPool.pool_id" />
    </div>

</template>

<script setup lang="ts">
import KLine from '~/components/trade/k-line.client.vue'
import PoolSelector from '~/components/trade/pool-selector.vue'
import OrderPanel from '~/components/trade/order-panel.vue'
import TopBid from '~/components/trade/top-bid.vue'
definePageMeta({
    layout: 'with-dock',
    middleware: 'auth'
})

const currentPool = ref<DeepbookPoolInfo | undefined>(undefined)





</script>