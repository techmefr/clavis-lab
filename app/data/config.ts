import type { IConfig, IKeyDef, ILayer, IJoystick, IJoystickDir } from '~/types'

const L = (main: string, extra: Partial<IKeyDef> = {}): IKeyDef => ({
    main, type: 'letter', shift: main.toUpperCase(), ...extra,
})

const baseKeys: Record<string, IKeyDef> = {
    l00: L('q', { altgr: '@' }), l10: L('c', { altgr: '<', dead: 'ç' }), l20: L('o', { altgr: '>', dead: 'ô' }),
    l30: L('p', { altgr: '$' }), l40: L('w', { altgr: '%' }),
    l01: L('a', { altgr: '{', dead: 'à' }), l11: L('s', { altgr: '(' }), l21: L('e', { altgr: ')', dead: 'é' }),
    l31: L('n', { altgr: '}', dead: 'ñ' }), l41: L('f', { altgr: '=' }),
    l02: L('z', { altgr: '~' }), l12: L('x', { altgr: '[' }),
    l22: { main: '★', type: 'dead', altgr: ']', shift: '★' },
    l32: L('v', { altgr: '_' }), l42: L('b', { altgr: '#' }),
    r00: L('j', { altgr: '^' }), r10: L('m', { altgr: '&' }), r20: L('d', { altgr: '*' }),
    r30: { main: "'", type: 'symbol', altgr: '+', shift: '"' }, r40: L('y', { altgr: '`', dead: 'ÿ' }),
    r01: L('l', { altgr: '\\' }), r11: L('r', { altgr: '-' }), r21: L('t', { altgr: '/' }),
    r31: L('i', { altgr: '|', dead: 'î' }), r41: L('u', { altgr: '"', dead: 'ù' }),
    r02: L('k', { altgr: '!' }), r12: L('h', { altgr: ';' }), r22: L('g', { altgr: ':' }),
    r32: { main: '.', type: 'symbol', altgr: '?', shift: ':' }, r42: { main: ',', type: 'symbol', altgr: "'", shift: ';' },
    lt0: { main: 'Média', type: 'layer', sub: 'MO' },
    lt1: { main: '␣', type: 'space', sub: 'Espace' },
    lt2: { main: 'Nav', type: 'layer', sub: 'MO' },
    rt0: { main: 'Num', type: 'layer', sub: 'MO' },
    rt1: { main: '⏎', type: 'enter', sub: 'Entrée' },
    rt2: { main: 'AltGr', type: 'layer', sub: 'MO' },
}
const baseEnc = { ccw: '↑', cw: '↓', press: '⏯' }

const accentKeys: Record<string, IKeyDef> = {
    l10: { main: 'ç', type: 'dead' }, l20: { main: 'ô', type: 'dead' },
    l01: { main: 'à', type: 'dead' }, l21: { main: 'é', type: 'dead' }, l31: { main: 'ñ', type: 'dead' },
    r20: { main: 'ÿ', type: 'dead' }, r40: { main: 'ÿ', type: 'dead' },
    r31: { main: 'î', type: 'dead' }, r41: { main: 'ù', type: 'dead' },
    l11: { main: 'è', type: 'dead' }, l41: { main: 'ê', type: 'dead' },
    r11: { main: 'ë', type: 'dead' }, r21: { main: 'œ', type: 'dead' }, r01: { main: 'â', type: 'dead' },
    l00: { main: 'â', type: 'dead' }, r00: { main: 'û', type: 'dead' },
}
const accentEnc = { ccw: '↑', cw: '↓', press: '⏯' }

const sym = (m: string): IKeyDef => ({ main: m, type: 'symbol' })
const altgrKeys: Record<string, IKeyDef> = {
    l00: sym('@'), l10: sym('<'), l20: sym('>'), l30: sym('$'), l40: sym('%'),
    l01: sym('{'), l11: sym('('), l21: sym(')'), l31: sym('}'), l41: sym('='),
    l02: sym('~'), l12: sym('['), l22: sym(']'), l32: sym('_'), l42: sym('#'),
    r00: sym('^'), r10: sym('&'), r20: sym('*'), r30: sym('+'), r40: sym('`'),
    r01: sym('\\'), r11: sym('-'), r21: sym('/'), r31: sym('|'), r41: sym('"'),
    r02: sym('!'), r12: sym(';'), r22: sym(':'), r32: sym('?'), r42: sym("'"),
}
const altgrEnc = { ccw: '(', cw: ')', press: '=' }

const num = (m: string, t = 'num'): IKeyDef => ({ main: m, type: t })
const numKeys: Record<string, IKeyDef> = {
    r00: num('/', 'symbol'), r10: num('7'), r20: num('8'), r30: num('9'), r40: num('*', 'symbol'),
    r01: num('.', 'symbol'), r11: num('4'), r21: num('5'), r31: num('6'), r41: num('-', 'symbol'),
    r02: num('0'), r12: num('1'), r22: num('2'), r32: num('3'), r42: num('+', 'symbol'),
    l01: { main: '⌘', type: 'mod' }, l11: { main: '⌥', type: 'mod' }, l21: { main: '⌃', type: 'mod' }, l31: { main: '⇧', type: 'mod' },
}
const numEnc = { ccw: '-', cw: '+', press: '=' }

const nav = (m: string, t = 'nav'): IKeyDef => ({ main: m, type: t })
const navKeys: Record<string, IKeyDef> = {
    r00: nav('⇥', 'mod'), r10: nav('⇞'), r20: nav('⇟'), r30: nav('⌫', 'bksp'), r40: nav('⌦'),
    r01: nav('⤒'), r11: nav('←'), r21: nav('↓'), r31: nav('↑'), r41: nav('→'),
    r02: nav('⤓'), r12: nav('↩', 'mod'), r22: nav('Home'), r32: nav('End'), r42: nav('⎋', 'mod'),
    l01: { main: '↶', type: 'mod' }, l11: { main: '✂', type: 'mod' }, l21: { main: '⧉', type: 'mod' }, l31: { main: '⎘', type: 'mod' }, l41: { main: '↷', type: 'mod' },
}
const navEnc = { ccw: '⇞', cw: '⇟', press: '↩' }

const fn = (m: string): IKeyDef => ({ main: m, type: 'fn' })
const fnKeys: Record<string, IKeyDef> = {
    l00: fn('F1'), l10: fn('F2'), l20: fn('F3'), l30: fn('F4'), l40: fn('F5'),
    r00: fn('F6'), r10: fn('F7'), r20: fn('F8'), r30: fn('F9'), r40: fn('F10'),
    l01: fn('F11'), l11: fn('F12'),
    r41: { main: 'Imp', type: 'mod' }, r31: { main: 'Arrêt', type: 'mod' }, r21: { main: 'Pause', type: 'mod' },
}
const fnEnc = { ccw: 'F-', cw: 'F+', press: '↩' }

const med = (m: string): IKeyDef => ({ main: m, type: 'media' })
const mediaKeys: Record<string, IKeyDef> = {
    r01: med('⏮'), r11: med('⏯'), r21: med('⏭'), r31: med('Vol−'), r41: med('Vol+'),
    r02: med('Mut'), r12: med('Lum−'), r22: med('Lum+'),
    l01: med('🔅'), l11: med('🔆'),
}
const mediaEnc = { ccw: 'Vol−', cw: 'Vol+', press: 'Mut' }

function makeShift(srcBase: Record<string, IKeyDef>): Record<string, IKeyDef> {
    const out: Record<string, IKeyDef> = {}
    Object.keys(srcBase).forEach(id => {
        const b = srcBase[id]
        if (!b) return
        if (b.type === 'letter') {
            out[id] = { main: b.shift ?? b.main.toUpperCase(), type: 'letter' }
        } else if (b.type === 'symbol' && b.shift) {
            out[id] = { main: b.shift, type: 'symbol' }
        }
    })
    return out
}
const shiftEnc = { ccw: '↑', cw: '↓', press: '⏯' }

function homeRowMods(keys: Record<string, IKeyDef>): Record<string, IKeyDef> {
    const mods: Record<string, string> = {
        l01: 'Super', l11: 'Alt', l21: 'Ctrl', l31: 'Maj',
        r11: 'Maj', r21: 'Ctrl', r31: 'Alt', r41: 'Super',
    }
    Object.keys(mods).forEach(id => { if (keys[id]) keys[id].hold = mods[id] })
    return keys
}
homeRowMods(baseKeys)

function mkLayer(
    id: string, nameFr: string, nameEn: string, color: string,
    triggerFr: string, triggerEn: string, triggerKeys: string[],
    keys: Record<string, IKeyDef>, encoder: typeof baseEnc, triggerType?: string,
): ILayer {
    return {
        id, name: { fr: nameFr, en: nameEn }, color,
        trigger: { type: triggerType ?? 'hold', label: { fr: triggerFr, en: triggerEn }, keys: triggerKeys ?? [] },
        keys, encoder,
    }
}

const ergolLayers: ILayer[] = [
    mkLayer('base', 'Base', 'Base', '#3B4252', 'Couche par défaut', 'Default layer', [], baseKeys, baseEnc, 'base'),
    mkLayer('shift', '⇧ Majuscules', '⇧ Shift', '#D4357A', 'Maintenir Maj (pouce)', 'Hold Shift (thumb)', ['rt2'], makeShift(baseKeys), shiftEnc, 'hold'),
    mkLayer('accents', '★ Accents', '★ Accents', '#2D6CDF', 'Touche morte ★ (rangée du bas)', 'Dead key ★ (bottom row)', ['l22'], accentKeys, accentEnc, 'deadkey'),
    mkLayer('altgr', 'AltGr', 'AltGr', '#1F8A5B', 'Maintenir pouce droit (AltGr)', 'Hold right thumb (AltGr)', ['rt2'], altgrKeys, altgrEnc, 'hold'),
    mkLayer('num', 'Chiffres', 'Numbers', '#C9821F', 'Maintenir pouce droit (Num)', 'Hold right thumb (Num)', ['rt0'], numKeys, numEnc, 'hold'),
    mkLayer('nav', 'Navigation', 'Navigation', '#8A4FC9', 'Maintenir pouce gauche (Nav)', 'Hold left thumb (Nav)', ['lt2'], navKeys, navEnc, 'hold'),
    mkLayer('fn', 'Fonctions', 'Functions', '#C9466B', 'Nav + Num (combo)', 'Nav + Num (combo)', ['lt2', 'rt0'], fnKeys, fnEnc, 'combo'),
    mkLayer('media', 'Média', 'Media', '#0E9BA8', 'Maintenir pouce gauche (Média)', 'Hold left thumb (Media)', ['lt0'], mediaKeys, mediaEnc, 'hold'),
]

const q = (m: string): IKeyDef => ({ main: m, type: 'letter', shift: m.toUpperCase() })
const qwertyBase: Record<string, IKeyDef> = {
    l00: q('q'), l10: q('w'), l20: q('e'), l30: q('r'), l40: q('t'),
    l01: q('a'), l11: q('s'), l21: q('d'), l31: q('f'), l41: q('g'),
    l02: q('z'), l12: q('x'), l22: q('c'), l32: q('v'), l42: q('b'),
    r00: q('y'), r10: q('u'), r20: q('i'), r30: q('o'), r40: q('p'),
    r01: q('h'), r11: q('j'), r21: q('k'), r31: q('l'), r41: { main: ';', type: 'symbol', shift: ':' },
    r02: q('n'), r12: q('m'), r22: { main: ',', type: 'symbol' }, r32: { main: '.', type: 'symbol' }, r42: { main: '/', type: 'symbol' },
    lt0: { main: '⎈', type: 'mod' }, lt1: { main: '␣', type: 'space' }, lt2: { main: 'Nav', type: 'layer', sub: 'MO' },
    rt0: { main: 'Num', type: 'layer', sub: 'MO' }, rt1: { main: '⏎', type: 'enter' }, rt2: { main: '⇧', type: 'mod' },
}
const qwertyLayers: ILayer[] = [
    mkLayer('base', 'Base', 'Base', '#3B4252', 'Couche par défaut', 'Default layer', [], homeRowMods(qwertyBase), baseEnc, 'base'),
    mkLayer('shift', '⇧ Majuscules', '⇧ Shift', '#D4357A', 'Maintenir Maj (pouce)', 'Hold Shift (thumb)', ['rt2'], makeShift(qwertyBase), shiftEnc, 'hold'),
    mkLayer('num', 'Chiffres', 'Numbers', '#C9821F', 'Maintenir pouce droit (Num)', 'Hold right thumb (Num)', ['rt0'], numKeys, numEnc, 'hold'),
    mkLayer('nav', 'Navigation', 'Navigation', '#8A4FC9', 'Maintenir pouce gauche (Nav)', 'Hold left thumb (Nav)', ['lt2'], navKeys, navEnc, 'hold'),
]

const az = (m: string, extra: Partial<IKeyDef> = {}): IKeyDef => ({ main: m, type: 'letter', shift: m.toUpperCase(), ...extra })
const azertyBase: Record<string, IKeyDef> = {
    l00: az('a'), l10: az('z'), l20: az('e'), l30: az('r'), l40: az('t'),
    l01: az('q'), l11: az('s'), l21: az('d'), l31: az('f'), l41: az('g'),
    l02: az('w'), l12: az('x'), l22: az('c'), l32: az('v'), l42: az('b'),
    r00: az('y'), r10: az('u'), r20: az('i'), r30: az('o'), r40: az('p'),
    r01: az('h'), r11: az('j'), r21: az('k'), r31: az('l'), r41: az('m'),
    r02: az('n'),
    r12: { main: ',', type: 'symbol', shift: '?' },
    r22: { main: ';', type: 'symbol', shift: '.' },
    r32: { main: ':', type: 'symbol', shift: '/' },
    r42: { main: '!', type: 'symbol', shift: '§' },
    lt0: { main: '⎈', type: 'mod' }, lt1: { main: '␣', type: 'space' }, lt2: { main: 'Nav', type: 'layer', sub: 'MO' },
    rt0: { main: 'Num', type: 'layer', sub: 'MO' }, rt1: { main: '⏎', type: 'enter' }, rt2: { main: '⇧', type: 'mod' },
}
const azertyLayers: ILayer[] = [
    mkLayer('base', 'Base', 'Base', '#3B4252', 'Couche par défaut', 'Default layer', [], homeRowMods(azertyBase), baseEnc, 'base'),
    mkLayer('shift', '⇧ Majuscules', '⇧ Shift', '#D4357A', 'Maintenir Maj (pouce)', 'Hold Shift (thumb)', ['rt2'], makeShift(azertyBase), shiftEnc, 'hold'),
    mkLayer('accents', '★ Accents', '★ Accents', '#2D6CDF', 'Touche morte ★', 'Dead key ★', ['l22'], accentKeys, accentEnc, 'deadkey'),
    mkLayer('num', 'Chiffres', 'Numbers', '#C9821F', 'Maintenir pouce droit (Num)', 'Hold right thumb (Num)', ['rt0'], numKeys, numEnc, 'hold'),
    mkLayer('nav', 'Navigation', 'Navigation', '#8A4FC9', 'Maintenir pouce gauche (Nav)', 'Hold left thumb (Nav)', ['lt2'], navKeys, navEnc, 'hold'),
    mkLayer('media', 'Média', 'Media', '#0E9BA8', 'Maintenir pouce gauche (Média)', 'Hold left thumb (Media)', ['lt0'], mediaKeys, mediaEnc, 'hold'),
]

const bp = (m: string): IKeyDef => ({ main: m, type: 'letter', shift: m.toUpperCase() })
const bepoBase: Record<string, IKeyDef> = {
    l00: { main: 'b', type: 'letter', shift: 'B' },
    l10: { main: 'é', type: 'letter', shift: 'É' },
    l20: { main: 'p', type: 'letter', shift: 'P' },
    l30: { main: 'o', type: 'letter', shift: 'O' },
    l40: { main: 'è', type: 'letter', shift: 'È' },
    l01: bp('a'), l11: bp('u'), l21: bp('i'), l31: bp('e'),
    l41: { main: ',', type: 'symbol', shift: ';' },
    l02: { main: 'à', type: 'letter', shift: 'À' }, l12: bp('y'), l22: bp('x'),
    l32: { main: '.', type: 'symbol', shift: ':' }, l42: bp('k'),
    r00: bp('v'), r10: bp('d'), r20: bp('l'), r30: bp('j'), r40: bp('z'),
    r01: bp('c'), r11: bp('t'), r21: bp('s'), r31: bp('r'), r41: bp('n'),
    r02: { main: "'", type: 'symbol', shift: '?' }, r12: bp('q'), r22: bp('g'), r32: bp('h'), r42: bp('f'),
    lt0: { main: '⎈', type: 'mod' }, lt1: { main: '␣', type: 'space' }, lt2: { main: 'Nav', type: 'layer', sub: 'MO' },
    rt0: { main: 'Num', type: 'layer', sub: 'MO' }, rt1: { main: '⏎', type: 'enter' }, rt2: { main: '⇧', type: 'mod' },
}
const bepoLayers: ILayer[] = [
    mkLayer('base', 'Base', 'Base', '#3B4252', 'Couche par défaut', 'Default layer', [], homeRowMods(bepoBase), baseEnc, 'base'),
    mkLayer('shift', '⇧ Majuscules', '⇧ Shift', '#D4357A', 'Maintenir Maj (pouce)', 'Hold Shift (thumb)', ['rt2'], makeShift(bepoBase), shiftEnc, 'hold'),
    mkLayer('accents', '★ Accents', '★ Accents', '#2D6CDF', 'Touche morte ★', 'Dead key ★', ['l22'], accentKeys, accentEnc, 'deadkey'),
    mkLayer('altgr', 'AltGr', 'AltGr', '#1F8A5B', 'Maintenir pouce droit (AltGr)', 'Hold right thumb (AltGr)', ['rt2'], altgrKeys, altgrEnc, 'hold'),
    mkLayer('num', 'Chiffres', 'Numbers', '#C9821F', 'Maintenir pouce droit (Num)', 'Hold right thumb (Num)', ['rt0'], numKeys, numEnc, 'hold'),
    mkLayer('nav', 'Navigation', 'Navigation', '#8A4FC9', 'Maintenir pouce gauche (Nav)', 'Hold left thumb (Nav)', ['lt2'], navKeys, navEnc, 'hold'),
    mkLayer('media', 'Média', 'Media', '#0E9BA8', 'Maintenir pouce gauche (Média)', 'Hold left thumb (Media)', ['lt0'], mediaKeys, mediaEnc, 'hold'),
]

const D = (m: string, t = 'nav'): IJoystickDir => ({ main: m, type: t })

function mode(id: string, nameFr: string, nameEn: string, color: string, dirs: Record<string, IJoystickDir>, press: IJoystickDir) {
    return { id, name: { fr: nameFr, en: nameEn }, color, dirs, press }
}

const defaultJoysticks: Record<string, IJoystick> = {
    L: {
        active: 0,
        modes: [
            mode('nav', 'Navigation', 'Navigation', '#8A4FC9',
                { n: D('↑'), ne: D('⇞'), e: D('→'), se: D('⇟'), s: D('↓'), sw: D('End'), w: D('←'), nw: D('Home') },
                D('↩', 'mod')),
            mode('mouse', 'Souris', 'Mouse', '#1F9B8E',
                { n: D('↑', 'media'), ne: D('↗', 'media'), e: D('→', 'media'), se: D('↘', 'media'), s: D('↓', 'media'), sw: D('↙', 'media'), w: D('←', 'media'), nw: D('↖', 'media') },
                D('Clic G', 'mod')),
            mode('layers', 'Couches', 'Layers', '#C9821F',
                { n: D('Num', 'layer'), ne: D('Sym', 'layer'), e: D('Nav', 'layer'), se: D('Fn', 'layer'), s: D('Média', 'layer'), sw: D('—', 'trans'), w: D('—', 'trans'), nw: D('—', 'trans') },
                D('Base', 'layer')),
        ],
    },
    R: {
        active: 0,
        modes: [
            mode('mouse', 'Souris', 'Mouse', '#1F9B8E',
                { n: D('↑', 'media'), ne: D('↗', 'media'), e: D('→', 'media'), se: D('↘', 'media'), s: D('↓', 'media'), sw: D('↙', 'media'), w: D('←', 'media'), nw: D('↖', 'media') },
                D('Clic G', 'mod')),
            mode('scroll', 'Défilement', 'Scroll', '#3F7FD1',
                { n: D('⇡', 'media'), ne: D('—', 'trans'), e: D('⇢', 'media'), se: D('—', 'trans'), s: D('⇣', 'media'), sw: D('—', 'trans'), w: D('⇠', 'media'), nw: D('—', 'trans') },
                D('Clic M', 'mod')),
            mode('media', 'Média', 'Media', '#0E9BA8',
                { n: D('Vol+', 'media'), ne: D('—', 'trans'), e: D('⏭', 'media'), se: D('—', 'trans'), s: D('Vol−', 'media'), sw: D('—', 'trans'), w: D('⏮', 'media'), nw: D('—', 'trans') },
                D('⏯', 'media')),
        ],
    },
}

const joystickLayers = JSON.parse(JSON.stringify(ergolLayers)) as ILayer[]

export const DEFAULT_CONFIG: IConfig = {
    version: 3,
    activeLayout: 'ergol',
    activeLayer: 'base',
    showLegends: true,
    lang: 'fr',
    layouts: [
        { id: 'ergol', name: 'Ergo‑L', board: 'cheapino-v2', layers: ergolLayers },
        { id: 'azerty', name: 'AZERTY', board: 'cheapino-v2', layers: azertyLayers },
        { id: 'bepo', name: 'BÉPO', board: 'cheapino-v2', layers: bepoLayers },
        { id: 'qwerty', name: 'QWERTY', board: 'cheapino-v2', layers: qwertyLayers },
        { id: 'joystick', name: 'Ergo‑L · Joystick', board: 'cheapino-joystick', layers: joystickLayers, joysticks: defaultJoysticks },
    ],
}
