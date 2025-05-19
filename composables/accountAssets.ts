import type { BalanceInfo } from '~/components/me/type'
import type { UseAsyncStateReturn } from '@vueuse/core'
import type { DynamicFieldInfo } from '@mysten/sui/client'


export const fundingAssetsKey: InjectionKey<ReturnType<typeof createFundingAssets>> = Symbol('fundingAssets')
export const tradingAssetsKey: InjectionKey<ReturnType<typeof createTradingAssets>> = Symbol('tradingAssets')

export const createFundingAssets = () => useAsyncState<Record<string, BalanceInfo>>(async () => {
    const { address } = useChainAccount()
    const client = useSuiClient()

    const rstObj: Record<string, BalanceInfo> = {}

    if (!address.value) return {}

    const balances = await client.getAllBalances({
        owner: address.value
    })

    for (const balance of balances) {
        const metadata = await client.getCoinMetadata({
            coinType: balance.coinType
        })

        if (!metadata) continue

        rstObj[balance.coinType] = {
            coinType: balance.coinType,
            coinIcon: metadata.iconUrl,
            coinSymbol: metadata.symbol,
            coinName: metadata.name,
            coinDecimals: metadata.decimals,
            totalBalance: BigInt(balance.totalBalance)
        }
    }

    return rstObj
}, {})

export const createTradingAssets = () => useAsyncState<Record<string, BalanceInfo>>(async () => {

    const { address } = useChainAccount()
    const client = useSuiClient()
    const tradingAccount = useTradingAccount()


    if (!address.value) return {}

    if (!tradingAccount || !tradingAccount.value.balanceContainerId) {
        return {}
    }
    let cursor: string | undefined = undefined
    let dfs: DynamicFieldInfo[] = []
    do {
        const rst = await client.getDynamicFields({
            parentId: tradingAccount.value.balanceContainerId,
            cursor,
        })

        if (rst.hasNextPage && rst.nextCursor) {
            cursor = rst.nextCursor
        } else {
            cursor = undefined
        }

        dfs.push(...rst.data)
    } while (cursor)


    const rstObj: Record<string, BalanceInfo> = {}
    for (const df of dfs) {
        const rst = await client.getDynamicFieldObject({
            parentId: tradingAccount.value.balanceContainerId,
            name: df.name,
        })
        if (rst.error || !rst.data) {
            continue
        }

        if (!rst.data.content || rst.data.content.dataType !== 'moveObject') {
            continue
        }

        const testCoinType = /balance_manager::BalanceKey<(.*)>/gm.exec(
            (rst.data.content.fields as any).name.type
        )
        if (!testCoinType?.[1]) {
            continue
        }

        const coinType = testCoinType[1]
        const balanceValue = BigInt((rst.data.content.fields as any).value)

        const coinMetadata = await client.getCoinMetadata({
            coinType,
        })
        if (!coinMetadata) {
            continue
        }

        rstObj[coinType] = {
            coinDecimals: coinMetadata.decimals,
            coinName: coinMetadata.name,
            coinSymbol: coinMetadata.symbol,
            coinType,
            totalBalance: balanceValue,
        }
    }


    return rstObj
}, {})

export function useFundingAssets() {
    const rst = inject(fundingAssetsKey)
    if (!rst) {
        throw new Error('fundingAssets is not injected')
    }
    return rst
}

export function useTradingAssets() {
    const rst = inject(tradingAssetsKey)
    if (!rst) {
        throw new Error('tradingAssets is not injected')
    }
    return rst
}