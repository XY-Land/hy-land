<template>
    <UInput v-bind="$attrs" :disabled="disabled" :value="value">
        <template v-if="value?.length" #trailing>
            <UTooltip :text="tooltipText" :content="{ side: 'right' }">
                <UButton
                    :color="copied ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard"
                />
            </UTooltip>
        </template>
    </UInput>
</template>

<script lang="ts" setup>
interface Props {
    value?: string
    disabled?: boolean
    tooltipText?: string
    copyTimeout?: number
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    tooltipText: 'Copy to clipboard',
    copyTimeout: 2000
})

const copied = ref(false)

function copyToClipboard() {
    if (!props.value) return
    
    navigator.clipboard.writeText(props.value)
    copied.value = true

    setTimeout(() => {
        copied.value = false
    }, props.copyTimeout)
}
</script> 