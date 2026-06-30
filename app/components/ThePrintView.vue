<script setup lang="ts">
import type { ILayout, ILang, IKeyDef, IEncoderDef } from '~/types'
import { getBoard } from '~/data/geometry'
import { I18N } from '~/data/i18n'

const props = defineProps<{
    layout: ILayout
    lang: ILang
    showLegends: boolean
}>()

const board = computed(() => getBoard(props.layout.board))
const t = computed(() => I18N[props.lang])
const base = computed(() => (props.layout.layers.find(l => l.id === 'base') ?? props.layout.layers[0])!)

function getDefForPrint(pos: { kind: string; id: string }, layer: { keys: Record<string, IKeyDef>; encoder?: IEncoderDef }): IKeyDef | IEncoderDef | null {
    if (pos.kind === 'encoder') return layer.encoder ?? null
    return layer.keys[pos.id] ?? null
}
</script>

<template>
<div class="print-root">
    <div v-for="l in layout.layers" :key="l.id" class="print-page">
        <div class="print-head">
            <span class="pd" :style="{ background: l.color }" />
            <span class="pn">{{ l.name[lang] ?? l.name.fr }}</span>
            <span class="pt">
                {{ layout.name }} · Cheapino V2 ·
                {{ l.id !== 'base' ? (t.trigger + ': ' + (l.trigger.label[lang] ?? l.trigger.label.fr ?? '—')) : (lang === 'fr' ? 'Couche par défaut' : 'Default layer') }}
            </span>
        </div>
        <div class="print-board">
            <div class="board" :style="{ width: board.widthPx + 'px', height: board.heightPx + 'px', position: 'relative' }">
                <template v-for="pos in board.keys" :key="pos.id">
                    <KeyJoystick
                        v-if="pos.kind === 'joystick'"
                        :pos="pos"
                        :js="layout.joysticks?.[pos.hand] ?? null"
                        :mode-idx="layout.joysticks?.[pos.hand]?.active ?? 0"
                        :selected="false"
                    />
                    <KeyModeBtn
                        v-else-if="pos.kind === 'modebtn'"
                        :pos="pos"
                        :js="layout.joysticks?.[pos.hand] ?? null"
                        :mode-idx="layout.joysticks?.[pos.hand]?.active ?? 0"
                        :t="t"
                    />
                    <KeyTile
                        v-else
                        :pos="pos"
                        :def="getDefForPrint(pos, l)"
                        :base="base!.keys[pos.id] ?? null"
                        :show-legends="showLegends && l.id === 'base'"
                        :selected="false"
                        :is-trigger="!!(l.trigger.keys?.includes(pos.id))"
                    />
                </template>
            </div>
        </div>
        <div class="print-foot">clavis-lab · {{ l.name[lang] ?? l.name.fr }}</div>
    </div>
</div>
</template>
