<script setup lang="ts">
import { useConfig } from '~/composables/useConfig'
import { useFit } from '~/composables/useFit'

const {
    config, lang, isDark,
    boardEditMode, boardSelKey, isCustomBoard, stampTool,
    enterBoardEdit, exitBoardEdit, setStamp,
    addKeyToBoard, deleteBoardKey, duplicateBoardKey, moveBoardKey, rotateBoardKey,
    setKeyPosition, setKeyAbsRotation, setKeyRect,
    setBoardKeyFinger, setBoardKeyKind, setBoardKeySize,
    activeLayoutId, activeLayerId, selKey,
    picking, modal, toast, jsModes, t,
    layout, layers, layer, baseLayer, board,
    onKeyClick, applyKey, clearKey, applyEncoder,
    onJoyClick, onModeClick,
    applyJoyMode, addJoyMode, deleteJoyMode,
    selectLayer, addLayer, deleteLayer, renameLayer,
    startPickTrigger, donePicking,
    newLayout, deleteLayout,
    exportConfig, importConfig,
    resetAll,
} = useConfig()

const stageRef = ref<HTMLElement | null>(null)
const boardW = computed(() => board.value.widthPx)
const boardH = computed(() => board.value.heightPx + 30)
const { scale } = useFit(stageRef, boardW, boardH, 150)

const selPos = computed(() => selKey.value ? board.value.keys.find(k => k.id === selKey.value) ?? null : null)
const triggerIds = computed(() => {
    if (picking.value) return picking.value.keys
    if (layer.value.id !== 'base') return layer.value.trigger.keys
    return []
})
const FINGERS = ['lp', 'lr', 'lm', 'li', 'ri', 'rm', 'rr', 'rp', 'th', 'enc']

function printPage() { window.print() }

const UNIT = 64
const RESIZABLE_KINDS = new Set<string>(['joystick', 'trackball'])

interface DragState   { id: string; offsetX: number; offsetY: number }
interface RotateState { id: string; cx: number; cy: number; startAngle: number; startRot: number }
type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br'
interface ResizeState { id: string; corner: ResizeCorner; anchorX: number; anchorY: number }

const dragState   = ref<DragState | null>(null)
const rotateState = ref<RotateState | null>(null)
const resizeState = ref<ResizeState | null>(null)
let dragMoved = false

const selResizable = computed(() => RESIZABLE_KINDS.has(selPos.value?.kind ?? ''))

function clientToBoard(cx: number, cy: number): { bx: number; by: number } {
    const rect = stageRef.value!.getBoundingClientRect()
    const s = scale.value
    const ox = (rect.width  - board.value.widthPx  * s) / 2
    const oy = (rect.height - board.value.heightPx * s) / 2
    return { bx: (cx - rect.left - ox) / s, by: (cy - rect.top - oy) / s }
}

function onBoardMousedown(e: MouseEvent) {
    if (!boardEditMode.value) return
    const target = e.target as HTMLElement

    const resizeHandle = target.closest('[data-resize-id]') as HTMLElement | null
    if (resizeHandle) {
        e.preventDefault()
        e.stopPropagation()
        const id = resizeHandle.getAttribute('data-resize-id')!
        const corner = resizeHandle.getAttribute('data-resize-corner') as ResizeCorner
        const key = board.value.keys.find(k => k.id === id)
        if (!key) return
        const w = key.w ?? 1
        const h = key.h ?? 1
        const anchorX = (corner === 'tl' || corner === 'bl') ? key.x + w : key.x
        const anchorY = (corner === 'tl' || corner === 'tr') ? key.y + h : key.y
        resizeState.value = { id, corner, anchorX, anchorY }
        dragMoved = true
        return
    }

    const rotHandle = target.closest('[data-rotate-id]') as HTMLElement | null
    if (rotHandle) {
        e.preventDefault()
        e.stopPropagation()
        const id = rotHandle.getAttribute('data-rotate-id')!
        const key = board.value.keys.find(k => k.id === id)
        if (!key) return
        const cx = (key.x + (key.w ?? 1) / 2) * UNIT
        const cy = (key.y + (key.h ?? 1) / 2) * UNIT
        const { bx, by } = clientToBoard(e.clientX, e.clientY)
        rotateState.value = { id, cx, cy, startAngle: Math.atan2(by - cy, bx - cx) * 180 / Math.PI, startRot: key.rot ?? 0 }
        return
    }

    const keyEl = target.closest('[data-key-id]') as HTMLElement | null
    if (keyEl && !target.closest('.board-sidebar')) {
        e.preventDefault()
        const id = keyEl.getAttribute('data-key-id')!
        boardSelKey.value = id
        selKey.value = id
        const key = board.value.keys.find(k => k.id === id)
        if (!key) return
        const { bx, by } = clientToBoard(e.clientX, e.clientY)
        dragState.value = { id, offsetX: bx - key.x * UNIT, offsetY: by - key.y * UNIT }
        dragMoved = false
    }
}

function onBoardMousemove(e: MouseEvent) {
    if (dragState.value) {
        dragMoved = true
        const { bx, by } = clientToBoard(e.clientX, e.clientY)
        const rawX = (bx - dragState.value.offsetX) / UNIT
        const rawY = (by - dragState.value.offsetY) / UNIT
        setKeyPosition(dragState.value.id, Math.round(rawX * 4) / 4, Math.round(rawY * 4) / 4)
    }
    if (rotateState.value) {
        const { bx, by } = clientToBoard(e.clientX, e.clientY)
        const angle = Math.atan2(by - rotateState.value.cy, bx - rotateState.value.cx) * 180 / Math.PI
        const delta = angle - rotateState.value.startAngle
        setKeyAbsRotation(rotateState.value.id, Math.round((rotateState.value.startRot + delta) / 5) * 5)
    }
    if (resizeState.value) {
        const rs = resizeState.value
        const { bx, by } = clientToBoard(e.clientX, e.clientY)
        const snap = (v: number) => Math.round(v * 2) / 2
        const bxU = bx / UNIT
        const byU = by / UNIT
        let newX: number, newY: number, newW: number, newH: number
        switch (rs.corner) {
            case 'br':
                newW = Math.max(1, snap(bxU - rs.anchorX))
                newH = Math.max(1, snap(byU - rs.anchorY))
                newX = rs.anchorX; newY = rs.anchorY
                break
            case 'tl':
                newW = Math.max(1, snap(rs.anchorX - bxU))
                newH = Math.max(1, snap(rs.anchorY - byU))
                newX = rs.anchorX - newW; newY = rs.anchorY - newH
                break
            case 'tr':
                newW = Math.max(1, snap(bxU - rs.anchorX))
                newH = Math.max(1, snap(rs.anchorY - byU))
                newX = rs.anchorX; newY = rs.anchorY - newH
                break
            case 'bl':
                newW = Math.max(1, snap(rs.anchorX - bxU))
                newH = Math.max(1, snap(byU - rs.anchorY))
                newX = rs.anchorX - newW; newY = rs.anchorY
                break
            default: return
        }
        setKeyRect(rs.id, Math.max(0, newX), Math.max(0, newY), newW, newH)
    }
}

function onBoardMouseup() {
    dragState.value = null
    rotateState.value = null
    resizeState.value = null
}

const isDragging = computed(() => dragState.value !== null || rotateState.value !== null || resizeState.value !== null)
const isRotating = computed(() => rotateState.value !== null)
const isResizing = computed(() => resizeState.value !== null)

interface CtxMenu { x: number; y: number; id: string }
const ctxMenu = ref<CtxMenu | null>(null)

function closeCtxMenu() { ctxMenu.value = null }

function onBoardKeyClick(id: string) {
    boardSelKey.value = id
    selKey.value = id
}

function onStageClick(e: MouseEvent) {
    if (!boardEditMode.value || !stageRef.value) return
    closeCtxMenu()
    if (dragMoved) { dragMoved = false; return }
    const target = e.target as HTMLElement
    if (target.closest('[data-key-id]') || target.closest('.board-sidebar')) return

    if (!stampTool.value) {
        boardSelKey.value = null
        selKey.value = null
        return
    }

    const rect = stageRef.value.getBoundingClientRect()
    const s = scale.value
    const originX = (rect.width  - board.value.widthPx  * s) / 2
    const originY = (rect.height - board.value.heightPx * s) / 2

    const bx = (e.clientX - rect.left  - originX) / s
    const by = (e.clientY - rect.top   - originY) / s

    const gx = Math.floor(bx / UNIT)
    const gy = Math.floor(by / UNIT)
    if (gx < 0 || gy < 0 || gx > 24 || gy > 18) return
    addKeyToBoard(gx, gy)
}

function onStageContextmenu(e: MouseEvent) {
    if (!boardEditMode.value) return
    e.preventDefault()
    const target = e.target as HTMLElement
    const keyEl = target.closest('[data-key-id]') as HTMLElement | null
    if (!keyEl || target.closest('.board-sidebar')) return
    const id = keyEl.getAttribute('data-key-id')!
    boardSelKey.value = id
    selKey.value = id
    ctxMenu.value = { x: e.clientX, y: e.clientY, id }
}

function ctxDuplicate() {
    if (!ctxMenu.value) return
    const newId = duplicateBoardKey(ctxMenu.value.id)
    if (newId) { boardSelKey.value = newId; selKey.value = newId }
    closeCtxMenu()
}

function ctxDelete() {
    if (!ctxMenu.value) return
    deleteBoardKey(ctxMenu.value.id)
    closeCtxMenu()
}

function ctxRotate(deg: number) {
    if (!ctxMenu.value) return
    rotateBoardKey(ctxMenu.value.id, deg)
}

function onKeyboardShortcut(e: KeyboardEvent) {
    if (!boardEditMode.value) return
    const id = boardSelKey.value

    if (e.key === 'Escape') {
        if (ctxMenu.value) { closeCtxMenu(); return }
        if (id) { boardSelKey.value = null; selKey.value = null }
        else exitBoardEdit()
        return
    }

    if (!id) return
    const step = e.shiftKey ? 0.25 : 1
    const key = board.value.keys.find(k => k.id === id)
    if (!key) return

    switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); setKeyPosition(id, key.x - step, key.y); break
        case 'ArrowRight': e.preventDefault(); setKeyPosition(id, key.x + step, key.y); break
        case 'ArrowUp':    e.preventDefault(); setKeyPosition(id, key.x, key.y - step); break
        case 'ArrowDown':  e.preventDefault(); setKeyPosition(id, key.x, key.y + step); break
        case '[':          rotateBoardKey(id, -15); break
        case ']':          rotateBoardKey(id, 15);  break
        case 'Delete':
        case 'Backspace':
            if (!(e.target as HTMLElement).matches('input, textarea')) {
                deleteBoardKey(id)
            }
            break
        case 'd':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                const newId = duplicateBoardKey(id)
                if (newId) { boardSelKey.value = newId; selKey.value = newId }
            }
            break
    }
}

onMounted(() => window.addEventListener('keydown', onKeyboardShortcut))
onUnmounted(() => window.removeEventListener('keydown', onKeyboardShortcut))
</script>

<template>
<div class="app">
    <TheTopBar
        :layouts="config.layouts"
        :active-layout-id="activeLayoutId"
        :show-legends="config.showLegends"
        :lang="lang"
        :is-dark="isDark"
        :is-custom-board="isCustomBoard"
        :board-edit-mode="boardEditMode"
        :t="t"
        @update:active-layout-id="id => { activeLayoutId = id; activeLayerId = 'base'; exitBoardEdit() }"
        @update:lang="l => { lang = l }"
        @update:is-dark="v => { isDark = v }"
        @toggle-legends="config.showLegends = !config.showLegends"
        @new-layout="modal = { kind: 'newLayout', name: '', mode: 'blank' }"
        @delete-layout="deleteLayout()"
        @import="importConfig"
        @export="exportConfig()"
        @export-pdf="printPage"
        @enter-board-edit="enterBoardEdit"
    />

    <div
        ref="stageRef"
        class="stage"
        :class="[boardEditMode ? 'edit-mode' : '', isDragging ? 'dragging' : '', isRotating ? 'rotating' : '', isResizing ? 'resizing' : '']"
        @click="onStageClick"
        @contextmenu="onStageContextmenu"
        @mousedown="onBoardMousedown"
        @mousemove="onBoardMousemove"
        @mouseup="onBoardMouseup"
        @mouseleave="onBoardMouseup"
    >
        <TheBoardSidebar
            v-if="boardEditMode"
            :board="board"
            :board-sel-key="boardSelKey"
            :sel-key="selKey"
            :stamp-tool="stampTool"
            :lang="lang"
            :t="t"
            @exit="exitBoardEdit"
            @stamp="setStamp"
            @rotate="(id, deg) => rotateBoardKey(id, deg)"
            @set-finger="(id, f) => setBoardKeyFinger(id, f)"
            @set-kind="(id, k) => setBoardKeyKind(id, k)"
            @set-size="(id, w, h) => setBoardKeySize(id, w, h)"
            @delete="deleteBoardKey"
        />

        <div v-if="!boardEditMode" class="layer-banner">
            <span class="dot" :style="{ background: layer.color }" />
            <span class="name">{{ layer.name[lang] ?? layer.name.fr }}</span>
            <span v-if="layer.id !== 'base'" class="trig">
                {{ t.trigger }}: {{ layer.trigger.label[lang] ?? layer.trigger.label.fr ?? '—' }}
            </span>
        </div>

        <div class="board-wrap" :style="{ transform: `scale(${scale})` }">
            <TheKeyboard
                :board="board"
                :layer="layer"
                :base-layer="baseLayer"
                :show-legends="config.showLegends && !boardEditMode"
                :selected-id="boardEditMode ? boardSelKey : selKey"
                :trigger-ids="boardEditMode ? [] : triggerIds"
                :joysticks="layout.joysticks ?? null"
                :js-modes="jsModes"
                :t="t"
                @key-click="boardEditMode ? onBoardKeyClick($event) : onKeyClick($event)"
                @joy-click="boardEditMode ? onBoardKeyClick($event) : onJoyClick($event)"
                @mode-click="boardEditMode ? onBoardKeyClick($event) : onModeClick($event)"
            />

            <div
                v-if="boardEditMode && selPos"
                class="sel-overlay"
                :style="{
                    left: selPos.x * UNIT + 'px',
                    top:  selPos.y * UNIT + 'px',
                    width:  (selPos.w ?? 1) * UNIT + 'px',
                    height: (selPos.h ?? 1) * UNIT + 'px',
                    transform: selPos.rot ? `rotate(${selPos.rot}deg)` : undefined,
                    transformOrigin: '50% 50%',
                }"
            >
                <div class="sel-outline" />

                <template v-if="selResizable">
                    <div class="sel-rot-handle" :data-rotate-id="selPos.id">↺</div>
                    <div class="sel-handle resize tl" :data-resize-id="selPos.id" data-resize-corner="tl" />
                    <div class="sel-handle resize tr" :data-resize-id="selPos.id" data-resize-corner="tr" />
                    <div class="sel-handle resize bl" :data-resize-id="selPos.id" data-resize-corner="bl" />
                    <div class="sel-handle resize br" :data-resize-id="selPos.id" data-resize-corner="br" />
                </template>
                <template v-else>
                    <div class="sel-handle tl" :data-rotate-id="selPos.id">↺</div>
                    <div class="sel-handle tr" :data-rotate-id="selPos.id">↻</div>
                    <div class="sel-handle bl" :data-rotate-id="selPos.id">↻</div>
                    <div class="sel-handle br" :data-rotate-id="selPos.id">↺</div>
                </template>
            </div>
        </div>

        <template v-if="!boardEditMode">
            <div class="hint-tip">{{ picking ? t.pickTrigger : t.keyHint }}</div>

            <div class="flegend">
                <div class="ft">{{ t.fingers }}</div>
                <div class="fl-grid">
                    <div v-for="f in FINGERS" :key="f" class="fi">
                        <span class="sw" :style="{ background: `var(--f-${f})` }" />
                        {{ t.fingerNames[f] }}
                    </div>
                </div>
            </div>

            <div v-if="picking" class="trigbar">
                <span>{{ t.pickTrigger }}</span>
                <span class="keys mono">{{ picking.keys.length ? picking.keys.join(' + ') : '—' }}</span>
                <button class="btn" @click="donePicking()">{{ t.done }}</button>
            </div>

            <TheKeyEditor
                v-if="selPos && (selPos.kind === 'matrix' || selPos.kind === 'thumb')"
                :key="selKey ?? ''"
                :pos="selPos"
                :def="layer.keys[selKey!] ?? null"
                :base="baseLayer.keys[selKey!] ?? null"
                :is-base-layer="layer.id === 'base'"
                :t="t"
                @apply="applyKey"
                @clear="clearKey"
                @close="selKey = null"
            />
        </template>

        <TheKeyEditor
            v-if="boardEditMode && selPos && (selPos.kind === 'matrix' || selPos.kind === 'thumb')"
            :key="selKey ?? ''"
            :pos="selPos"
            :def="layer.keys[selKey!] ?? null"
            :base="baseLayer.keys[selKey!] ?? null"
            :is-base-layer="layer.id === 'base'"
            :t="t"
            @apply="applyKey"
            @clear="clearKey"
            @close="selKey = null; boardSelKey = null"
        />

        <div :class="['toast', toast ? 'show' : '']">{{ toast }}</div>
    </div>

    <TheLayerRail
        :layers="layers"
        :active-layer-id="activeLayerId"
        :lang="lang"
        :t="t"
        @select="selectLayer"
        @rename="(id, name) => { modal = { kind: 'renameLayer', id, name } }"
        @pick-trigger="startPickTrigger"
        @delete="deleteLayer"
        @add="modal = { kind: 'newLayer', name: '' }"
    />

    <ModalHost
        v-if="modal"
        :modal="modal"
        :layer="layer"
        :layout="layout"
        :lang="lang"
        :t="t"
        :js-modes="jsModes"
        @close="modal = null"
        @new-layout="newLayout"
        @new-layer="addLayer"
        @rename-layer="renameLayer"
        @encoder="applyEncoder"
        @joy-mode="applyJoyMode"
        @add-joy-mode="addJoyMode"
        @delete-joy-mode="deleteJoyMode"
        @update:js-modes="m => { jsModes = m }"
    />
</div>

<Teleport to="body">
    <ThePrintView :layout="layout" :lang="lang" :show-legends="config.showLegends" />
</Teleport>

<Teleport to="body">
    <div
        v-if="ctxMenu"
        class="ctx-backdrop"
        @click="closeCtxMenu"
        @contextmenu.prevent="closeCtxMenu"
    />
    <div
        v-if="ctxMenu"
        class="ctx-menu"
        :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }"
    >
        <button class="ctx-item" @click="ctxRotate(-15); closeCtxMenu()">Rotation -15°</button>
        <button class="ctx-item" @click="ctxRotate(15); closeCtxMenu()">Rotation +15°</button>
        <div class="ctx-sep" />
        <button class="ctx-item" @click="ctxDuplicate">Dupliquer</button>
        <button class="ctx-item danger" @click="ctxDelete">Supprimer</button>
    </div>
</Teleport>
</template>
