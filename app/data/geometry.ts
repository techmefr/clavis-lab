import type { IBoard, IKeyPos } from '~/types'

const U = 64
const KEYW = 58
const KEYH = 58
const GAP = 2.05

const offL = [0.55, 0.30, 0.0, 0.28, 0.45]
const offR = [0.45, 0.28, 0.0, 0.30, 0.55]
const fingerL = ['lp', 'lr', 'lm', 'li', 'li']
const fingerR = ['ri', 'ri', 'rm', 'rr', 'rp']
const rx0 = 5 + GAP
const totalW = rx0 + 5

function matrixKeys(): IKeyPos[] {
    const keys: IKeyPos[] = []
    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
            keys.push({ id: 'l' + c + r, hand: 'L', kind: 'matrix', finger: fingerL[c]!, col: c, row: r, x: c, y: offL[c]! + r, rot: 0 })
        }
    }
    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
            keys.push({ id: 'r' + c + r, hand: 'R', kind: 'matrix', finger: fingerR[c]!, col: c, row: r, x: rx0 + c, y: offR[c]! + r, rot: 0 })
        }
    }
    return keys
}

function encoder(): IKeyPos {
    return { id: 'enc', hand: 'R', kind: 'encoder', finger: 'enc', x: totalW + 0.18, y: 0.15, rot: 0, w: 1, h: 1 }
}

function finalize(keys: IKeyPos[]): IBoard {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    keys.forEach(k => {
        const w = k.w ?? 1
        const h = k.h ?? 1
        minX = Math.min(minX, k.x); minY = Math.min(minY, k.y)
        maxX = Math.max(maxX, k.x + w); maxY = Math.max(maxY, k.y + h)
    })
    keys.forEach(k => { k.x -= minX; k.y -= minY })
    return {
        U, KEYW, KEYH, keys,
        widthPx: (maxX - minX) * U + (U - KEYW),
        heightPx: (maxY - minY) * U + (U - KEYH),
        matrixIds: keys.filter(k => k.kind === 'matrix').map(k => k.id),
    }
}

function boardThumbs(): IBoard {
    const keys = matrixKeys()
    const lThumbs = [
        { id: 'lt0', x: 2.55, y: 3.62, rot: 10 },
        { id: 'lt1', x: 3.58, y: 3.86, rot: 14 },
        { id: 'lt2', x: 4.60, y: 4.16, rot: 18 },
    ]
    lThumbs.forEach(t => keys.push({ ...t, hand: 'L', kind: 'thumb', finger: 'th' }))
    lThumbs.forEach((t, i) => keys.push({ id: 'rt' + i, x: totalW - t.x - 1, y: t.y, rot: -t.rot, hand: 'R', kind: 'thumb', finger: 'th' }))
    keys.push(encoder())
    return finalize(keys)
}

function boardJoystick(): IBoard {
    const keys = matrixKeys()
    const JS = 2
    const ljx = 2.6, ljy = 3.65
    keys.push({ id: 'jsL', hand: 'L', kind: 'joystick', finger: 'th', x: ljx, y: ljy, w: JS, h: JS, rot: 0 })
    keys.push({ id: 'mbL', hand: 'L', kind: 'modebtn', finger: 'th', x: ljx - 1.25, y: ljy + 0.9, w: 1, h: 1, rot: 0 })
    const rjx = totalW - ljx - JS
    keys.push({ id: 'jsR', hand: 'R', kind: 'joystick', finger: 'th', x: rjx, y: ljy, w: JS, h: JS, rot: 0 })
    keys.push({ id: 'mbR', hand: 'R', kind: 'modebtn', finger: 'th', x: rjx + JS + 0.25, y: ljy + 0.9, w: 1, h: 1, rot: 0 })
    keys.push(encoder())
    return finalize(keys)
}

export const BOARDS: Record<string, IBoard> = {
    'cheapino-v2': boardThumbs(),
    'cheapino-joystick': boardJoystick(),
}

export const CHEAPINO = BOARDS['cheapino-v2']!

export function getBoard(id: string): IBoard {
    return BOARDS[id] ?? BOARDS['cheapino-v2']!
}
