<script lang="ts" setup>
const items = [
    { label: 'Buy', value: 'buy' },
    { label: 'Sell', value: 'sell' }
]
const direction = ref<'buy' | 'sell'>('buy')

const orderType = ref<'market' | 'limit'>('market')
const orderPrice = ref<number | 'market'>(0)
const orderAmount = ref(0)

watchEffect(() => {
    if (orderType.value === 'market') {
        orderPrice.value = 'market'
    }
})

const color = computed(() => direction.value === 'buy' ? 'success' : 'error')
</script>
<template>
    <div class="flex flex-col gap-4">
        <UTabs v-model:model-value="direction" :items="items" :color="color"
            :content="false" class="select-none" />
        <UInputMenu v-model:model-value="orderType" class="select-none" default-value="market" disabled :items="['market', 'limit']" />
        <div class="w-full flex flex-col gap-2">
            <div class="text-sm text-gray-500">price</div>
            <UInput :disabled="orderType === 'market'" :color="color" v-model:model-value="orderPrice" placeholder="price" :step="0.1" />
        </div>
        <div class="w-full flex flex-col gap-2">
            <div class="text-sm text-gray-500">amount</div>
            <UInputNumber :color="color" v-model:model-value="orderAmount" placeholder="amount" :step="0.1" />
            <USlider class="mt-1" :color="color" v-model:model-value="orderAmount" :min="0" :max="100" :step="0.1" />
        </div>
        <div class="">
            <div>available: 100</div>
            <div>estimated: 100</div>
        </div>
        <UButton class="mt-2" size="xl" :color="color" block >
            {{ direction === 'buy' ? 'Buy' : 'Sell' }}
        </UButton>
    </div>
</template>
