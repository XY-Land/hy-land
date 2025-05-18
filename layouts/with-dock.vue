<template>
    <UApp>
        <UContainer as="main" class="p-4 pb-16 min-h-dvh">
            <slot />
        </UContainer>
        <DockBar />
    </UApp>
</template>

<script lang="ts" setup>
import DockBar from '~/components/layout/dock-bar.vue';
</script>
