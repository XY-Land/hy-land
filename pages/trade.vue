<template>
    <div class="flex flex-col gap-4 h-full">
        <PoolSelector class="w-full" v-model:selected-pool="selectedPool" />
        <div class="flex gap-4 w-full">
            <div class="w-2/3">
                <OrderPanel />
            </div>
            <div class="w-1/3">
                <Suspense>
                    <template #default>
                        <TopBid :pool-key="selectedPool.poolKey" />
                    </template>
                    <template #fallback>
                        <USkeleton class="w-full h-full" />
                    </template>
                </Suspense>
            </div>
        </div>
        <KLine class="sm:h-[280px] h-[480px]" :pool-id="selectedPool.poolId" />
    </div>

</template>

<script setup lang="ts">
import KLine from '~/components/trade/k-line.client.vue'
import PoolSelector from '~/components/trade/pool-selector.vue'
import OrderPanel from '~/components/trade/order-panel.vue'
import TopBid from '~/components/trade/top-bid.vue'

const selectedPool = ref({
    poolKey: 'SUI_USDC',
    poolId: '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407'
})

definePageMeta({
    layout: 'with-dock',
    middleware: 'auth'
})


</script>