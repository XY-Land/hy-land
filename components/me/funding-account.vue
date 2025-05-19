<script lang="ts" setup>
import type { Transaction } from '@mysten/sui/transactions'
import type { BalanceInfo } from './type'
const { address } = useChainAccount()
const client = useSuiClient()

const { state: balances, execute: refresh, isLoading } = useAsyncState<BalanceInfo[]>(async (): Promise<BalanceInfo[]> => {
    const rst: BalanceInfo[] = []

    if (!address.value) return []

    const balances = await client.getAllBalances({
        owner: address.value
    })

    for (const balance of balances) {
        const metadata = await client.getCoinMetadata({
            coinType: balance.coinType
        })

        if (!metadata) continue

        rst.push({
            coinType: balance.coinType,
            coinIcon: metadata.iconUrl,
            coinSymbol: metadata.symbol,
            coinName: metadata.name,
            coinDecimals: metadata.decimals,
            totalBalance: BigInt(balance.totalBalance)
        })
    }

    return rst
}, [])

watch(address, () => refresh())


function createResolveCoinToTransfer(balance: BalanceInfo) {

    return async (tx: Transaction, amount: bigint) => {
        if (!address.value) {
            throw new Error('No account logged in!')
        }

        if (amount > balance.totalBalance) {
            throw new Error('Insufficient balance!')
        }

        // 找到所有coin-obj，合并之
        let coinObjs: string[] = []
        let cursor: string | undefined = undefined
        do {
            const rst = await client.getCoins({
                owner: address.value,
                coinType: balance.coinType,
                cursor,
            })

            if (rst.hasNextPage && rst.nextCursor) {
                cursor = rst.nextCursor
            } else {
                cursor = undefined
            }

            rst.data.forEach(coin => coinObjs.push(coin.coinObjectId))
        } while (cursor)

        if (coinObjs.length === 0) {
            throw new Error('No coins found!')
        }

        if (coinObjs.length === 1) {
            return tx.splitCoins(tx.object(coinObjs[0]), [amount])[0]
        } else {
            const [primary, ...others] = coinObjs
            return tx.splitCoins(
                tx.mergeCoins(primary, others),
                [amount]
            )[0]
        }
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
