<script setup lang="ts">
import type { IModal, ILayer, ILayout, ILang, II18nStrings, IEncoderDef, IJoystickDir } from '~/types'

const props = defineProps<{
    modal: IModal
    layer: ILayer
    layout: ILayout
    lang: ILang
    t: II18nStrings
    jsModes: Record<string, number>
}>()

const emit = defineEmits<{
    close: []
    newLayout: [name: string, mode: string]
    newLayer: [name: string]
    renameLayer: [id: string, name: string]
    encoder: [enc: IEncoderDef]
    joyMode: [hand: string, idx: number, dirs: Record<string, IJoystickDir>, press: IJoystickDir, name: string]
    addJoyMode: [hand: string]
    deleteJoyMode: [hand: string, idx: number]
    'update:jsModes': [modes: Record<string, number>]
}>()

const name = ref(props.modal.name ?? '')
const layoutMode = ref(props.modal.mode ?? 'blank')

const enc0 = props.layer.encoder ?? { ccw: '↑', cw: '↓', press: '⏯' }
const ccw = ref(enc0.ccw)
const cw = ref(enc0.cw)
const press = ref(enc0.press)

const DIR_LABELS: Record<string, Record<string, string>> = {
    fr: { n: 'Haut', ne: 'Haut‑D', e: 'Droite', se: 'Bas‑D', s: 'Bas', sw: 'Bas‑G', w: 'Gauche', nw: 'Haut‑G' },
    en: { n: 'Up', ne: 'Up‑R', e: 'Right', se: 'Down‑R', s: 'Down', sw: 'Down‑L', w: 'Left', nw: 'Up‑L' },
}
const DIR_ORDER = ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'] as const

const joyHand = props.modal.hand ?? 'L'
const js = computed(() => props.layout.joysticks?.[joyHand] ?? null)
const joyIdx = computed(() => Math.min(props.jsModes[joyHand] ?? 0, (js.value?.modes.length ?? 1) - 1))
const joyMode = computed(() => js.value?.modes[joyIdx.value])

const joyName = ref(joyMode.value?.name[props.lang] ?? joyMode.value?.name.fr ?? '')
const joyDirs = ref<Record<string, IJoystickDir>>(JSON.parse(JSON.stringify(joyMode.value?.dirs ?? {})))
const joyPress = ref(joyMode.value?.press?.main ?? '')

watch(joyIdx, () => {
    joyName.value = joyMode.value?.name[props.lang] ?? joyMode.value?.name.fr ?? ''
    joyDirs.value = JSON.parse(JSON.stringify(joyMode.value?.dirs ?? {}))
    joyPress.value = joyMode.value?.press?.main ?? ''
})

function setDir(d: string, val: string) {
    joyDirs.value = {
        ...joyDirs.value,
        [d]: val ? { main: val, type: 'nav' } : { main: '—', type: 'trans' },
    }
}

function saveJoy() {
    emit('joyMode', joyHand, joyIdx.value, joyDirs.value, { main: joyPress.value || '●', type: 'mod' }, joyName.value.trim() || (joyMode.value?.name.fr ?? ''))
}

const handName = computed(() => {
    if (joyHand === 'L') return props.lang === 'fr' ? 'gauche' : 'left'
    return props.lang === 'fr' ? 'droit' : 'right'
})
</script>

<template>
<div class="modal-bg" @click.self="emit('close')">
    <div class="modal">
        <!-- New layout -->
        <template v-if="modal.kind === 'newLayout'">
            <h3>{{ t.newLayout }}</h3>
            <input v-model="name" class="txt" :placeholder="t.newLayoutName" autofocus />
            <div class="opts">
                <div :class="['opt', layoutMode === 'blank' ? 'sel' : '']" @click="layoutMode = 'blank'">
                    <span>◻</span> {{ t.blank }}
                </div>
                <div :class="['opt', layoutMode === 'dup' ? 'sel' : '']" @click="layoutMode = 'dup'">
                    <span>⧉</span> {{ t.duplicate }}
                </div>
            </div>
            <div class="row">
                <button class="btn" @click="emit('close')">{{ t.cancel }}</button>
                <button class="btn primary" :disabled="!name.trim()" @click="emit('newLayout', name.trim(), layoutMode)">{{ t.apply }}</button>
            </div>
        </template>

        <!-- New layer -->
        <template v-else-if="modal.kind === 'newLayer'">
            <h3>{{ t.addLayer }}</h3>
            <input v-model="name" class="txt" :placeholder="t.newLayerName" autofocus />
            <p style="font-size: 12px; color: #8b93a3; margin-top: 10px">{{ t.pickTrigger }}</p>
            <div class="row">
                <button class="btn" @click="emit('close')">{{ t.cancel }}</button>
                <button class="btn primary" :disabled="!name.trim()" @click="emit('newLayer', name.trim())">{{ t.apply }}</button>
            </div>
        </template>

        <!-- Rename layer -->
        <template v-else-if="modal.kind === 'renameLayer'">
            <h3>{{ t.rename }}</h3>
            <input v-model="name" class="txt" autofocus />
            <div class="row">
                <button class="btn" @click="emit('close')">{{ t.cancel }}</button>
                <button class="btn primary" :disabled="!name.trim()" @click="emit('renameLayer', modal.id!, name.trim())">{{ t.apply }}</button>
            </div>
        </template>

        <!-- Encoder -->
        <template v-else-if="modal.kind === 'encoder'">
            <h3>{{ t.encoder }}</h3>
            <div class="legend-grid">
                <label class="li"><span>{{ t.turnL }}</span><input v-model="ccw" class="txt mono" /></label>
                <label class="li"><span>{{ t.turnR }}</span><input v-model="cw" class="txt mono" /></label>
                <label class="li"><span>{{ t.press }}</span><input v-model="press" class="txt mono" /></label>
            </div>
            <div class="row">
                <button class="btn" @click="emit('close')">{{ t.cancel }}</button>
                <button class="btn primary" @click="emit('encoder', { ccw, cw, press })">{{ t.apply }}</button>
            </div>
        </template>

        <!-- Joystick -->
        <template v-else-if="modal.kind === 'joystick' && js">
            <h3>{{ t.joystick }} — {{ handName }}</h3>
            <div class="jmodes">
                <button
                    v-for="(mm, i) in js.modes"
                    :key="mm.id"
                    :class="['jmode-tab', i === joyIdx ? 'on' : '']"
                    :style="{ '--mc': mm.color }"
                    @click="emit('update:jsModes', { ...jsModes, [joyHand]: i })"
                >{{ mm.name[lang] ?? mm.name.fr }}</button>
                <button class="jmode-tab add" @click="emit('addJoyMode', joyHand)">＋</button>
            </div>

            <div class="fieldset" style="margin-top: 14px">
                <div class="flabel">{{ t.modeName }}</div>
                <input v-model="joyName" class="txt" style="width: 100%" />
            </div>

            <div class="flabel" style="margin-bottom: 6px">{{ t.directions }}</div>
            <div class="dir-grid">
                <label
                    v-for="d in DIR_ORDER"
                    :key="d"
                    :class="['dir-cell', 'dir-' + d]"
                >
                    <span class="dl">{{ d === 'c' ? t.press : DIR_LABELS[lang]?.[d] }}</span>
                    <input
                        v-if="d === 'c'"
                        class="txt mono"
                        :value="joyPress"
                        placeholder="●"
                        @input="joyPress = ($event.target as HTMLInputElement).value"
                    />
                    <input
                        v-else
                        class="txt mono"
                        :value="joyDirs[d] && joyDirs[d].type !== 'trans' ? joyDirs[d].main : ''"
                        placeholder="—"
                        @input="setDir(d, ($event.target as HTMLInputElement).value)"
                    />
                </label>
            </div>

            <div class="row">
                <button v-if="js.modes.length > 1" class="btn" style="flex: 0 0 auto" @click="emit('deleteJoyMode', joyHand, joyIdx)">{{ t.del }}</button>
                <button class="btn" @click="emit('close')">{{ t.cancel }}</button>
                <button class="btn primary" @click="saveJoy">{{ t.apply }}</button>
            </div>
        </template>
    </div>
</div>
</template>
