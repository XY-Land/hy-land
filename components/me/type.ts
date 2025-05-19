import type { Transaction, TransactionInput, TransactionResult } from "@mysten/sui/transactions"

export type BalanceInfo = {
    coinType: string
    coinIcon?: string | null
    coinSymbol: string
    coinName: string
    coinDecimals: number
    totalBalance: bigint
}

export const TransferCoinProps = {
    balanceInfo: {
        type: Object as PropType<BalanceInfo>,
        required: true,
    },
    resolve: {
        type: Function as PropType<(tx: Transaction, amount: bigint) => Promise<TransactionInput | TransactionResult>>,
        required: true,
    },
    showTradingAccount: {
        type: Boolean,
        default: false,
    },
    showFundingAccount: {
        type: Boolean,
        default: false,
    }
} as const