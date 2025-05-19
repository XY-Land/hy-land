export type DeepbookPoolInfo = {
    pool_id: string,
    pool_name: string,
    base_asset_id: string,
    base_asset_decimals: number,
    base_asset_symbol: string,
    base_asset_name: string,
    quote_asset_id: string,
    quote_asset_decimals: number,
}

export default function(){
    return useFetch<DeepbookPoolInfo[]>('https://deepbook-indexer.mainnet.mystenlabs.com/get_pools')
}