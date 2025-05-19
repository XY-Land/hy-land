<script lang="ts" setup>
import type { Transaction } from '@mysten/sui/transactions'
import type { BalanceInfo } from './type'
import { resolveFundingAccountCoin } from '~/utils/sui/resolveFundingAccountCoin'
const { address } = useChainAccount()
const client = useSuiClient()

const { state: balances, execute: refresh, isLoading } = useFundingAssets()
onMounted(refresh)

watch(address, () => refresh())


function createResolveCoinToTransfer(balance: BalanceInfo) {

    return async (tx: Transaction, amount: bigint) => {
        if (!address.value) {
            throw new Error('No account logged in!')
        }

        await resolveFundingAccountCoin({
            address: address.value,
            coinType: balance.coinType,
            amount,
            balanceInfo: balance,
            client,
            tx
        })
    }

}

</script>
<template>
    <div v-bind="$attrs" class="my-4 flex flex-col gap-4">
        <template v-if="isLoading">
            <USkeleton class="w-full h-40" />
        </template>

        <template v-else>
            <MeAssetsItems @refresh="refresh" :balances="balances" :create-resolve-coin-to-transfer="createResolveCoinToTransfer"
                show-trading-account-in-modal />
        </template>
    </div>
</template>
