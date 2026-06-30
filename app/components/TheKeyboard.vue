<script setup lang="ts">
import type { IBoard, ILayer, IKeyDef, IEncoderDef, IKeyPos, IJoystick, II18nStrings } from '~/types'

const props = defineProps<{
    board: IBoard
    layer: ILayer
    baseLayer: ILayer
    showLegends: boolean
    selectedId: string | null
    triggerIds: string[]
    joysticks: Record<string, IJoystick> | null
    jsModes: Record<string, number>
    t: II18nStrings
}>()

const emit = defineEmits<{
    keyClick: [id: string]
    joyClick: [id: string]
    modeClick: [id: string]
}>()

const trigSet = computed(() => new Set(props.triggerIds))

function getKeyDef(pos: IKeyPos): IKeyDef | IEncoderDef | null {
    if (pos.kind === 'encoder') return props.layer.encoder ?? null
    return props.layer.keys[pos.id] ?? null
}

function getBaseDef(pos: IKeyPos): IKeyDef | null {
    if (pos.kind === 'encoder') return null
    return props.baseLayer.keys[pos.id] ?? null
}

function getJoystick(hand: string): IJoystick | null {
    return props.joysticks?.[hand] ?? null
}

function getModeIdx(hand: string): number {
    return props.jsModes[hand] ?? 0
}
</script>

<template>
<div class="board" :style="{ width: board.widthPx + 'px', height: board.heightPx + 'px' }">
    <template v-for="pos in board.keys" :key="pos.id">
        <KeyJoystick
            v-if="pos.kind === 'joystick'"
            :pos="pos"
            :js="getJoystick(pos.hand)"
            :mode-idx="getModeIdx(pos.hand)"
            :selected="selectedId === pos.id"
            @click="emit('joyClick', $event)"
        />
        <KeyModeBtn
            v-else-if="pos.kind === 'modebtn'"
            :pos="pos"
            :js="getJoystick(pos.hand)"
            :mode-idx="getModeIdx(pos.hand)"
            :t="t"
            @click="emit('modeClick', $event)"
        />
        <KeyTile
            v-else
            :pos="pos"
            :def="getKeyDef(pos)"
            :base="getBaseDef(pos)"
            :show-legends="showLegends && layer.id === 'base'"
            :selected="selectedId === pos.id"
            :is-trigger="trigSet.has(pos.id)"
            @click="emit('keyClick', $event)"
        />
    </template>
</div>
</template>
