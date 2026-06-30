<script setup lang="ts">
import type { IKeyPos, IJoystick } from '~/types'

const props = defineProps<{
    pos: IKeyPos
    js: IJoystick | null
    modeIdx: number
    selected: boolean
}>()

defineEmits<{
    click: [id: string]
}>()

const DIRS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const

function currentMode() {
    return props.js?.modes[props.modeIdx] ?? null
}

function lbl(d: string): string {
    const v = currentMode()?.dirs[d]
    if (!v || v.type === 'trans') return '·'
    return v.main
}

function isTransDir(d: string): boolean {
    const v = currentMode()?.dirs[d]
    return !v || v.type === 'trans'
}
</script>

<template>
<div
    :class="['joystick', selected ? 'selected' : '']"
    :style="{
        left: pos.x * 64 + 'px',
        top: pos.y * 64 + 'px',
        width: (pos.w ?? 2) * 64 + 'px',
        height: (pos.h ?? 2) * 64 + 'px',
        '--jc': js?.modes[modeIdx]?.color ?? '#7c8696',
    }"
    title="Joystick"
    @click="$emit('click', pos.id)"
>
    <div class="js-ring" />
    <div class="js-hub">
        <span class="js-press">{{ currentMode()?.press?.main ?? '●' }}</span>
    </div>
    <span
        v-for="d in DIRS"
        :key="d"
        :class="['jd', 'jd-' + d, isTransDir(d) ? 'jd-trans' : '']"
    >{{ lbl(d) }}</span>
    <span
        v-if="currentMode()"
        class="js-mode"
        :style="{ background: currentMode()!.color }"
    >{{ currentMode()!.name.fr }}</span>
</div>
</template>
