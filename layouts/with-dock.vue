<template>
    <UContainer as="main" class="pb-16 pt-4 lg:pt-8 min-h-dvh flex flex-col">
        <slot />
    </UContainer>
    <DockBar />
</template>

<script lang="ts" setup>
import DockBar from '~/components/layout/dock-bar.vue';
</script>
