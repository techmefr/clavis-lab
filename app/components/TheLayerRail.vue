<script setup lang="ts">
import type { ILayer, II18nStrings, ILang } from '~/types'

defineProps<{
    layers: ILayer[]
    activeLayerId: string
    lang: ILang
    t: II18nStrings
}>()

defineEmits<{
    select: [id: string]
    rename: [id: string, name: string]
    pickTrigger: [id: string]
    delete: [id: string]
    add: []
}>()
</script>

<template>
<div class="rail">
    <span class="label">{{ t.layers }}</span>
    <div
        v-for="(l, i) in layers"
        :key="l.id"
        :class="['chip', l.id === activeLayerId ? 'active' : '']"
        :style="{ '--chip': l.color }"
        @click="$emit('select', l.id)"
    >
        <span class="cidx mono">{{ String(i).padStart(2, '0') }}</span>
        <div class="top">
            <span class="cdot" />
            <span class="cname">{{ l.name[lang] ?? l.name.fr }}</span>
        </div>
        <span class="ctrig">{{ l.id === 'base' ? t.base : (l.trigger.label[lang] ?? l.trigger.label.fr ?? '—') }}</span>
        <div v-if="l.id === activeLayerId" style="display: flex; gap: 4px; margin-top: 4px">
            <button
                class="btn ghost sm"
                :title="t.rename"
                @click.stop="$emit('rename', l.id, l.name[lang] ?? l.name.fr)"
            >✎</button>
            <button
                v-if="l.id !== 'base'"
                class="btn ghost sm"
                :title="t.trigger"
                @click.stop="$emit('pickTrigger', l.id)"
            >⌖</button>
            <button
                v-if="l.id !== 'base'"
                class="btn ghost sm cdel"
                :title="t.del"
                @click.stop="$emit('delete', l.id)"
            >✕</button>
        </div>
    </div>
    <div class="chip add" :title="t.addLayer" @click="$emit('add')">＋</div>
</div>
</template>
