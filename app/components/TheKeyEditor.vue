<script setup lang="ts">
import type { IKeyPos, IKeyDef, II18nStrings } from '~/types'
import { KEYCODES } from '~/data/i18n'

const props = defineProps<{
    pos: IKeyPos
    def: IKeyDef | null
    base: IKeyDef | null
    isBaseLayer: boolean
    t: II18nStrings
}>()

const emit = defineEmits<{
    apply: [id: string, def: IKeyDef]
    clear: [id: string]
    close: []
}>()

const start = props.def && props.def.type !== 'trans' ? props.def : { main: '', type: 'letter' }
const main = ref(start.main ?? '')
const shift = ref(start.shift ?? '')
const altgr = ref(start.altgr ?? '')
const dead = ref(start.dead ?? '')
const type = ref(start.type ?? 'letter')
const hold = ref(start.hold ?? '')

function fingerVar(finger: string): string {
    return `var(--f-${finger || 'th'})`
}

function mainSizeClass(s: string): string {
    const len = String(s).length
    if (len <= 1) return ''
    if (len <= 3) return 'small'
    return 'tiny'
}

function pick(entry: { main: string; type: string; shift?: string; sub?: string }) {
    main.value = entry.main
    type.value = entry.type
    shift.value = entry.shift ?? ''
}

function apply() {
    const d: IKeyDef = { main: main.value, type: type.value }
    if (shift.value) d.shift = shift.value
    if (props.isBaseLayer && altgr.value) d.altgr = altgr.value
    if (props.isBaseLayer && dead.value) d.dead = dead.value
    if (hold.value) d.hold = hold.value
    if (start.sub) d.sub = start.sub
    emit('apply', props.pos.id, d)
}

const cats = computed(() => [
    ['letters', props.t.catLetters] as const,
    ['numbers', props.t.catNumbers] as const,
    ['symbols', props.t.catSymbols] as const,
    ['accents', props.t.deadLabel] as const,
    ['nav', props.t.catNav] as const,
    ['mods', props.t.catMods] as const,
    ['media', props.t.catMedia] as const,
    ['fn', props.t.catFn] as const,
    ['special', props.t.catSpecial] as const,
])
</script>

<template>
<div class="editor open">
    <div class="ehead">
        <div>
            <div class="t">{{ t.editKey }}</div>
            <div class="sub">{{ t.fingerNames[pos.finger] }} · <span class="mono">{{ pos.id }}</span></div>
        </div>
        <button class="btn ghost" aria-label="close" @click="emit('close')">✕</button>
    </div>

    <div class="ebody">
        <div class="preview">
            <div class="pk" :style="{ '--fc': fingerVar(pos.finger) }">
                <span :class="['main', 'mono', mainSizeClass(main)]" :style="{ fontSize: '20px' }">{{ main || '▽' }}</span>
            </div>
            <div class="pinfo">
                <div><b>{{ t.mainLabel }}:</b> {{ main || '—' }}</div>
                <div><b>Type:</b> {{ type }}</div>
            </div>
        </div>

        <div class="fieldset">
            <div class="flabel">{{ t.typeChar }}</div>
            <input
                v-model="main"
                class="txt mono"
                style="width: 100%"
                placeholder="ex: e, ↑, F5, Vol+"
                autofocus
            />
        </div>

        <div class="fieldset">
            <div class="flabel">{{ t.holdLabel }}</div>
            <input v-model="hold" class="txt mono" style="width: 100%" :placeholder="t.holdHint" />
            <div class="palette" style="margin-top: 7px">
                <button class="pkey tiny" @click="hold = ''">{{ t.noHold }}</button>
                <button
                    v-for="(h, i) in KEYCODES.holds"
                    :key="i"
                    class="pkey tiny"
                    @click="hold = h.v"
                >{{ h.v }}</button>
            </div>
        </div>

        <div v-if="isBaseLayer" class="fieldset">
            <div class="flabel">{{ t.legend }}</div>
            <div class="legend-grid">
                <label class="li"><span>{{ t.shiftLabel }}</span><input v-model="shift" class="txt mono" /></label>
                <label class="li"><span>{{ t.altgrLabel }}</span><input v-model="altgr" class="txt mono" /></label>
                <label class="li"><span>{{ t.deadLabel }}</span><input v-model="dead" class="txt mono" /></label>
            </div>
        </div>

        <div class="fieldset">
            <div class="flabel">{{ t.orPick }}</div>
            <div v-for="([key, title]) in cats" :key="key" class="cat">
                <div class="cattl">{{ title }}</div>
                <div class="palette">
                    <button
                        v-for="(entry, i) in KEYCODES[key]"
                        :key="i"
                        :class="['pkey', String(entry.main).length > 2 ? 'tiny' : '']"
                        :title="entry.type"
                        @click="pick(entry)"
                    >{{ entry.main }}</button>
                </div>
            </div>
        </div>
    </div>

    <div class="efoot">
        <button class="btn" @click="emit('clear', pos.id)">{{ t.clear }}</button>
        <button class="btn primary" @click="apply">{{ t.apply }}</button>
    </div>
</div>
</template>
