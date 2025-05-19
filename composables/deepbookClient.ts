import { DeepBookClient, DeepBookConfig } from '@mysten/deepbook-v3'
import type { SuiClient } from '@mysten/sui/client'


class CustomDeepBookClient extends DeepBookClient {
    readonly $config: DeepBookConfig

    constructor(options: {
        address: string,
        env: 'mainnet' | 'testnet'
        client: SuiClient
    }) {
        super(options)
        this.$config = new DeepBookConfig(options)
    }

    
}

export function useDeepbookClient() {
    const suiClient = useSuiClient()
    const network = useAppConfig().suiNetwork
    const chainAccount = useChainAccount()

    if (!chainAccount.isConnected.value) {
        throw new Error('Chain account is not connected')
    }

    return new CustomDeepBookClient({
        client: suiClient,
        env: network as any,
        address: chainAccount.address.value!
    })
}