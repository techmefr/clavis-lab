<script setup lang="ts">
import type { IBoard, IKeyPos, ILang, II18nStrings } from '~/types'

interface StampTool { kind: IKeyPos['kind']; w: number; h: number }

const props = defineProps<{
    board: IBoard
    boardSelKey: string | null
    selKey: string | null
    stampTool: StampTool | null
    lang: ILang
    t: II18nStrings
}>()

const emit = defineEmits<{
    exit: []
    stamp: [tool: StampTool]
    move: [id: string, dx: number, dy: number]
    rotate: [id: string, deg: number]
    setFinger: [id: string, finger: string]
    setKind: [id: string, kind: IKeyPos['kind']]
    setSize: [id: string, w: number, h: number]
    delete: [id: string]
}>()

const selPos = computed<IKeyPos | null>(() =>
    props.boardSelKey ? (props.board.keys.find(k => k.id === props.boardSelKey) ?? null) : null
)

interface StampDef {
    kind: IKeyPos['kind']
    w: number
    h: number
    label: string
    preview: 'rect' | 'circle'
    pw: number
    ph: number
}

const STAMPS: StampDef[] = [
    { kind: 'matrix', w: 1, h: 1,   label: '1U',     preview: 'rect',   pw: 24, ph: 24 },
    { kind: 'matrix', w: 1.5, h: 1, label: '1.5U',   preview: 'rect',   pw: 36, ph: 24 },
    { kind: 'matrix', w: 2, h: 1,   label: '2U',      preview: 'rect',   pw: 48, ph: 24 },
    { kind: 'matrix', w: 2, h: 2,   label: '2×2',     preview: 'rect',   pw: 48, ph: 48 },
    { kind: 'thumb',  w: 1, h: 1,   label: 'Pouce',   preview: 'rect',   pw: 24, ph: 24 },
    { kind: 'encoder', w: 1, h: 1,  label: 'Rotatif', preview: 'circle', pw: 28, ph: 28 },
    { kind: 'trackball', w: 2, h: 2, label: 'Trackball', preview: 'circle', pw: 44, ph: 44 },
]

const FINGERS = [
    { id: 'lp', v: '--f-lp' }, { id: 'lr', v: '--f-lr' },
    { id: 'lm', v: '--f-lm' }, { id: 'li', v: '--f-li' },
    { id: 'ri', v: '--f-ri' }, { id: 'rm', v: '--f-rm' },
    { id: 'rr', v: '--f-rr' }, { id: 'rp', v: '--f-rp' },
    { id: 'th', v: '--f-th' }, { id: 'enc', v: '--f-enc' },
]

const SIZES = [
    { w: 1,   h: 1, label: '1U' },
    { w: 1.5, h: 1, label: '1.5' },
    { w: 2,   h: 1, label: '2U' },
    { w: 2,   h: 2, label: '2×2' },
]

function isActiveStamp(s: StampDef): boolean {
    const t = props.stampTool
    return !!t && t.kind === s.kind && t.w === s.w && t.h === s.h
}

const isResizable = computed(() =>
    selPos.value?.kind === 'matrix' || selPos.value?.kind === 'thumb' || selPos.value?.kind === 'trackball'
)
</script>

<template>
<div class="board-sidebar">
    <div class="bs-header">
        <span class="bs-title">{{ t.buildBoard }}</span>
        <span class="bs-count">{{ board.keys.length }} {{ lang === 'fr' ? 'touches' : 'keys' }}</span>
        <div class="spacer" />
        <button class="btn sm" @click="$emit('exit')">{{ t.exitBuild }}</button>
    </div>

    <div class="bs-section">
        <div class="bs-sl">{{ lang === 'fr' ? 'Éléments' : 'Elements' }}</div>
        <div class="bs-stamps">
            <button
                v-for="s in STAMPS"
                :key="`${s.kind}-${s.w}-${s.h}`"
                :class="['bs-stamp', isActiveStamp(s) ? 'active' : '']"
                :title="s.label"
                @click="$emit('stamp', { kind: s.kind, w: s.w, h: s.h })"
            >
                <svg :width="s.pw + 8" :height="s.ph + 8" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect
                        v-if="s.preview === 'rect'"
                        x="4" y="4" width="92" height="92"
                        rx="10"
                        fill="var(--panel-2)" stroke="var(--ink-3)" stroke-width="6"
                    />
                    <circle
                        v-else
                        cx="50" cy="50" r="44"
                        fill="var(--panel-2)" stroke="var(--ink-3)" stroke-width="6"
                    />
                </svg>
                <span class="bs-sl">{{ s.label }}</span>
            </button>
        </div>
        <div class="bs-hint">{{ t.addKeyHint }}</div>
    </div>

    <div v-if="selPos" class="bs-section bs-props">
        <div class="bs-sep" />

        <div class="bs-sl">{{ lang === 'fr' ? 'Doigt' : 'Finger' }}</div>
        <div class="bs-fingers">
            <button
                v-for="f in FINGERS"
                :key="f.id"
                :class="['be-finger', selPos.finger === f.id ? 'active' : '']"
                :style="{ '--fc': `var(${f.v})` }"
                :title="t.fingerNames[f.id]"
                @click="$emit('setFinger', selPos.id, f.id)"
            >
                <span class="be-fdot" />
            </button>
        </div>

        <template v-if="isResizable">
            <div class="bs-sl" style="margin-top: 10px">{{ lang === 'fr' ? 'Taille' : 'Size' }}</div>
            <div class="be-kinds">
                <button
                    v-for="sz in SIZES"
                    :key="`${sz.w}-${sz.h}`"
                    :class="['btn sm', (selPos.w ?? 1) === sz.w && (selPos.h ?? 1) === sz.h ? 'primary' : 'ghost']"
                    @click="$emit('setSize', selPos.id, sz.w, sz.h)"
                >{{ sz.label }}</button>
            </div>
        </template>

        <div class="bs-sl" style="margin-top: 10px">{{ lang === 'fr' ? 'Rotation' : 'Rotation' }}</div>
        <div class="be-row">
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, -45)">-45°</button>
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, -15)">-15°</button>
            <span class="be-rotval mono">{{ selPos.rot ?? 0 }}°</span>
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, 15)">+15°</button>
            <button class="btn ghost sm" @click="$emit('rotate', selPos.id, 45)">+45°</button>
        </div>

        <div class="bs-sl" style="margin-top: 10px">{{ lang === 'fr' ? 'Position' : 'Move' }}</div>
        <div class="be-arrows">
            <button class="btn ghost sm" @click="$emit('move', selPos.id, 0, -1)">↑</button>
            <div class="be-arh">
                <button class="btn ghost sm" @click="$emit('move', selPos.id, -1, 0)">←</button>
                <button class="btn ghost sm" @click="$emit('move', selPos.id, 1, 0)">→</button>
            </div>
            <button class="btn ghost sm" @click="$emit('move', selPos.id, 0, 1)">↓</button>
        </div>

        <button class="btn be-del" style="margin-top: 12px" @click="$emit('delete', selPos.id)">
            {{ lang === 'fr' ? 'Supprimer' : 'Delete' }}
        </button>
    </div>

    <div v-else-if="board.keys.length > 0" class="bs-select-hint">
        {{ lang === 'fr' ? 'Cliquez une touche pour la modifier' : 'Click a key to edit it' }}
    </div>
</div>
</template>
