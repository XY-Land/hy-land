<script lang="ts" setup>
import { Transaction } from '@mysten/sui/transactions'
import { resolveFundingAccountCoin } from '~/utils/sui/resolveFundingAccountCoin'

const props = defineProps({
    currentPool: {
        type: Object as PropType<DeepbookPoolInfo>,
        required: true
    }
})
const toast = useToast()
const chianAccount = useChainAccount()
const dbc = useDeepbookClient()
const client = useSuiClient()
const currentPool = toRef(props, 'currentPool')
const fundingAssets = useFundingAssets()

const baseAssetName = computed(() => currentPool.value.base_asset_name)
const quoteAssetName = computed(() => {
    const parts = currentPool.value.pool_name.split('_')
    const baseAssetName = currentPool.value.base_asset_symbol
    return parts.find(part => part !== baseAssetName) || parts[parts.length - 1]
})

const items = [
    { label: 'Buy', value: 'buy' },
    { label: 'Sell', value: 'sell' }
]
const direction = ref<'buy' | 'sell'>('buy')

const orderType = ref<'market' | 'limit'>('market')
const orderPrice = ref<number | 'market'>(0)
const orderAmount = ref(0)

watch(direction, () => orderAmount.value = 0)
watchEffect(() => {
    if (orderType.value === 'market') {
        orderPrice.value = 'market'
    }
})

const color = computed(() => direction.value === 'buy' ? 'success' : 'error')

const availableAmount = computed((): string => {
    const coinType = direction.value === 'buy' ? currentPool.value.base_asset_id : currentPool.value.quote_asset_id

    const assets = fundingAssets.state.value

    if (!assets || !assets[coinType]) {
        return '0'
    }
    return formatFromDecimals(assets[coinType].totalBalance, assets[coinType].coinDecimals)
})

const estimatedResult = useAsyncState(async () => {
    if (orderAmount.value === 0 || !currentPool.value) {
        return undefined
    }

    const rst = await dbc.getQuantityOut(
        currentPool.value.pool_name,
        direction.value === 'buy' ? orderAmount.value : 0,
        direction.value === 'buy' ? 0 : orderAmount.value
    )

    return rst
}, undefined)

const estimatedAmount = computed(() => {
    if (estimatedResult.state.value) {
        return Number(direction.value === 'buy' ? estimatedResult.state.value.quoteOut : estimatedResult.state.value.baseOut).toFixed(3).toString()
    }
    return '--'
})

const estimatedAmountDebounced = useDebounceFn(estimatedResult.execute, 500)
useIntervalFn(() => {
    if (orderAmount.value > 0) {
        estimatedAmountDebounced()
    }
}, 5000)
watchDebounced(orderAmount, () => {
    if (orderAmount.value > 0) {
        estimatedAmountDebounced()
    }
}, { debounce: 300 })

async function doTrade() {
    await estimatedResult.execute()

    if (!estimatedResult.state.value) {
        toast.add({
            title: 'Error',
            description: 'Failed to estimate',
            color: 'error'
        })
        return
    }

    const deepTokenType = '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
    // const deepAsset = fundingAssets.state.value[deepTokenType]
    // // 计算实际需要的deep，5% 冗余
    // const realDeepRequired = BigInt(Math.floor(estimatedResult.state.value!.deepRequired * 1000000 * 1.05))
    // if (
    //     !deepAsset
    //     || deepAsset.totalBalance < realDeepRequired
    // ) {
    //     toast.add({
    //         title: 'Error',
    //         description: 'Insufficient deep',
    //         color: 'error'
    //     })
    // }

    const realAmountIn = BigInt(
        Math.floor(orderAmount.value * 10 ** (
            direction.value === 'buy' ? currentPool.value.base_asset_decimals : currentPool.value.quote_asset_decimals
        ))
    )

    // TODO: 滑点可调
    const realEstimatedAmountOut = BigInt(
        Math.floor(Number(estimatedAmount.value) * 10 ** (
            direction.value === 'buy' ? currentPool.value.quote_asset_decimals : currentPool.value.base_asset_decimals
        ) * 0.95)
    )
    const tx = new Transaction()

    const coinIn = await resolveFundingAccountCoin({
        address: chianAccount.address.value!,
        coinType: direction.value === 'buy' ? currentPool.value.base_asset_id : currentPool.value.quote_asset_id,
        amount: realAmountIn,
        balanceInfo: fundingAssets.state.value[direction.value === 'buy' ? currentPool.value.base_asset_id : currentPool.value.quote_asset_id],
        client: client,
        tx
    })

    const zeroCoin = (tx: Transaction, coinType: string) =>
        tx.moveCall({
            target: '0x2::coin::zero',
            typeArguments: [coinType],
        })

    const [baseOut, quoteOut, deepOut] = tx.moveCall({
        package: dbc.$config.DEEPBOOK_PACKAGE_ID,
        module: 'pool',
        function: 'swap_exact_quantity',
        typeArguments: [
            currentPool.value.base_asset_id,
            currentPool.value.quote_asset_id
        ],
        arguments: [
            // self,
            tx.object(currentPool.value.pool_id),
            // base_in
            direction.value === 'buy' ? coinIn : zeroCoin(tx, currentPool.value.base_asset_id),
            // quote_in
            direction.value === 'buy' ? zeroCoin(tx, currentPool.value.quote_asset_id) : coinIn,
            // deep_in
            zeroCoin(tx, deepTokenType),
            // min_out
            tx.pure.u64(realEstimatedAmountOut),
            // clock
            tx.object.clock()
        ]
    })

    tx.transferObjects([
        baseOut,
        quoteOut,
        deepOut
    ], chianAccount.address.value!)

    console.log(await tx.toJSON());
    

    const rst = await chianAccount.signAndExecuteTransaction({ tx })
    fundingAssets.execute()
    console.log(rst)
}

</script>
<template>
    <div class="flex flex-col gap-4">
        <UTabs v-model:model-value="direction" :items="items" :color="color" :content="false" class="select-none" />
        <UInputMenu v-model:model-value="orderType" class="select-none" default-value="market" disabled
            :items="['market', 'limit']" />
        <div class="w-full flex flex-col gap-2">
            <div class="text-sm text-gray-500">Price</div>
            <UInput :disabled="orderType === 'market'" :color="color" v-model:model-value="orderPrice"
                placeholder="Price" :step="0.1" />
        </div>
        <div class="w-full flex flex-col gap-2">
            <div class="text-sm text-gray-500">Amount</div>
            <UInputNumber :disabled="availableAmount === '0'" color="secondary" v-model:model-value="orderAmount"
                placeholder="amount" :step="0.1" />
            <USlider :disabled="availableAmount === '0'" class="mt-3" color="secondary"
                v-model:model-value="orderAmount" :min="0" :max="Number(availableAmount)" :step="0.1" />
        </div>
        <div class="w-full flex flex-col text-sm">
            <div class="flex items-center gap-2">
                <span class="text-gray-500">Available: </span>
                <span class="ml-auto">{{ availableAmount }}</span>
                <span class="text-gray-500">{{
                    direction === 'buy' ? baseAssetName : quoteAssetName
                }}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-gray-500">Estimated: </span>
                <template v-if="estimatedResult.isLoading.value">
                    <USkeleton class="ml-auto w-8 h-4" />
                </template>
                <template v-else>
                    <span class="ml-auto">{{ estimatedAmount }}</span>
                </template>
                <span class="text-gray-500">{{
                    direction === 'buy' ? quoteAssetName : baseAssetName
                }}</span>
            </div>
        </div>
        <UButton :disabled="orderAmount === 0" @click="doTrade" class="mt-2" size="xl" :color="color" block>
            {{ direction === 'buy' ? 'Buy' : 'Sell' }}
        </UButton>
    </div>
</template>
