<script lang="ts" setup>

const props = defineProps({
    poolKey: {
        required: true,
        type: String
    }
})

const dbc = useDeepbookClient()

const priceColor = ref<'success' | 'error'>('success')
const midPrice = ref(0)
const bids = ref<[number, number][]>([])
const asks = ref<[number, number][]>([])

// 计算最大订单量用于进度条
const maxBidQuantity = computed(() => Math.max(...bids.value.map(bid => bid[1])))
const maxAskQuantity = computed(() => Math.max(...asks.value.map(ask => ask[1])))

watch(midPrice, (newVal, oldVal) => {
    if (newVal > oldVal) {
        priceColor.value = 'success'
    } else {
        priceColor.value = 'error'
    }
})

async function update() {
    midPrice.value = await dbc.midPrice(props.poolKey)
    const {
        ask_prices,
        ask_quantities,
        bid_prices,
        bid_quantities
    } = await dbc.getLevel2TicksFromMid(props.poolKey, 8)

    bids.value = bid_prices.map((price, index) => [price, bid_quantities[index]])
    asks.value = ask_prices.map((price, index) => [price, ask_quantities[index]])
}

useInterval(1000, {
    immediate: true,
    callback: update
})

await update()

</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-0.5 text-sm">
            <div v-for="bid in bids" :key="bid[0]"
                class="px-1 flex justify-between text-success relative overflow-hidden">
                <div class="absolute inset-0 bg-success/10" :style="{ width: `${(bid[1] / maxBidQuantity) * 100}%` }">
                </div>
                <span class="relative z-1">{{ bid[0] }}</span>
                <span class="relative z-1">{{ bid[1] }}</span>
            </div>
        </div>
        <div class="px-1 bg-neutral-900/20" :class="priceColor === 'success' ? 'text-success' : 'text-error'">
            $ {{ midPrice }}
        </div>
        <div class="flex flex-col gap-0.5 text-sm">
            <div v-for="ask in asks" :key="ask[0]"
                class="px-1 flex justify-between text-error relative overflow-hidden">
                <div class="absolute inset-0 bg-error/10" :style="{ width: `${(ask[1] / maxAskQuantity) * 100}%` }">
                </div>
                <span class="relative z-1">{{ ask[0] }}</span>
                <span class="relative z-1">{{ ask[1] }}</span>
            </div>
        </div>
    </div>
</template>
