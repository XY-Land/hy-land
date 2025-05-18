import { DeepBookClient } from '@mysten/deepbook-v3'

export function useDeepbookClient() {
    const suiClient = useSuiClient()
    const network = useAppConfig().suiNetwork
    const chainAccount = useChainAccount()

    if (!chainAccount.isConnected.value) {
        throw new Error('Chain account is not connected')
    }

    return new DeepBookClient({
        client: suiClient,
        env: network as any,
        address: chainAccount.address.value!
    })
}