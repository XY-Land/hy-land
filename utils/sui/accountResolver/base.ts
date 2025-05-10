import type { Signer } from '@mysten/sui/cryptography'
import type { Transaction } from '@mysten/sui/transactions'


export abstract class BaseChainAccountResolver {
    abstract readonly scheme: 'legacy' | 'zklogin' | 'passkey'
    abstract readonly label: ComputedRef<string | undefined>
    abstract readonly icon: ComputedRef<string>
    abstract readonly address: ComputedRef<string>
    abstract readonly accounts: ComputedRef<string[]>
    abstract disconnect(): Promise<void>
    abstract signMessage(message: string | Uint8Array): ReturnType<Signer['signPersonalMessage']>
    abstract signTransaction(tx: Transaction): ReturnType<Signer['signTransaction']>
    abstract switch(address: string): Promise<void>
    // abstract reportTransactionEffects(effects: TransactionEffects): Promise<void>
}
