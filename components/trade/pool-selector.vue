<script lang="ts" setup>
const props = defineProps({
    modelValue: {
        type: Object as PropType<DeepbookPoolInfo | undefined>,
    }
})

const modelValue = useVModel(props, 'modelValue')

const emit = defineEmits<{
    (e: 'update:modelValue', value: DeepbookPoolInfo): void
}>()

const pools = useDeepbookPools()
const { data, pending } = pools

const items = computed(() => {
    return data.value?.map(pool => ({
        label: pool.pool_name,
        value: pool
    }))
})

onMounted(async () => {
    await pools
    if (!props.modelValue && data.value) {
        const item = data.value.find(item => item.pool_name === 'SUI_USDC')
        if (item) {
            emit('update:modelValue', item)
        }
    }
    
})
</script>

<template>
    <USelectMenu v-model:model-value="modelValue" :search-input=true value-key="value" :items="items"
        :loading="pending" :disabled="pending" 
        variant="ghost"
    />
</template>
