import type { TransactionEffects } from "@mysten/sui/client";
import { BaseChainAccountResolver } from "./base";
import {
    BrowserPasskeyProvider,
    type BrowserPasswordProviderOptions,
    findCommonPublicKey,
    PasskeyKeypair,
} from "@mysten/sui/keypairs/passkey";
import type { Transaction } from "@mysten/sui/transactions";
import passkeyIcon from "assets/svg/passkey-icon.svg";

function getPasskeyProvider() {
    return new BrowserPasskeyProvider("xy-land passkey account", {
        rpName: "xy-land passkey auth",
        rpId: window.location.hostname,
        authenticatorSelection: {
            authenticatorAttachment: "cross-platform",
            userVerification: "preferred",
        },
    } as BrowserPasswordProviderOptions);
}

export class PasskeyChainAccountResolver extends BaseChainAccountResolver {
    override readonly scheme = "passkey" as const;
    override readonly label = computed(() => "Passkey" as const);
    override readonly icon = computed(() => passkeyIcon);
    override readonly address: ComputedRef<string>;
    override readonly accounts: ComputedRef<string[]>;

    private keypair: PasskeyKeypair;

    constructor(keypair: PasskeyKeypair) {
        super();

        this.keypair = keypair;

        this.address = computed(() => this.keypair.toSuiAddress());
        // @TODO: multiple accounts
        this.accounts = computed(() => [this.address.value]);
    }

    /** 创建一个新的 passkey 钱包 */
    public static async new() {
        const passkeyProvider = getPasskeyProvider();

        try {
            const keypair = await PasskeyKeypair.getPasskeyInstance(
                passkeyProvider
            );

            return new PasskeyChainAccountResolver(keypair);
        } catch (error) {
            useToast().add({
                title: "Failed to create passkey account",
                color: "error",
            });

            throw error;
        }
    }

    /** 从恢复 passkey 钱包 */
    public static async restore() {
        const passkeyProvider = getPasskeyProvider();

        const possiblePks = await PasskeyKeypair.signAndRecover(
            passkeyProvider,
            new TextEncoder().encode("xy-land restore account.1")
        );

        const possiblePks2 = await PasskeyKeypair.signAndRecover(
            passkeyProvider,
            new TextEncoder().encode("xy-land restore account.2")
        );

        const commonPk = findCommonPublicKey(possiblePks, possiblePks2);
        const keypair = new PasskeyKeypair(
            commonPk.toRawBytes(),
            passkeyProvider
        );

        return new PasskeyChainAccountResolver(keypair);
    }

    override async disconnect(): Promise<void> {}

    override async signMessage(message: string | Uint8Array) {
        return await this.keypair.signPersonalMessage(
            typeof message === "string"
                ? new TextEncoder().encode(message)
                : message
        );
    }

    override async signTransaction(tx: Transaction) {
        return await this.keypair.signTransaction(
            await tx.build({
                client: useSuiClient(),
                onlyTransactionKind: true,
            })
        );
    }

    // @TODO
    override async switch(_: string): Promise<void> {}

    // override async reportTransactionEffects(_: TransactionEffects): Promise<void> {}
}
