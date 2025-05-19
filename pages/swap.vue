<template>
    <div class="flex flex-col h-full grow-1">
        <h1 class="text-lg mx-auto">Flush Swap</h1>
        <USkeleton class="grow-1" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'with-dock',
    middleware: 'auth'
})
</script>