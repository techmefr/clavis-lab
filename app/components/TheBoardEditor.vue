<script setup lang="ts">
import type { IBoard, IKeyPos, ILang, II18nStrings } from '~/types'

const props = defineProps<{
    board: IBoard
    boardSelKey: string | null
    lang: ILang
    t: II18nStrings
}>()

const emit = defineEmits<{
    exit: []
    move: [id: string, dx: number, dy: number]
    rotate: [id: string, deg: number]
    setFinger: [id: string, finger: string]
    setKind: [id: string, kind: IKeyPos['kind']]
    delete: [id: string]
}>()

const selPos = computed<IKeyPos | null>(() =>
    props.boardSelKey ? (props.board.keys.find(k => k.id === props.boardSelKey) ?? null) : null
)

const FINGERS = [
    { id: 'lp', var: '--f-lp' }, { id: 'lr', var: '--f-lr' },
    { id: 'lm', var: '--f-lm' }, { id: 'li', var: '--f-li' },
    { id: 'ri', var: '--f-ri' }, { id: 'rm', var: '--f-rm' },
    { id: 'rr', var: '--f-rr' }, { id: 'rp', var: '--f-rp' },
    { id: 'th', var: '--f-th' }, { id: 'enc', var: '--f-enc' },
]

const KINDS: Array<{ id: IKeyPos['kind']; label: () => string }> = [
    { id: 'matrix', label: () => props.t.kindMatrix },
    { id: 'thumb',  label: () => props.t.kindThumb },
    { id: 'encoder', label: () => props.t.kindEncoder },
]
</script>

<template>
<div class="be-banner">
    <span class="be-title">{{ t.buildBoard }}</span>
    <span class="be-count">{{ board.keys.length }} {{ lang === 'fr' ? 'touches' : 'keys' }}</span>
    <span class="be-hint">{{ t.addKeyHint }}</span>
    <div class="spacer" />
    <button class="btn sm" @click="$emit('exit')">{{ t.exitBuild }}</button>
</div>

<div v-if="selPos" class="be-panel">
    <div class="be-ph">
        <span class="be-pid mono">{{ selPos.id }}</span>
        <span class="be-ppos">x{{ selPos.x }} · y{{ selPos.y }}</span>
    </div>

    <div class="be-section">
        <div class="be-sl">{{ lang === 'fr' ? 'Doigt' : 'Finger' }}</div>
        <div class="be-fingers">
            <button
                v-for="f in FINGERS"
                :key="f.id"
                :class="['be-finger', selPos.finger === f.id ? 'active' : '']"
                :style="{ '--fc': `var(${f.var})` }"
                :title="t.fingerNames[f.id]"
                @click="$emit('setFinger', selPos.id, f.id)"
            >
                <span class="be-fdot" />
            </button>
        </div>
    </div>

    <div class="be-section">
        <div class="be-sl">{{ lang === 'fr' ? 'Type' : 'Kind' }}</div>
        <div class="be-kinds">
            <button
                v-for="k in KINDS"
                :key="k.id"
                :class="['btn sm', selPos.kind === k.id ? 'primary' : 'ghost']"
                @click="$emit('setKind', selPos.id, k.id)"
            >{{ k.label() }}</button>
        </div>
    </div>

    <div class="be-section">
        <div class="be-sl">{{ lang === 'fr' ? 'Rotation' : 'Rotation' }}</div>
        <div class="be-row">
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, -45)">-45°</button>
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, -15)">-15°</button>
            <span class="be-rotval mono">{{ selPos.rot ?? 0 }}°</span>
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, 15)">+15°</button>
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, 45)">+45°</button>
        </div>
    </div>

    <div class="be-section">
        <div class="be-sl">{{ lang === 'fr' ? 'Position' : 'Move' }}</div>
        <div class="be-arrows">
            <button class="btn ghost sm" @click="$emit('move', selPos.id, 0, -1)">↑</button>
            <div class="be-arh">
                <button class="btn ghost sm" @click="$emit('move', selPos.id, -1, 0)">←</button>
                <button class="btn ghost sm" @click="$emit('move', selPos.id, 1, 0)">→</button>
            </div>
            <button class="btn ghost sm" @click="$emit('move', selPos.id, 0, 1)">↓</button>
        </div>
    </div>

    <button class="btn be-del" @click="$emit('delete', selPos.id)">
        {{ lang === 'fr' ? 'Supprimer cette touche' : 'Delete key' }}
    </button>
</div>
</template>
