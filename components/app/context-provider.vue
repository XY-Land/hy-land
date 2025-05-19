<script lang="ts" setup>
provide(fundingAssetsKey, createFundingAssets())
provide(tradingAssetsKey, createTradingAssets())

</script>

<template>
    <slot />
</template>
