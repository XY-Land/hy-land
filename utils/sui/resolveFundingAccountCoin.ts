import type { SuiClient } from "@mysten/sui/client";
import type { Transaction } from "@mysten/sui/transactions";
import type { BalanceInfo } from "~/components/me/type";

/**
 * 合并账户内的 coin，返回指定金额的 coin
 */
export async function resolveFundingAccountCoin(opts: {
    address: string,
    coinType: string,
    amount: string | number | bigint,
    balanceInfo: BalanceInfo
    client: SuiClient
    tx: Transaction
}) {
    const { address, coinType, balanceInfo, client, tx } = opts
    const amount = BigInt(opts.amount)

    if (!address) {
        throw new Error('No account logged in!')
    }

    if (amount > balanceInfo.totalBalance) {
        throw new Error('Insufficient balance!')
    }

    // 如果coinType是SUI，特殊处理
    if (coinType === '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI') {
        return tx.splitCoins(
            tx.gas,
            [amount]
        )[0]
    }

    // 找到所有coin-obj，合并之
    let coinObjs: string[] = []
    let cursor: string | undefined = undefined
    do {
        const rst = await client.getCoins({
            owner: address,
            coinType: balanceInfo.coinType,
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

    console.log('coinobjs length', coinObjs.length);

    if (coinObjs.length === 1) {
        return tx.splitCoins(tx.object(coinObjs[0]), [amount])[0]
    } else {
        const [primary, ...others] = coinObjs.map(coin => tx.object(coin))
        tx.mergeCoins(primary, others)
        return tx.splitCoins(primary, [amount])[0]
    }
}