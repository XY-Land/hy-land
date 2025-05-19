<template>
    <UContainer as="main" class="p-4 pb-16 min-h-dvh">
        <slot />
    </UContainer>
    <DockBar />
</template>

<script lang="ts" setup>
import DockBar from '~/components/layout/dock-bar.vue';
</script>
