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
    <div class="rail-track">
        <div
            v-for="(l, i) in layers"
            :key="l.id"
            :class="['chip', l.id === activeLayerId ? 'active' : '']"
            :style="{ '--chip': l.color }"
            @click="$emit('select', l.id)"
        >
            <div class="chip-top">
                <span class="chip-idx mono">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="chip-actions">
                    <button
                        class="chip-act"
                        :title="t.rename"
                        @click.stop="$emit('rename', l.id, l.name[lang] ?? l.name.fr)"
                    >✎</button>
                    <button
                        v-if="l.id !== 'base'"
                        class="chip-act"
                        :title="t.trigger"
                        @click.stop="$emit('pickTrigger', l.id)"
                    >⌖</button>
                    <button
                        v-if="l.id !== 'base'"
                        class="chip-act danger"
                        :title="t.del"
                        @click.stop="$emit('delete', l.id)"
                    >✕</button>
                </div>
            </div>
            <div class="chip-body">
                <span class="chip-dot" />
                <span class="chip-name">{{ l.name[lang] ?? l.name.fr }}</span>
            </div>
            <span class="chip-trig">{{ l.id === 'base' ? t.base : (l.trigger.label[lang] ?? l.trigger.label.fr ?? '—') }}</span>
        </div>

        <button class="chip-add" :title="t.addLayer" @click="$emit('add')">
            <span class="chip-add-icon">＋</span>
            <span class="chip-add-label">{{ t.addLayer }}</span>
        </button>
    </div>
</div>
</template>
