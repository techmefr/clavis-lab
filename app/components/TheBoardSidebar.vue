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
    stamp: [tool: StampTool | null]
    rotate: [id: string, deg: number]
    'set-finger': [id: string, finger: string]
    'set-kind': [id: string, kind: IKeyPos['kind']]
    'set-size': [id: string, w: number, h: number]
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
    shape: 'rect' | 'circle' | 'joy'
}

const STAMPS: StampDef[] = [
    { kind: 'matrix',   w: 1,   h: 1,   label: '1U',       shape: 'rect'   },
    { kind: 'thumb',    w: 1,   h: 1,   label: 'Pouce',     shape: 'rect'   },
    { kind: 'encoder',  w: 1,   h: 1,   label: 'Rotatif',   shape: 'circle' },
    { kind: 'trackball',w: 2,   h: 2,   label: 'Trackball', shape: 'circle' },
    { kind: 'joystick', w: 2,   h: 2,   label: 'Joystick',  shape: 'joy'    },
    { kind: 'modebtn',  w: 1,   h: 1,   label: 'Mode',      shape: 'rect'   },
]

interface KindDef { id: IKeyPos['kind']; label: string }
const KINDS: KindDef[] = [
    { id: 'matrix',    label: '1U'       },
    { id: 'thumb',     label: 'Pouce'    },
    { id: 'encoder',   label: 'Rotatif'  },
    { id: 'trackball', label: 'Trackball'},
    { id: 'joystick',  label: 'Joystick' },
    { id: 'modebtn',   label: 'Mode'     },
]

const SIZES = [
    { w: 1,   h: 1, label: '1U'  },
    { w: 1.5, h: 1, label: '1.5' },
    { w: 2,   h: 1, label: '2U'  },
    { w: 2,   h: 2, label: '2×2' },
]

const FINGERS = [
    { id: 'lp', v: '--f-lp' }, { id: 'lr', v: '--f-lr' },
    { id: 'lm', v: '--f-lm' }, { id: 'li', v: '--f-li' },
    { id: 'ri', v: '--f-ri' }, { id: 'rm', v: '--f-rm' },
    { id: 'rr', v: '--f-rr' }, { id: 'rp', v: '--f-rp' },
    { id: 'th', v: '--f-th' }, { id: 'enc', v: '--f-enc' },
]

const isResizable = computed(() => {
    const k = selPos.value?.kind
    return k === 'joystick' || k === 'trackball'
})

function isActiveStamp(s: StampDef): boolean {
    const tool = props.stampTool
    return !!tool && tool.kind === s.kind && tool.w === s.w && tool.h === s.h
}

function onStampClick(s: StampDef) {
    emit('stamp', isActiveStamp(s) ? null : { kind: s.kind, w: s.w, h: s.h })
}
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
        <div class="bs-sl">{{ lang === 'fr' ? 'Ajouter' : 'Add' }}</div>
        <div class="bs-stamps">
            <button
                v-for="s in STAMPS"
                :key="s.kind"
                :class="['bs-stamp', isActiveStamp(s) ? 'active' : '']"
                :title="s.label"
                @click="onStampClick(s)"
            >
                <svg width="36" height="36" viewBox="0 0 64 64">
                    <rect
                        v-if="s.shape === 'rect'"
                        x="4" y="4" width="56" height="56" rx="8"
                        fill="var(--panel-2)" stroke="var(--ink-3)" stroke-width="4"
                    />
                    <circle
                        v-else-if="s.shape === 'circle'"
                        cx="32" cy="32" r="26"
                        fill="var(--panel-2)" stroke="var(--ink-3)" stroke-width="4"
                    />
                    <g v-else>
                        <circle cx="32" cy="32" r="26" fill="var(--panel-2)" stroke="var(--ink-3)" stroke-width="4" />
                        <circle cx="32" cy="32" r="10" fill="var(--ink-3)" opacity=".5" />
                        <line x1="32" y1="6"  x2="32" y2="18" stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
                        <line x1="32" y1="46" x2="32" y2="58" stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
                        <line x1="6"  y1="32" x2="18" y2="32" stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
                        <line x1="46" y1="32" x2="58" y2="32" stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
                    </g>
                </svg>
                <span class="bs-sl">{{ s.label }}</span>
            </button>
        </div>
        <div class="bs-hint">{{ t.addKeyHint }}</div>
    </div>

    <template v-if="selPos">
        <div class="bs-sep" />

        <div class="bs-section bs-props">
            <div class="bs-sl">{{ lang === 'fr' ? 'Type' : 'Kind' }}</div>
            <div class="be-kinds">
                <button
                    v-for="k in KINDS"
                    :key="k.id"
                    :class="['btn sm', selPos.kind === k.id ? 'primary' : 'ghost']"
                    @click="$emit('set-kind', selPos.id, k.id)"
                >{{ k.label }}</button>
            </div>

            <template v-if="isResizable">
                <div class="bs-sl" style="margin-top: 10px">{{ lang === 'fr' ? 'Taille' : 'Size' }}</div>
                <div class="be-kinds">
                    <button
                        v-for="sz in SIZES"
                        :key="`${sz.w}-${sz.h}`"
                        :class="['btn sm', (selPos.w ?? 1) === sz.w && (selPos.h ?? 1) === sz.h ? 'primary' : 'ghost']"
                        @click="$emit('set-size', selPos.id, sz.w, sz.h)"
                    >{{ sz.label }}</button>
                </div>
            </template>

            <div class="bs-sl" style="margin-top: 10px">{{ lang === 'fr' ? 'Doigt' : 'Finger' }}</div>
            <div class="bs-fingers">
                <button
                    v-for="f in FINGERS"
                    :key="f.id"
                    :class="['be-finger', selPos.finger === f.id ? 'active' : '']"
                    :style="{ '--fc': `var(${f.v})` }"
                    :title="t.fingerNames[f.id]"
                    @click="$emit('set-finger', selPos.id, f.id)"
                >
                    <span class="be-fdot" />
                </button>
            </div>

            <div class="bs-sl" style="margin-top: 10px">{{ lang === 'fr' ? 'Rotation' : 'Rotation' }}</div>
            <div class="be-row">
                <button class="btn ghost sm" @click="$emit('rotate', selPos.id, -15)">-15°</button>
                <span class="be-rotval mono">{{ selPos.rot ?? 0 }}°</span>
                <button class="btn ghost sm" @click="$emit('rotate', selPos.id, 15)">+15°</button>
            </div>

            <button class="btn be-del" style="margin-top: 14px" @click="$emit('delete', selPos.id)">
                {{ lang === 'fr' ? 'Supprimer' : 'Delete' }}
            </button>
        </div>
    </template>

    <div v-else-if="board.keys.length > 0" class="bs-select-hint">
        <div>{{ lang === 'fr' ? 'Cliquez une touche pour la modifier' : 'Click a key to edit it' }}</div>
        <div class="bs-drag-hint">{{ lang === 'fr' ? 'Glissez pour déplacer · Coins pour tourner' : 'Drag to move · Corners to rotate' }}</div>
    </div>
</div>
</template>
