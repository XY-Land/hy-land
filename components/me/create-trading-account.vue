<template>
    <div class="flex flex-col gap-2">
        <span class="text-sm text-neutral">
            You don't have a trading account yet.
        </span>
        <UButton block @click="createTradingAccount" color="secondary" variant="subtle" size="lg">
            Create one now.
        </UButton>
        <UInput size="lg" placeholder="or input the address of existing" v-model="inputAddress">
            <template #trailing>
                <UButton variant="link" size="lg" :disabled="!inputAddress" :loading color="secondary"
                    icon="i-heroicons-paper-airplane" aria-label="Restore trading account"
                    @click="restoreTradingAccount" />
            </template>
        </UInput>
    </div>
</template>

<script lang="ts" setup>
import { Transaction } from '@mysten/sui/transactions'

const emit = defineEmits(['refresh'])

const dbc = useDeepbookClient()
const chainAccount = useChainAccount()
const tradingAccount = useTradingAccount()
const client = useSuiClient()
const inputAddress = ref<string | undefined>()
const loading = ref(false)
const toast = useToast()

async function restoreTradingAccount() {
    if (!tradingAccount || !inputAddress.value) {
        throw new Error('Trading account not found')
    }

    loading.value = true

    try {
        const balanceContainerId = await findBalanceContainerId(inputAddress.value)
        tradingAccount.value.address = inputAddress.value
        tradingAccount.value.balanceContainerId = balanceContainerId
        // emit('refresh')
    } catch (error) {
        toast.add({
            title: 'Failed to restore trading account',
            description: error as any,
            color: 'error',
        })
    } finally {
        loading.value = false
    }
}
async function findBalanceContainerId(address: string): Promise<string> {

    const manager = await client.getObject({
        id: address,
        options: {
            showContent: true,
        }
    })

    if (manager.error || !manager.data || !manager.data.content || manager.data.content.dataType !== 'moveObject') {
        throw new Error(`Failed to load balance manager, ${manager.error}`)
    }
    return (manager.data.content.fields as any).balances.fields.id.id as string
}

async function createTradingAccount() {

    const factory = dbc.balanceManager.createAndShareBalanceManager()
    const tx = new Transaction()
    factory(tx)
    const rst = await chainAccount.signAndExecuteTransaction({
        tx,
        executingOptions: {
            showEvents: true,
        }
    })

    if (!rst.events) {
        throw new Error('No events on transaction')
    }

    for (const event of rst.events) {
        if (event.parsedJson && (event.parsedJson as any).balance_manager_id) {
            tradingAccount!.value.address = (event.parsedJson as any).balance_manager_id
            break
        }
    }
}

</script>