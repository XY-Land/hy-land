<script lang="ts" setup>
import { getWallets, type Wallet, isSuiChain, type WalletWithRequiredFeatures, isWalletWithRequiredFeatureSet, WalletStandardError } from '@mysten/wallet-standard'
import { LegacyChainAccountResolver } from '~/utils/sui/accountResolver/leagcy'

const emit = defineEmits(['success'])

const toast = useToast()
const walletApi = getWallets()
const wallets = shallowRef<WalletWithRequiredFeatures[]>([])
const requiredFeatures = ['standard:connect', 'sui:signPersonalMessage', 'sui:signTransaction']
const chainAccount = useChainAccount()

function loadWallets() {
    // sui:signPersonalMessage standard:connect
    wallets.value = walletApi.get().filter(wallet =>
        wallet.chains.some(chain => isSuiChain(chain))
        && isWalletWithRequiredFeatureSet(wallet, requiredFeatures)
    ) as WalletWithRequiredFeatures[]
}

async function connect(wallet: WalletWithRequiredFeatures) {
    try {
        await wallet.features['standard:connect'].connect()
        chainAccount.setProvider(new LegacyChainAccountResolver(wallet))
        emit('success')
    } catch (error) {
        if (error instanceof WalletStandardError) {
            toast.add({
                'title': 'Failed to connect',
                'description': error.message,
                'color': 'error',
            })
        }
    }
}

onMounted(() => {
    walletApi.on('register', () => loadWallets())
    loadWallets()
})
</script>

<template>
    <UCard variant="soft">
        <template #header>
            By Legacy Wallet
        </template>
        <template #default>
            <template v-if="wallets.length > 0">
                <div class="flex gap-4">
                    <UButton v-for="wallet in wallets" :key="wallet.id ?? wallet.name" size="xl" variant="ghost"
                        color="neutral" @click="connect(wallet)">
                        <img class="h-6" :src="wallet.icon" :alt="wallet.name">
                        {{ wallet.name }}
                    </UButton>
                </div>
            </template>
            <template v-else>
                <span class="text-sm text-gray-500">No legacy wallets found</span>
            </template>
        </template>
    </UCard>
</template>
