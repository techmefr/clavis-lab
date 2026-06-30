<script setup lang="ts">
import type { IKeyPos, IKeyDef, IEncoderDef } from '~/types'

const props = defineProps<{
    pos: IKeyPos
    def: IKeyDef | IEncoderDef | null
    base: IKeyDef | null
    showLegends: boolean
    selected: boolean
    isTrigger: boolean
}>()

defineEmits<{
    click: [id: string]
}>()

function fingerVar(finger: string): string {
    return `var(--f-${finger || 'th'})`
}

function mainSizeClass(s: string | null | undefined): string {
    if (s == null) return ''
    const len = String(s).length
    if (len <= 1) return ''
    if (len <= 3) return 'small'
    return 'tiny'
}

const encDef = computed(() => props.pos.kind === 'encoder' ? (props.def as IEncoderDef | null) : null)
const keyDef = computed(() => props.pos.kind !== 'encoder' ? (props.def as IKeyDef | null) : null)
const isTrans = computed(() => !keyDef.value || keyDef.value.type === 'trans')
const ghost = computed(() => isTrans.value && !!props.base?.main && props.base.type !== 'trans')
</script>

<template>
<div
    v-if="pos.kind === 'encoder'"
    class="key encoder"
    :style="{ left: pos.x * 64 + 'px', top: pos.y * 64 + 'px' }"
    title="Encodeur"
    @click="$emit('click', pos.id)"
>
    <div class="ring" />
    <span class="enc-ccw">{{ encDef?.ccw ?? '↑' }}</span>
    <span class="enc-press mono">{{ encDef?.press ?? '⏯' }}</span>
    <span class="enc-cw">{{ encDef?.cw ?? '↓' }}</span>
</div>

<div
    v-else
    :class="[
        'key',
        isTrans ? 'trans' : '',
        ghost ? 'ghost' : '',
        selected ? 'selected' : '',
        isTrigger ? 'is-trigger' : '',
    ]"
    :style="{
        left: pos.x * 64 + 'px',
        top: pos.y * 64 + 'px',
        transform: pos.rot ? `rotate(${pos.rot}deg)` : undefined,
        '--fc': fingerVar(pos.finger),
    }"
    :data-type="keyDef ? keyDef.type : (base && base.type !== 'trans' ? base.type : 'trans')"
    @click="$emit('click', pos.id)"
>
    <div class="strip" />
    <div class="face">
        <template v-if="isTrans">
            <span
                v-if="ghost && base"
                :class="['main', 'ghost-main', mainSizeClass(base.main)]"
            >{{ base.main }}</span>
            <span v-else class="main">▽</span>
        </template>
        <template v-else-if="keyDef">
            <span :class="['main', mainSizeClass(keyDef.main)]">{{ keyDef.main }}</span>
            <span
                v-if="showLegends && base && base.shift && base.shift !== (base.main ?? '').toUpperCase() && base.type === 'symbol'"
                class="shift mono"
            >{{ base.shift }}</span>
            <span v-if="showLegends && base?.altgr" class="altgr">{{ base.altgr }}</span>
            <span v-if="showLegends && base?.dead" class="dead">{{ base.dead }}</span>
            <span v-if="keyDef.hold" class="hold">{{ keyDef.hold }}</span>
            <span v-if="keyDef.sub" class="sub">{{ keyDef.sub }}</span>
        </template>
    </div>
</div>
</template>
