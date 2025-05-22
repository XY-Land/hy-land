<script lang="ts" setup>
import { Transaction } from '@mysten/sui/transactions';
import { TransferCoinProps } from './type';

const emit = defineEmits<{
    close: [boolean]
}>()

const props = defineProps(
    TransferCoinProps
)

// const { fundingAssets, tradingAssets } = toRefs(props)
// const fundingAssets = useFundingAssets()
// const tradingAssets = useTradingAssets()

const tabs = ref([
    {
        label: 'To Another Wallet',
        icon: 'material-symbols:wallet',
        value: 'another-wallet',
        description: 'transfer to another wallet',
    }
])

if (props.showTradingAccount) {
    tabs.value.push({
        label: 'To Trading Account',
        icon: 'arcticons:ks-trade-plus',
        value: 'trading-account',
        description: 'transfer to your trading account',
    })
}

if (props.showFundingAccount) {
    tabs.value.push({
        label: 'To Funding Account',
        icon: 'material-symbols:wallet',
        value: 'funding-account',
        description: 'transfer to your funding account',
    })
}

const currentTab = ref<'trading-account' | 'another-wallet' | 'funding-account'>('another-wallet')
const receiver = ref<'trading-account' | 'funding-account' | string>('')

watch(currentTab, (val) => {
    switch (val) {
        case 'trading-account':
            receiver.value = 'trading-account'
            break
        case 'funding-account':
            receiver.value = 'funding-account'
            break
        case 'another-wallet':
            receiver.value = ''
            break
    }
})

const amountFormated = ref(0)

const maxAmountFormated = computed(() => {
    const balance = props.balanceInfo
    return Number(formatFromDecimals(
        balance.totalBalance,
        balance.coinDecimals
    ))
})

const toast = useToast()
const chainAccount = useChainAccount()
const dbc = useDeepbookClient()
const tradingAccount = useTradingAccount()

async function doTransfer() {
    if (!chainAccount.address.value) return

    const tx = new Transaction()

    const coins = await props.resolve(
        tx, 
        BigInt(Math.floor(amountFormated.value * 10 ** props.balanceInfo.coinDecimals))
    )
    
    if (currentTab.value === 'another-wallet') {
        if (!receiver.value) {
            toast.add({
                title: 'Please enter the receiver address',
                color: 'error',
            })
            return
        }

        tx.transferObjects([coins as any], receiver.value)
    } else if (currentTab.value === 'funding-account') {
        // self-transfer
        tx.transferObjects([coins as any], chainAccount.address.value)
    } else if (currentTab.value === 'trading-account') {
        if (!tradingAccount || !tradingAccount.value || !tradingAccount.value.address) {
            toast.add({
                title: 'Trading account not found',
                color: 'error',
            })
            return
        }

        tx.moveCall({
            package: `${dbc.$config.DEEPBOOK_PACKAGE_ID}`,
            module: 'balance_manager',
            function: 'deposit',
            arguments: [
                tx.object(tradingAccount.value.address),
                coins as any,
            ],
            typeArguments: [
                props.balanceInfo.coinType
            ]
        })
    }

    await chainAccount.signAndExecuteTransaction({
        tx,
    })

    // // refresh assets
    // if (currentTab.value === 'trading-account') {
    //     tradingAssets.value.execute()
    // } else if (currentTab.value === 'funding-account') {
    //     fundingAssets.value.execute()
    // }

    emit('close', true)
}
</script>
<template>
    <UModal :close="{ onClick: () => emit('close', false) }" :title="`Transfer coin ${balanceInfo.coinSymbol}`">
        <template #body>
            <div class="w-full flex flex-col gap-4">
                <UTabs :content="true" v-model:model-value="currentTab" size="xs" :items="tabs" color="secondary">
                    <template #content="{ item }">
                        <UInput v-model:model-value="receiver" icon="material-symbols:wallet" class="w-full"
                            v-if="item.value === 'another-wallet'" name="wallet address" placeholder="0x......" />
                    </template>
                </UTabs>

                <div class="flex gap-2 items-center">
                    <span>{{ balanceInfo.coinSymbol }} </span>
                    <UInputNumber class="grow-1" name="amount" v-model:model-value="amountFormated"
                        
                    placeholder="specify your amount" :min="0" :max="maxAmountFormated">
                    </UInputNumber>
                </div>
                <USlider tooltip v-model:model-value="amountFormated" :min="0" :max="maxAmountFormated"
                    :step="0.0001" />

                <UButton :disabled="!amountFormated || amountFormated <= 0" block size="lg" @click="doTransfer">
                    Do It!
                </UButton>
            </div>

        </template>
    </UModal>
</template>
