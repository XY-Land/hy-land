<script lang="ts" setup>
import { init, dispose, type Chart, type LoadDataCallback } from 'klinecharts'

const props = defineProps({
    poolId: {
        default: '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407',
        type: String
    },
    timeframe: {
        default: '1min',
        type: String as PropType<'1min' | '5min' | '10min' | '30min' | 'hour' | '4hour'>
    }
})

const klineChart = useTemplateRef('kline-chart')
const chart = ref<Chart | null>(null)

const loadMore: LoadDataCallback = ({
    callback,
    data,
    type
}) => {

    console.log('load more:', data, type);

    if (type === 'forward') {
        // 加载之前的数据
        const { from, to } = getLoadingTimeRange(100, data!.timestamp)
        useCetusPrice({
            endTimestamp: to,
            startTimestamp: from,
            poolId: props.poolId,
            timeframe: props.timeframe
        }).then(prices => {
            callback(prices, true)
        })
    } else {
        // 加载之后的数据
        callback([])
    }
}

onMounted(() => {
    const chart_ = init(klineChart.value!, {
        // locale: 'en-US',
        // timezone: 'Asia/Shanghai'
        styles: {
            grid: {
                show: false,
                horizontal: { show: false },
                vertical: { show: false }
            }
        }
    })
    chart_?.setPrecision({
        price: 6
    })
    chart.value = chart_

    chart_?.setLoadMoreDataCallback(loadMore)
})

onUnmounted(() => {
    dispose(klineChart.value!)
})

/// 计算需要加载的数据时间范围，根据当前时间，和 timeframe，计算出需要加载的数据timestamp范围
function getLoadingTimeRange(
    // 需要加载的蜡烛数量
    candleAmount: number = 100,
    startTimestamp?: number,
): {
    from: number,
    to: number
} {
    const now = startTimestamp ?? Math.floor(Date.now() / 1000)
    const timeframeMap = {
        '1min': 60,
        '5min': 300,
        '10min': 600,
        '30min': 1800,
        'hour': 3600,
        '4hour': 14400
    }
    const timeframeSeconds = timeframeMap[props.timeframe]
    const from = now - timeframeSeconds * candleAmount
    const to = now
    return { from, to }
}

watchEffect(async () => {
    if (!chart.value) return

    // load first data
    const { from, to } = getLoadingTimeRange()
    const prices = await useCetusPrice({
        endTimestamp: to,
        startTimestamp: from,
        poolId: props.poolId,
        timeframe: props.timeframe
    })

    chart.value.applyNewData(prices, {
        forward: true,
        backward: false,
    })
})

</script>

<template>
    <div v-bind="$attrs" ref="kline-chart" class="w-full" />
</template>