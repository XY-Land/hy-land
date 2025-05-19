<template>
    <div v-bind="$attrs" class="my-4 flex flex-col gap-4">
        <template v-if="isLoading || !balances">
            <USkeleton class="h-40 w-full" />
        </template>
        <template v-else>
            <CommonClipboardInput disabled :value="'Balance Manager: ' + `${tradingAccount?.address}`" />
            <template v-if="!tradingAccount || !tradingAccount.address">
                <UButton @click="createTradingAccount" color="secondary" variant="subtle" size="lg">
                    You don't have a trading account yet. Create one now.
                </UButton>
            </template>
            <template v-else>
                <MeAssetsItems @refresh="refresh" :balances="balances" :create-resolve-coin-to-transfer="createResolveCoinToTransfer"
                    show-funding-account-in-modal />
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { Transaction } from '@mysten/sui/transactions'
import type { BalanceInfo } from './type'
import { USkeleton } from '#components'

const client = useSuiClient()
const chainAccount = useChainAccount()
const dbc = useDeepbookClient()
const tradingAccount = useTradingAccount()

const { state: balances, isLoading, execute: refresh } = useTradingAssets()
onMounted(refresh)
// const { state: balances, isLoading, execute: refresh } = useAsyncState<BalanceInfo[]>(async () => {
//     if (!tradingAccount || !tradingAccount.value.balanceContainerId) {
//         return []
//     }
//     let cursor: string | undefined = undefined
//     let dfs: DynamicFieldInfo[] = []
//     do {
//         const rst = await client.getDynamicFields({
//             parentId: tradingAccount.value.balanceContainerId,
//             cursor,
//         })

//         if (rst.hasNextPage && rst.nextCursor) {
//             cursor = rst.nextCursor
//         } else {
//             cursor = undefined
//         }

//         dfs.push(...rst.data)
//     } while (cursor)

//     let balances: BalanceInfo[] = []
//     for (const df of dfs) {
//         const rst = await client.getDynamicFieldObject({
//             parentId: tradingAccount.value.balanceContainerId,
//             name: df.name,
//         })
//         if (rst.error || !rst.data) {
//             continue
//         }

//         if (!rst.data.content || rst.data.content.dataType !== 'moveObject') {
//             continue
//         }

//         const testCoinType = /balance_manager::BalanceKey<(.*)>/gm.exec(
//             (rst.data.content.fields as any).name.type
//         )
//         if (!testCoinType?.[1]) {
//             continue
//         }

//         const coinType = testCoinType[1]
//         const balanceValue = BigInt((rst.data.content.fields as any).value)

//         const coinMetadata = await client.getCoinMetadata({
//             coinType,
//         })
//         if (!coinMetadata) {
//             continue
//         }

//         balances.push({
//             coinDecimals: coinMetadata.decimals,
//             coinName: coinMetadata.name,
//             coinSymbol: coinMetadata.symbol,
//             coinType,
//             totalBalance: balanceValue,
//         })
//     }


//     return balances
// }, [])

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

if (tradingAccount && tradingAccount.value.address && !tradingAccount.value.balanceContainerId) {
    // 有地址，但是没有容器ID，找一下容器 id 补全
    await findBalanceContainerId(tradingAccount.value.address)
}

async function findBalanceContainerId(address: string) {
    if (!tradingAccount || !tradingAccount.value.address) {
        return
    }

    const manager = await client.getObject({
        id: tradingAccount.value.address,
        options: {
            showContent: true,
        }
    })

    if (manager.error || !manager.data || !manager.data.content || manager.data.content.dataType !== 'moveObject') {
        throw new Error('Failed to load balance manager')
    }

    tradingAccount.value.balanceContainerId = (manager.data.content.fields as any).balances.fields.id.id as string
}

async function createTradingAccount() {

    const factory = dbc.balanceManager.createAndShareBalanceManager()
    const tx = new Transaction()
    factory(tx)
    const rst = await chainAccount.signAndExecuteTransaction({
        tx,
        executingOptions: {
            showEvents: true,
        }
    })

    if (!rst.events) {
        throw new Error('No events on transaction')
    }

    for (const event of rst.events) {
        if (event.parsedJson && (event.parsedJson as any).balance_manager_id) {
            tradingAccount!.value.address = (event.parsedJson as any).balance_manager_id
            break
        }
    }
}
</script>
