<script lang="ts" setup>

import {  } from '@mysten/wallet-standard'
</script>

<template>
    <UCard variant="soft">
        <template #header>
            by social account
        </template>
        <template #default>
            <div class="flex gap-4">
                <UButton disabled size="xl" variant="ghost" color="neutral">
                    <UIcon name="logos:google-icon" />
                    Google
                </UButton>
                <UButton disabled size="xl" variant="ghost" color="neutral">
                    <UIcon v-color-invert name="logos:apple" />
                    Apple
                </UButton>
                <!-- <UButton size="xl" variant="ghost" color="neutral">
                    <UIcon v-color-invert name="logos:github-icon" />
                    GitHub
                </UButton> -->
            </div>
        </template>
    </UCard>
</template>
