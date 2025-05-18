<script lang="ts" setup>
type ValueType = {
    poolKey: string,
    poolId: string
}

defineProps({
    selectedPool: {
        type: Object as PropType<ValueType>,
        required: true
    }
})

const emit = defineEmits<{
    (e: 'update:selectedPool', value: ValueType): void
}>()

const { data, pending } = useDeepbookPools()

const items = computed(() => {
    return data.value?.map(pool => ({
        label: pool.pool_name,
        value: {
            poolKey: pool.pool_name,
            poolId: pool.pool_id
        }
    }))
})
</script>

<template>
    <USelectMenu :search-input=true :default-value="selectedPool" value-key="value" @update:model-value="emit('update:selectedPool', $event)" :items="items"
        :loading="pending" :disabled="pending" 
        variant="ghost"
    />
</template>
