<script lang="ts" setup>
import type { Transaction } from '@mysten/sui/transactions';
import type { BalanceInfo } from './type';
const props = defineProps({
    balances: {
        type: Object as PropType<Record<string, BalanceInfo>>,
        required: true,
    },
    createResolveCoinToTransfer: {
        type: Function as PropType<(balance: BalanceInfo) => (tx: Transaction, amount: bigint) => Promise<any>>,
        required: true,
    },
    showTradingAccountInModal: {
        type: Boolean,
        default: false,
    },
    showFundingAccountInModal: {
        type: Boolean,
        default: false,
    },
})

defineEmits(['refresh'])

const balances = computed(() => Object.values(props.balances))
</script>
<template>
    <ul class="flex flex-col gap-4">
        <template v-for="balance in balances.values()" :key="balance.coinType">
            <li v-if="formatFromDecimals(balance.totalBalance, balance.coinDecimals) !== '0'" as="li" class="flex items-center justify-center gap-4 w-full">
                <template v-if="balance.coinIcon">
                    <img class="w-8 h-8 rounded-full" :src="balance.coinIcon" :alt="balance.coinType">
                </template>
                <template v-else>
                    <img class="w-8 h-8 rounded-full" src="assets/svg/default-token.svg" :alt="balance.coinType">
                </template>
                <span>{{ balance.coinSymbol }}</span>
                <span class="ml-auto">$ {{ formatFromDecimals(balance.totalBalance, balance.coinDecimals)
                    }}</span>

                <MeTransferCoin @sucess="$emit('refresh')" :showTradingAccount="showTradingAccountInModal"
                    :showFundingAccount="showFundingAccountInModal" :balance-info="balance"
                    :resolve="createResolveCoinToTransfer(balance)">
                </MeTransferCoin>
            </li>
        </template>
    </ul>
</template>
