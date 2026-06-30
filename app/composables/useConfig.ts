import { ref, computed, watch } from 'vue'
import type { IConfig, ILang, IKeyDef, IEncoderDef, IModal, IJoystickDir, ILayer, ILayout, IBoard, II18nStrings } from '~/types'
import { DEFAULT_CONFIG } from '~/data/config'
import { I18N } from '~/data/i18n'
import { getBoard } from '~/data/geometry'

const STORE = 'clavis-lab-config-v1'
const THEME_KEY = 'clavis-lab-theme'
const LAYER_COLORS = ['#2D6CDF', '#1F8A5B', '#C9821F', '#8A4FC9', '#C9466B', '#0E9BA8', '#5b6270', '#d4357a']

function loadTheme(): boolean {
    try { return localStorage.getItem(THEME_KEY) === 'dark' } catch (_e) { return false }
}

const isDark = ref(loadTheme())

watch(isDark, v => {
    try { localStorage.setItem(THEME_KEY, v ? 'dark' : 'light') } catch (_e) {}
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light')
}, { immediate: true })

function loadConfig(): IConfig {
    const def = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as IConfig
    try {
        const raw = localStorage.getItem(STORE)
        if (!raw) return def
        const stored = JSON.parse(raw) as IConfig
        const ids = new Set((stored.layouts ?? []).map(l => l.id))
        def.layouts.forEach(dl => {
            if (!ids.has(dl.id)) {
                stored.layouts.push(JSON.parse(JSON.stringify(dl)))
            } else {
                const sl = stored.layouts.find(l => l.id === dl.id)!
                const lids = new Set(sl.layers.map(x => x.id))
                dl.layers.forEach((dlayer, i) => {
                    if (!lids.has(dlayer.id)) sl.layers.splice(i, 0, JSON.parse(JSON.stringify(dlayer)))
                })
            }
        })
        if (!stored.version || stored.version < 3) {
            const HRM: Record<string, string> = { l01: 'Super', l11: 'Alt', l21: 'Ctrl', l31: 'Maj', r11: 'Maj', r21: 'Ctrl', r31: 'Alt', r41: 'Super' }
            stored.layouts.forEach(lo => {
                const baseL = lo.layers.find(l => l.id === 'base')
                if (!baseL) return
                Object.keys(HRM).forEach(id => {
                    const k = baseL.keys[id]
                    if (k && k.type === 'letter' && !k.hold) k.hold = HRM[id]
                })
            })
            stored.version = 3
        }
        return stored
    } catch (_e) {
        return def
    }
}

const config = ref<IConfig>(loadConfig())
const lang = ref<ILang>((config.value.lang as ILang) ?? 'fr')
const activeLayoutId = ref(config.value.activeLayout ?? 'ergol')
const activeLayerId = ref(config.value.activeLayer ?? 'base')
const selKey = ref<string | null>(null)
const picking = ref<{ layerId: string; keys: string[] } | null>(null)
const modal = ref<IModal | null>(null)
const toast = ref('')
const jsModes = ref<Record<string, number>>({ L: 0, R: 0 })

const t = computed<II18nStrings>(() => I18N[lang.value])
const layout = computed<ILayout>(() => config.value.layouts.find(l => l.id === activeLayoutId.value) ?? config.value.layouts[0] as ILayout)
const layers = computed<ILayer[]>(() => layout.value.layers)
const layer = computed<ILayer>(() => layers.value.find(l => l.id === activeLayerId.value) ?? layers.value[0] as ILayer)
const baseLayer = computed<ILayer>(() => layers.value.find(l => l.id === 'base') ?? layers.value[0] as ILayer)
const board = computed<IBoard>(() => getBoard(layout.value.board))

watch([config, lang, activeLayoutId, activeLayerId], () => {
    const c = { ...config.value, lang: lang.value, activeLayout: activeLayoutId.value, activeLayer: activeLayerId.value }
    try { localStorage.setItem(STORE, JSON.stringify(c)) } catch (_e) {}
}, { deep: true })

function update(mut: (c: IConfig) => void) {
    const c = JSON.parse(JSON.stringify(config.value)) as IConfig
    mut(c)
    config.value = c
}

function flash(msg: string) {
    toast.value = msg
    setTimeout(() => { toast.value = '' }, 1500)
}

function curLayout(c: IConfig) {
    return c.layouts.find(l => l.id === activeLayoutId.value)!
}

function curLayer(c: IConfig) {
    return curLayout(c).layers.find(l => l.id === activeLayerId.value)!
}

function onKeyClick(id: string) {
    if (picking.value) {
        if (id === 'enc') return
        const p = picking.value
        const has = p.keys.includes(id)
        picking.value = { ...p, keys: has ? p.keys.filter(k => k !== id) : [...p.keys, id] }
        return
    }
    if (id === 'enc') { modal.value = { kind: 'encoder' }; return }
    selKey.value = id
}

function applyKey(id: string, def: IKeyDef) {
    update(c => { curLayer(c).keys[id] = def })
    flash(t.value.saved)
}

function clearKey(id: string) {
    update(c => { delete curLayer(c).keys[id] })
    selKey.value = null
}

function applyEncoder(enc: IEncoderDef) {
    update(c => { curLayer(c).encoder = enc })
    modal.value = null
    flash(t.value.saved)
}

function onJoyClick(id: string) {
    if (picking.value) return
    const hand = id === 'jsL' ? 'L' : 'R'
    modal.value = { kind: 'joystick', hand }
}

function onModeClick(id: string) {
    const hand = id === 'mbL' ? 'L' : 'R'
    const js = layout.value.joysticks?.[hand]
    if (!js) return
    jsModes.value = { ...jsModes.value, [hand]: ((jsModes.value[hand] ?? 0) + 1) % js.modes.length }
}

function applyJoyMode(hand: string, modeIdx: number, dirs: Record<string, IJoystickDir>, press: IJoystickDir, name: string) {
    update(c => {
        const js = curLayout(c).joysticks![hand]!
        const m = js.modes[modeIdx]!
        m.dirs = dirs; m.press = press; m.name = { fr: name, en: name }
    })
    flash(t.value.saved)
}

function addJoyMode(hand: string) {
    update(c => {
        const js = curLayout(c).joysticks![hand]!
        const colors = ['#8A4FC9', '#1F9B8E', '#C9821F', '#3F7FD1', '#C9466B', '#0E9BA8']
        js.modes.push({
            id: 'm' + Date.now(),
            name: { fr: 'Mode ' + (js.modes.length + 1), en: 'Mode ' + (js.modes.length + 1) },
            color: colors[js.modes.length % colors.length]!,
            dirs: { n: { main: '—', type: 'trans' }, ne: { main: '—', type: 'trans' }, e: { main: '—', type: 'trans' }, se: { main: '—', type: 'trans' }, s: { main: '—', type: 'trans' }, sw: { main: '—', type: 'trans' }, w: { main: '—', type: 'trans' }, nw: { main: '—', type: 'trans' } },
            press: { main: '●', type: 'mod' },
        })
    })
}

function deleteJoyMode(hand: string, idx: number) {
    update(c => {
        const js = curLayout(c).joysticks![hand]!
        if (js.modes.length > 1) js.modes.splice(idx, 1)
    })
    jsModes.value = { ...jsModes.value, [hand]: 0 }
}

function selectLayer(id: string) { activeLayerId.value = id; selKey.value = null }

function addLayer(name: string) {
    const id = 'layer' + Date.now()
    const color = LAYER_COLORS[layers.value.length % LAYER_COLORS.length]!
    update(c => {
        curLayout(c).layers.push({
            id, name: { fr: name, en: name }, color,
            trigger: { type: 'hold', label: { fr: '', en: '' }, keys: [] },
            keys: {}, encoder: { ccw: '↑', cw: '↓', press: '⏯' },
        })
    })
    activeLayerId.value = id
    modal.value = null
    picking.value = { layerId: id, keys: [] }
}

function deleteLayer(id: string) {
    if (id === 'base') return
    update(c => { const lo = curLayout(c); lo.layers = lo.layers.filter(l => l.id !== id) })
    if (activeLayerId.value === id) activeLayerId.value = 'base'
}

function renameLayer(id: string, name: string) {
    update(c => { const l = curLayout(c).layers.find(x => x.id === id)!; l.name = { fr: name, en: name } })
    modal.value = null
}

function startPickTrigger(id: string) {
    const l = layers.value.find(x => x.id === id)
    activeLayerId.value = id
    picking.value = { layerId: id, keys: [...(l?.trigger.keys ?? [])] }
}

function donePicking() {
    if (!picking.value) return
    const p = picking.value
    update(c => {
        const l = curLayout(c).layers.find(x => x.id === p.layerId)!
        l.trigger.keys = p.keys
        const lbl = p.keys.length ? p.keys.join(' + ') : (lang.value === 'fr' ? 'Aucun' : 'None')
        l.trigger.label = { fr: lbl, en: lbl }
    })
    picking.value = null
}

function newLayout(name: string, mode: string) {
    const id = 'layout' + Date.now()
    update(c => {
        let lyrs: ILayer[]
        if (mode === 'dup') {
            lyrs = JSON.parse(JSON.stringify(curLayout(c).layers))
        } else {
            lyrs = [{
                id: 'base', name: { fr: 'Base', en: 'Base' }, color: '#3B4252',
                trigger: { type: 'base', label: { fr: 'Couche par défaut', en: 'Default layer' }, keys: [] },
                keys: {}, encoder: { ccw: '↑', cw: '↓', press: '⏯' },
            }]
        }
        c.layouts.push({ id, name, board: 'cheapino-v2', layers: lyrs })
    })
    activeLayoutId.value = id
    activeLayerId.value = 'base'
    modal.value = null
}

function deleteLayout() {
    if (config.value.layouts.length <= 1) return
    update(c => { c.layouts = c.layouts.filter(l => l.id !== activeLayoutId.value) })
    const next = config.value.layouts.find(l => l.id !== activeLayoutId.value)!
    activeLayoutId.value = next.id
    activeLayerId.value = 'base'
}

function exportConfig() {
    const data = JSON.stringify({ ...config.value, lang: lang.value, activeLayout: activeLayoutId.value }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'clavis-lab-config.json'
    a.click()
    flash(lang.value === 'fr' ? 'Config exportée' : 'Config exported')
}

function importConfig(file: File) {
    const r = new FileReader()
    r.onload = () => {
        try {
            const c = JSON.parse(r.result as string) as IConfig
            if (!c.layouts) throw new Error('invalid')
            config.value = c
            activeLayoutId.value = c.activeLayout ?? c.layouts[0]!.id
            activeLayerId.value = 'base'
            flash(lang.value === 'fr' ? 'Config importée' : 'Config imported')
        } catch (_e) {
            flash(lang.value === 'fr' ? 'Fichier invalide' : 'Invalid file')
        }
    }
    r.readAsText(file)
}

function resetAll() {
    if (!confirm(lang.value === 'fr' ? 'Réinitialiser tout ?' : 'Reset everything?')) return
    localStorage.removeItem(STORE)
    const d = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as IConfig
    config.value = d
    activeLayoutId.value = d.activeLayout
    activeLayerId.value = 'base'
    lang.value = d.lang as ILang
}

export function useConfig() {
    return {
        config,
        lang,
        isDark,
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
        flash,
    }
}
