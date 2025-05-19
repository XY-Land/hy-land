import type { Transaction } from "@mysten/sui/transactions";
import type { SuiClient, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import type { BaseChainAccountResolver } from "~/utils/sui/accountResolver/base";

export const chainAccountSymbol: InjectionKey<ChainAccount> =
    Symbol("chainAccount");

export class ChainAccount<
    T extends BaseChainAccountResolver = BaseChainAccountResolver
> {
    private provider: Ref<T | undefined>;
    readonly client: SuiClient;
    readonly address: ComputedRef<string | undefined>;
    readonly accounts: ComputedRef<string[] | undefined>;
    readonly scheme: ComputedRef<string | undefined>;
    readonly isConnected: ComputedRef<boolean>;
    readonly icon: ComputedRef<string | undefined>;
    readonly label: ComputedRef<string | undefined>;
    readonly signMessage: T["signMessage"];
    readonly signTransaction: T["signTransaction"];
    readonly switch: T["switch"];
    readonly disconnect: T["disconnect"];

    private proxyCall<K extends keyof T>(name: K): T[K] {
        return ((...args: any[]) => {
            if (!this.provider || !this.provider.value) {
                throw new Error("No chain account provider found");
            }

            return ((this.provider.value as any)[name] as any)(...args);
        }) as any;
    }

    constructor(opts: {
        client: SuiClient
    }) {
        this.client = opts.client;
        this.provider = shallowRef(undefined);
        this.isConnected = computed(() => !!this.provider.value);
        this.address = computed(() => this.provider.value?.address.value);
        this.scheme = computed(() => this.provider.value?.scheme);
        this.accounts = computed(() => this.provider.value?.accounts.value);
        this.icon = computed(() => this.provider.value?.icon.value);
        this.label = computed(() => this.provider.value?.label.value);

        this.signMessage = this.proxyCall("signMessage");
        this.signTransaction = this.proxyCall("signTransaction");
        this.switch = this.proxyCall("switch");
        this.disconnect = this.proxyCall("disconnect");
    }

    public async signAndExecuteTransaction(opts: {
        tx: Transaction;
        executingOptions?: SuiTransactionBlockResponseOptions;
    }) {
        const { tx, executingOptions } = opts;

        const toast = useToast();

        if (!this.provider.value) {
            toast.add({
                title: "No chain account provider found",
                description: "Please connect to a chain account first",
                color: "error",
            });
            throw new Error("No chain account provider found");
        }

        try {
            toast.add({
                id: "executing-transaction",
                title: "Executing transaction...",
                avatar: {
                    class: "animate-spin",
                    icon: "i-heroicons-arrow-path-rounded-square",
                },
                type: "background",
                duration: 0,
            });
            const signedTx = await this.provider.value.signTransaction(tx);
            toast.remove("executing-transaction");
            return await this.client.executeTransactionBlock({
                signature: signedTx.signature,
                transactionBlock: signedTx.bytes,
                options: executingOptions,
            });
        } catch (error) {
            toast.add({
                title: "Failed to execute transaction",
                description: error instanceof Error ? error.message : "Unknown error",
                color: "error",
            })
            toast.remove("executing-transaction");
            throw error;
        }
    }

    public setProvider(provider: T) {
        this.provider.value = provider;
    }
}

export function useChainAccount() {
    const chainAccount = inject(chainAccountSymbol);

    if (!chainAccount) {
        throw new Error("No chain account provider found");
    }

    return chainAccount;
}
