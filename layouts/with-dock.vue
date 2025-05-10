<template>
    <UApp>
        <main class="p-4 pb-16 min-h-dvh">
            <slot />
        </main>
        <DockBar />
    </UApp>
</template>

<script lang="ts" setup>
import DockBar from '~/components/layout/dock-bar.vue';
</script>
