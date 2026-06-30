<script setup lang="ts">
import { useConfig } from '~/composables/useConfig'
import { useFit } from '~/composables/useFit'

const {
    config,
    lang,
    activeLayoutId,
    activeLayerId,
    selKey,
    picking,
    modal,
    toast,
    jsModes,
    t,
    layout,
    layers,
    layer,
    baseLayer,
    board,
    onKeyClick,
    applyKey,
    clearKey,
    applyEncoder,
    onJoyClick,
    onModeClick,
    applyJoyMode,
    addJoyMode,
    deleteJoyMode,
    selectLayer,
    addLayer,
    deleteLayer,
    renameLayer,
    startPickTrigger,
    donePicking,
    newLayout,
    deleteLayout,
    exportConfig,
    importConfig,
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
</script>

<template>
<div class="app">
    <TheTopBar
        :layouts="config.layouts"
        :active-layout-id="activeLayoutId"
        :show-legends="config.showLegends"
        :lang="lang"
        :t="t"
        @update:active-layout-id="id => { activeLayoutId = id; activeLayerId = 'base' }"
        @update:lang="l => { lang = l }"
        @toggle-legends="config.showLegends = !config.showLegends"
        @new-layout="modal = { kind: 'newLayout', name: '', mode: 'blank' }"
        @delete-layout="deleteLayout()"
        @import="importConfig"
        @export="exportConfig()"
        @export-pdf="printPage"
    />

    <div ref="stageRef" class="stage">
        <div class="layer-banner">
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
                :show-legends="config.showLegends"
                :selected-id="selKey"
                :trigger-ids="triggerIds"
                :joysticks="layout.joysticks ?? null"
                :js-modes="jsModes"
                :t="t"
                @key-click="onKeyClick"
                @joy-click="onJoyClick"
                @mode-click="onModeClick"
            />
        </div>

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

        <div :class="['toast', toast ? 'show' : '']">{{ toast }}</div>

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

    <ThePrintView
        :layout="layout"
        :lang="lang"
        :show-legends="config.showLegends"
    />
</div>
</template>
