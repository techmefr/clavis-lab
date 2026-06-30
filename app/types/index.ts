export interface IKeyDef {
    main: string
    type: string
    shift?: string
    altgr?: string
    dead?: string
    hold?: string
    sub?: string
}

export interface IEncoderDef {
    ccw: string
    cw: string
    press: string
}

export interface IKeyPos {
    id: string
    hand: string
    kind: 'matrix' | 'thumb' | 'encoder' | 'joystick' | 'modebtn' | 'trackball'
    finger: string
    x: number
    y: number
    rot?: number
    w?: number
    h?: number
    col?: number
    row?: number
}

export interface IBoard {
    id?: string
    isCustom?: boolean
    U: number
    KEYW: number
    KEYH: number
    keys: IKeyPos[]
    widthPx: number
    heightPx: number
    matrixIds: string[]
}

export interface ITrigger {
    type: string
    label: { fr: string; en: string }
    keys: string[]
}

export interface ILayer {
    id: string
    name: { fr: string; en: string }
    color: string
    trigger: ITrigger
    keys: Record<string, IKeyDef>
    encoder?: IEncoderDef
}

export interface IJoystickDir {
    main: string
    type: string
}

export interface IJoystickMode {
    id: string
    name: { fr: string; en: string }
    color: string
    dirs: Record<string, IJoystickDir>
    press: IJoystickDir
}

export interface IJoystick {
    active: number
    modes: IJoystickMode[]
}

export interface ILayout {
    id: string
    name: string
    board: string
    layers: ILayer[]
    joysticks?: Record<string, IJoystick>
}

export interface IConfig {
    version: number
    activeLayout: string
    activeLayer: string
    showLegends: boolean
    lang: string
    layouts: ILayout[]
    customBoards?: IBoard[]
}

export type ILang = 'fr' | 'en'

export interface IKeycode {
    main: string
    type: string
    shift?: string
    sub?: string
}

export interface IHold {
    v: string
    t: string
}

export interface IKeycodes {
    letters: IKeycode[]
    accents: IKeycode[]
    numbers: IKeycode[]
    symbols: IKeycode[]
    nav: IKeycode[]
    mods: IKeycode[]
    media: IKeycode[]
    fn: IKeycode[]
    special: IKeycode[]
    holds: IHold[]
}

export interface II18nStrings {
    appTitle: string
    layout: string
    newLayout: string
    duplicate: string
    rename: string
    del: string
    layers: string
    addLayer: string
    trigger: string
    triggerHint: string
    editKey: string
    typeChar: string
    orPick: string
    legend: string
    mainLabel: string
    shiftLabel: string
    altgrLabel: string
    deadLabel: string
    holdLabel: string
    tapLabel: string
    holdHint: string
    noHold: string
    apply: string
    clear: string
    cancel: string
    exportPdf: string
    exportCfg: string
    importCfg: string
    reset: string
    showLegends: string
    fingers: string
    encoder: string
    joystick: string
    modeBtn: string
    modeName: string
    directions: string
    turnL: string
    turnR: string
    press: string
    thumb: string
    saved: string
    printTitle: string
    base: string
    triggerKeys: string
    pickTrigger: string
    done: string
    catLetters: string
    catNumbers: string
    catSymbols: string
    catNav: string
    catMods: string
    catMedia: string
    catFn: string
    catLayers: string
    catSpecial: string
    newLayerName: string
    newLayoutName: string
    blank: string
    whiteboard: string
    buildBoard: string
    exitBuild: string
    addKeyHint: string
    modifyBoard: string
    kindMatrix: string
    kindThumb: string
    kindEncoder: string
    keyHint: string
    fingerNames: Record<string, string>
}

export type IAnyKeyDef = IKeyDef | IEncoderDef

export type IModalKind = 'newLayout' | 'newLayer' | 'renameLayer' | 'encoder' | 'joystick'

export interface IModal {
    kind: IModalKind
    id?: string
    name?: string
    mode?: string
    hand?: string
}
