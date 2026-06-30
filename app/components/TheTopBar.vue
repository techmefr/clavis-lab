<script setup lang="ts">
import type { ILayout, ILang, II18nStrings } from '~/types'

defineProps<{
    layouts: ILayout[]
    activeLayoutId: string
    showLegends: boolean
    lang: ILang
    t: II18nStrings
}>()

defineEmits<{
    'update:activeLayoutId': [id: string]
    'update:lang': [lang: ILang]
    toggleLegends: []
    newLayout: []
    deleteLayout: []
    import: [file: File]
    export: []
    exportPdf: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const emit = defineEmits
    input.value = ''
}
</script>

<template>
<div class="topbar">
    <div class="brand">
        <span class="logo">clavis<b>·</b>lab</span>
        <span class="tag">36 keys · v2</span>
    </div>
    <div class="spacer" />

    <div class="field">
        <label>{{ t.layout }}</label>
        <select
            class="sel"
            :value="activeLayoutId"
            @change="$emit('update:activeLayoutId', ($event.target as HTMLSelectElement).value)"
        >
            <option v-for="l in layouts" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <button class="btn sm" @click="$emit('newLayout')">+ {{ t.newLayout }}</button>
        <button
            v-if="layouts.length > 1"
            class="btn ghost sm"
            :title="t.del"
            @click="$emit('deleteLayout')"
        >🗑</button>
    </div>

    <div class="field">
        <button class="btn sm" @click="$emit('toggleLegends')">
            {{ showLegends ? '◉' : '◯' }} {{ t.showLegends }}
        </button>
    </div>

    <div class="seg">
        <button :class="lang === 'fr' ? 'on' : ''" @click="$emit('update:lang', 'fr')">FR</button>
        <button :class="lang === 'en' ? 'on' : ''" @click="$emit('update:lang', 'en')">EN</button>
    </div>

    <button class="btn" @click="fileInput?.click()">{{ t.importCfg }}</button>
    <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { $emit('import', f); (e.target as HTMLInputElement).value = '' } }"
    />
    <button class="btn" @click="$emit('export')">{{ t.exportCfg }}</button>
    <button class="btn primary" @click="$emit('exportPdf')">{{ t.exportPdf }}</button>
</div>
</template>
