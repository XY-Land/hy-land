import type {
    WalletWithRequiredFeatures,
    WalletAccount,
} from "@mysten/wallet-standard";
import { BaseChainAccountResolver } from "./base";
import type { Transaction } from "@mysten/sui/transactions";

export class LegacyChainAccountResolver extends BaseChainAccountResolver {
    override readonly scheme = "legacy" as const;
    override readonly label: ComputedRef<string | undefined>;
    override readonly icon: ComputedRef<string>;
    override readonly address: ComputedRef<string>;
    override readonly accounts: ComputedRef<string[]>;

    private currentAccount: Ref<WalletAccount>;

    private wallet: WalletWithRequiredFeatures;

    constructor(wallet: WalletWithRequiredFeatures) {
        super();

        this.wallet = wallet;
        this.currentAccount = shallowRef(wallet.accounts[0]);
        this.label = computed(() => this.currentAccount.value.label);
        this.icon = computed(
            () => this.currentAccount.value.icon ?? wallet.icon
        );
        this.address = computed(() => this.currentAccount.value.address);
        this.accounts = computed(() =>
            wallet.accounts.map((account) => account.address)
        );
    }

    override async signMessage(message: string | Uint8Array) {
        return await this.wallet.features[
            "sui:signPersonalMessage"
        ]!.signPersonalMessage({
            account: this.currentAccount.value,
            message:
                typeof message === "string"
                    ? new TextEncoder().encode(message)
                    : message,
        });
    }

    override async signTransaction(tx: Transaction) {
        const network = useAppConfig().suiNetwork;
        return await this.wallet.features[
            "sui:signTransaction"
        ]!.signTransaction({
            account: this.currentAccount.value,
            transaction: tx,
            chain: `sui:${network}`,
        });
    }

    override async disconnect(): Promise<void> {
        await this.wallet.features["standard:disconnect"]?.disconnect();
        this.wallet.features["sui:reportTransactionEffects"];
    }

    override async switch(address: string): Promise<void> {
        if (!this.accounts.value.some((account) => account === address)) {
            throw new Error("Account not found");
        }

        this.currentAccount.value = this.wallet.accounts.find(
            (account) => account.address === address
        )!;
    }
}
