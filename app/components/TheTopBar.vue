<script setup lang="ts">
import type { ILayout, ILang, II18nStrings } from '~/types'

const props = defineProps<{
    layouts: ILayout[]
    activeLayoutId: string
    showLegends: boolean
    lang: ILang
    isDark: boolean
    t: II18nStrings
}>()

const emit = defineEmits<{
    'update:activeLayoutId': [id: string]
    'update:lang': [lang: ILang]
    'update:isDark': [v: boolean]
    toggleLegends: []
    newLayout: []
    deleteLayout: []
    import: [file: File]
    export: []
    exportPdf: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const settingsOpen = ref(false)
const settingsRef = ref<HTMLElement | null>(null)

function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    emit('import', file)
    input.value = ''
}

function toggleSettings() { settingsOpen.value = !settingsOpen.value }
function closeSettings() { settingsOpen.value = false }
function triggerImport() { closeSettings(); fileInput.value?.click() }
function triggerExport() { closeSettings(); emit('export') }
function triggerPdf() { closeSettings(); emit('exportPdf') }

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

function onDocClick(e: MouseEvent) {
    if (settingsRef.value && !settingsRef.value.contains(e.target as Node)) closeSettings()
}

const i = computed(() => ({
    lang:   props.lang === 'fr' ? 'Langue'   : 'Language',
    theme:  props.lang === 'fr' ? 'Thème'    : 'Theme',
    import: props.lang === 'fr' ? 'Importer' : 'Import',
    export: props.lang === 'fr' ? 'Exporter' : 'Export',
}))
</script>

<template>
<div class="topbar">
    <!-- Left -->
    <div class="tb-left">
        <div class="brand">
            <span class="logo">clavis<b>·</b>lab</span>
        </div>
    </div>

    <!-- Center -->
    <div class="tb-center">
        <select
            class="sel layout-sel"
            :value="activeLayoutId"
            @change="$emit('update:activeLayoutId', ($event.target as HTMLSelectElement).value)"
        >
            <option v-for="l in layouts" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <button class="btn ghost sm" :title="t.newLayout" @click="$emit('newLayout')">＋</button>
        <button
            v-if="layouts.length > 1"
            class="btn ghost sm"
            :title="t.del"
            @click="$emit('deleteLayout')"
        >✕</button>
    </div>

    <!-- Right -->
    <div class="tb-right">
        <button
            class="btn ghost sm legends-btn"
            :class="showLegends ? 'active' : ''"
            :title="t.showLegends"
            @click="$emit('toggleLegends')"
        >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <rect x="8" y="8" width="5" height="5" rx="1"
                    :fill="showLegends ? 'currentColor' : 'none'"
                    stroke="currentColor" stroke-width="1.5"/>
            </svg>
            {{ t.showLegends }}
        </button>

        <div ref="settingsRef" class="settings-wrap">
            <button
                class="btn ghost sm settings-btn"
                :class="settingsOpen ? 'active' : ''"
                :title="lang === 'fr' ? 'Réglages' : 'Settings'"
                @click.stop="toggleSettings"
            >
                <svg width="15" height="13" viewBox="0 0 15 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
                    <line x1="1" y1="2" x2="14" y2="2"/>
                    <circle cx="10" cy="2" r="1.75" fill="var(--panel)" stroke="currentColor"/>
                    <line x1="1" y1="6.5" x2="14" y2="6.5"/>
                    <circle cx="5" cy="6.5" r="1.75" fill="var(--panel)" stroke="currentColor"/>
                    <line x1="1" y1="11" x2="14" y2="11"/>
                    <circle cx="10" cy="11" r="1.75" fill="var(--panel)" stroke="currentColor"/>
                </svg>
            </button>

            <div v-if="settingsOpen" class="settings-panel" @click.stop>
                <div class="sp-row">
                    <span class="sp-label">{{ i.lang }}</span>
                    <div class="seg">
                        <button :class="lang === 'fr' ? 'on' : ''" @click="$emit('update:lang', 'fr')">FR</button>
                        <button :class="lang === 'en' ? 'on' : ''" @click="$emit('update:lang', 'en')">EN</button>
                    </div>
                </div>
                <div class="sp-row">
                    <span class="sp-label">{{ i.theme }}</span>
                    <div class="seg">
                        <button :class="!isDark ? 'on' : ''" @click="$emit('update:isDark', false)">☀</button>
                        <button :class="isDark ? 'on' : ''" @click="$emit('update:isDark', true)">☾</button>
                    </div>
                </div>
                <div class="sp-divider" />
                <button class="sp-action" @click="triggerImport">
                    <span class="sp-icon">↑</span>{{ i.import }}
                </button>
                <button class="sp-action" @click="triggerExport">
                    <span class="sp-icon">↓</span>{{ i.export }}
                </button>
                <button class="sp-action accent" @click="triggerPdf">
                    <span class="sp-icon">⎙</span>PDF
                </button>
            </div>
        </div>
    </div>

    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileChange" />
</div>
</template>
