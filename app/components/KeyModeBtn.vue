<script setup lang="ts">
import type { IKeyPos, IJoystick, II18nStrings } from '~/types'

defineProps<{
    pos: IKeyPos
    js: IJoystick | null
    modeIdx: number
    t: II18nStrings
}>()

defineEmits<{
    click: [id: string]
}>()
</script>

<template>
<div
    class="key modebtn"
    :style="{
        left: pos.x * 64 + 'px',
        top: pos.y * 64 + 'px',
        width: (pos.w ?? 1) * 64 + 'px',
        height: (pos.h ?? 1) * 64 + 'px',
        '--fc': js?.modes[modeIdx]?.color ?? '#7c8696',
    }"
    :title="t.modeBtn"
    @click="$emit('click', pos.id)"
>
    <div class="strip" />
    <div class="face">
        <span class="mb-icon">⟳</span>
        <span class="mb-name">{{ js?.modes[modeIdx]?.name.fr ?? 'Mode' }}</span>
        <span class="mb-count mono">{{ js ? (modeIdx + 1) + '/' + js.modes.length : '' }}</span>
    </div>
</div>
</template>
