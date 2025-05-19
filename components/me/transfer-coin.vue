<script lang="ts" setup>
import { TransferCoinProps } from './type'
import Modal from './transfer-coin-modal.vue'

const props = defineProps(TransferCoinProps)
const emit = defineEmits(['sucess', 'failed'])
const overlay = useOverlay()

const showModal = async () => {
    const instance = overlay.create(
        Modal,
        { props: props as any }
    ).open()

    if (await instance.result) {
        emit('sucess')
    } else {
        emit('failed')
    }
}

</script>
<template>
    <UButton @click="showModal" size="sm" icon="i-heroicons-arrow-right" color="secondary">Transfer</UButton>
</template>