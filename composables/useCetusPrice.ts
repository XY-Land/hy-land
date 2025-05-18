import type { KLineData } from "klinecharts"

export type TimeframeType = '1min' | '5min' | '10min' | '30min' | 'hour' | '4hour'

interface ResponseType {
    code: number
    msg: string | 'success'
    data: {
        lists: PriceItemType[]
    }
}

export interface PriceItemType {
    open: string
    high: string
    low: string
    settle: string
    avg: string
    timestamp: number
}

function mapToKLineData(item: PriceItemType): KLineData {
    return {
        close: Number(item.settle),
        high: Number(item.high),
        low: Number(item.low),
        open: Number(item.open),
        timestamp: item.timestamp * 1000,
    }
}

export async function useCetusPrice(params: {
    poolId: string,
    timeframe: TimeframeType,
    startTimestamp: number,
    endTimestamp: number
}) {
    const { poolId, timeframe, startTimestamp, endTimestamp } = params

    const { data, msg, code } = await $fetch<ResponseType>('https://api-sui.cetus.zone/v3/sui/deepbookv3/prices', {
        params: {
            date_type: timeframe,
            start_timestamp: startTimestamp,
            end_timestamp: endTimestamp,
            address: poolId
        },
    })
    
    if (msg !== 'success') {
        throw new Error('Failed to fetch price: ' + code)
    }

    return data.lists.map(mapToKLineData)
}