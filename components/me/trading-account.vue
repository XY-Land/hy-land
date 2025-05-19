<template>
    <div v-bind="$attrs" class="my-4 flex flex-col gap-4">
        <template v-if="isLoading || !balances">
            <USkeleton class="h-40 w-full" />
        </template>
        <template v-else>
            <CommonClipboardInput v-if="tradingAccount?.address" disabled :value="'Balance Manager: ' + `${tradingAccount?.address}`" />
            <template v-if="!tradingAccount || !tradingAccount.address || !tradingAccount.balanceContainerId">
                <MeCreateTradingAccount @refresh="refresh" />
            </template>
            <template v-else>
                <MeAssetsItems @refresh="refresh" :balances="balances"
                    :create-resolve-coin-to-transfer="createResolveCoinToTransfer" show-funding-account-in-modal />
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { Transaction } from '@mysten/sui/transactions'
import type { BalanceInfo } from './type'
import { USkeleton } from '#components'

const dbc = useDeepbookClient()
const tradingAccount = useTradingAccount()

const { state: balances, isLoading, execute: refresh } = useTradingAssets()
onMounted(refresh)

function createResolveCoinToTransfer(balance: BalanceInfo) {
    return async (tx: Transaction, amount: bigint) => {
        if (!tradingAccount || !tradingAccount.value || !tradingAccount.value.address) {
            throw new Error('Trading account not found')
        }

        return tx.moveCall({
            package: dbc.$config.DEEPBOOK_PACKAGE_ID,
            module: 'balance_manager',
            function: 'withdraw',
            arguments: [
                tx.object(tradingAccount.value.address),
                tx.pure.u64(amount),
            ],
            typeArguments: [balance.coinType],
        })
    }
}

</script>
