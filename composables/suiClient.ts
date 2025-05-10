import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'

export const suiClientSymbol: InjectionKey<SuiClient> = Symbol('suiClient')

export function createSuiClient() {
    const network = useAppConfig().suiNetwork

    return new SuiClient({
        url: getFullnodeUrl(network)
    })
}

export function useSuiClient(): SuiClient {
    return inject(suiClientSymbol)!
}