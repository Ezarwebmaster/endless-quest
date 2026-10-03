#!/usr/bin/env node
// The rules of The Endless Quest, run by `npm test`. LLM TimeMachine runs it
// before and after each model's step; a step that makes it fail is marked
// broken and kept off the main line. It checks exactly the rules of the
// prompt (QUEST.md lists them too):
//   1. the game still starts and runs: it is played for a while in a fake
//      browser (canvas, sound and keyboard simulated), and any error fails;
//   2. no file deleted, at most MAX_REMOVED lines removed;
//   3. only game/ and QUEST.md change;
//   4. nothing from the internet: no http(s) link, no module script;
//   5. QUEST.md gained a line in "What's in the game";
//   6. the cast gained one line, and the step did its share of the quest:
//      a figure hidden in the dungeon that waited for one, or, when none
//      waited, a new dungeon (the game before the step and after it are
//      both loaded, and what they hold is compared).
// build.mjs imports the rules that can be read from a diff (2 to 5).
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, normalize, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

export const MAX_REMOVED = 300
export const SECTION = "What's in the game"
const TEXT = /\.(js|html|css|json|md|txt|svg)$/i

// ------------------------------------------------------------ diff rules
// changes: [{ status: 'A' | 'M' | 'D' | …, path }], removed: lines removed.
export function changeProblems({ changes, removed, questBefore = '', questAfter = '' }) {
  const out = []
  for (const c of changes) {
    if (c.status === 'D') out.push(`never delete a file: ${c.path} was deleted`)
    else if (!c.path.startsWith('game/') && c.path !== 'QUEST.md') out.push(`only game/ and QUEST.md may change: ${c.path} changed`)
  }
  if (removed > MAX_REMOVED) out.push(`at most ${MAX_REMOVED} lines may be removed: this step removed ${removed}`)
  if (changes.length && questItems(questAfter).length <= questItems(questBefore).length) {
    out.push(`add one line about your addition to "${SECTION}" in QUEST.md`)
  }
  return out
}

// The list items of QUEST.md's "What's in the game" section.
export function questItems(md) {
  const lines = String(md).split('\n')
  const start = lines.findIndex(l => /^##\s/.test(l) && l.includes(SECTION))
  if (start === -1) return []
  const items = []
  for (const l of lines.slice(start + 1)) {
    if (/^##\s/.test(l)) break
    if (/^\s*[-*]\s+\S/.test(l)) items.push(l.trim().replace(/^[-*]\s+/, ''))
  }
  return items
}

// files: [{ path, text }] of the game. XML namespaces (http://www.w3.org/…)
// are names, not links, so they pass.
export function linkProblems(files) {
  const out = []
  for (const f of files) {
    if (!f.path.startsWith('game/') || !TEXT.test(f.path)) continue
    const text = f.text.replace(/https?:\/\/www\.w3\.org\/[^\s'"`)]*/g, '')
    const link = text.match(/https?:\/\/[^\s'"`)<>]+|(?<=["'(`])\/\/[a-z0-9-]+(\.[a-z0-9-]+)+[^\s'"`)]*/i)
    if (link) out.push(`nothing from the internet: ${f.path} links to ${link[0].slice(0, 80)}`)
    if (/\.html$/i.test(f.path) && /<script\b[^>]*type\s*=\s*["']?module/i.test(f.text)) out.push(`${f.path}: use classic scripts, not modules (see QUEST.md)`)
  }
  return out
}

// The scripts game/index.html loads, in order: { src } or { code }.
export function pageScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(([, attrs, code]) => {
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
    return src ? { src } : { code }
  })
}

// Every script must exist inside game/, and every .js file of game/ must be loaded.
export function loadProblems(dir) {
  const out = []
  const html = readFileSync(join(dir, 'index.html'), 'utf8')
  const loaded = new Set()
  for (const s of pageScripts(html)) {
    if (!s.src) continue
    const file = normalize(join(dir, s.src))
    if (relative(dir, file).startsWith('..')) { out.push(`game/index.html loads ${s.src}, outside game/`); continue }
    if (!existsSync(file)) out.push(`game/index.html loads ${s.src}, which does not exist`)
    loaded.add(relative(dir, file).split(sep).join('/'))
  }
  for (const f of walk(dir).filter(f => f.endsWith('.js'))) {
    if (!loaded.has(f)) out.push(`game/${f} is never loaded: add <script src="${f}"></script> to game/index.html`)
  }
  return out
}

function walk(dir, base = dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p, base) : [relative(base, p).split(sep).join('/')]
  })
}

// ------------------------------------------------------------ the playtest
// A browser small enough to run the game: the canvas draws nothing, sound
// makes none, time is simulated. Unknown methods are harmless no-ops, so a
// model may use any canvas or Web Audio call.
function lenient(target) {
  return new Proxy(target, {
    get(t, p) {
      if (p in t || typeof p === 'symbol' || p === 'then' || p === 'toJSON') return t[p]
      return () => undefined
    },
  })
}

function fakeBrowser(clock, counters) {
  const listeners = new Map()
  const on = (map, type, fn) => { if (typeof fn === 'function') (map.get(type) || map.set(type, []).get(type)).push(fn) }
  const off = (map, type, fn) => map.set(type, (map.get(type) || []).filter(f => f !== fn))
  const fire = (map, event) => { for (const fn of [...(map.get(event.type) || [])]) fn(event) }
  const events = () => {
    const m = new Map()
    return { addEventListener: (t, f) => on(m, t, f), removeEventListener: (t, f) => off(m, t, f), dispatchEvent: e => { fire(m, e); return true }, _fire: e => fire(m, e) }
  }
  const param = v => lenient({ value: v, defaultValue: v, setValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, cancelAndHoldAtTime() {}, setValueCurveAtTime() {},
    exponentialRampToValueAtTime(x) { if (!(x > 0)) throw new RangeError(`exponentialRampToValueAtTime: the value must be above 0, got ${x}`) } })
  const node = (extra = {}) => lenient({ connect: n => n, disconnect() {}, start() {}, stop() {}, addEventListener() {}, onended: null,
    frequency: param(440), detune: param(0), gain: param(1), Q: param(1), pan: param(0), delayTime: param(0), playbackRate: param(1), offset: param(1),
    threshold: param(-24), knee: param(30), ratio: param(12), attack: param(0.003), release: param(0.25), type: 'sine', buffer: null, loop: false, ...extra })
  class AudioContext {
    constructor() { this.destination = node(); this.sampleRate = 44100; this.state = 'running'; this.listener = node() }
    get currentTime() { return clock.now / 1000 }
    resume() { return Promise.resolve() }
    suspend() { return Promise.resolve() }
    close() { return Promise.resolve() }
    createBuffer(ch, len, rate) { return { length: len, sampleRate: rate, numberOfChannels: ch, duration: len / rate, getChannelData: () => new Float32Array(len), copyToChannel() {} } }
    decodeAudioData() { return Promise.reject(new Error('playtest: no audio files to decode')) }
  }
  for (const m of ['createOscillator', 'createGain', 'createBiquadFilter', 'createBufferSource', 'createDynamicsCompressor', 'createStereoPanner', 'createDelay',
    'createConvolver', 'createWaveShaper', 'createAnalyser', 'createConstantSource', 'createPanner', 'createChannelMerger', 'createChannelSplitter', 'createIIRFilter']) {
    AudioContext.prototype[m] = function () { return node({ context: this }) }
  }
  AudioContext.prototype.createPeriodicWave = () => ({})

  const ctx2d = canvas => lenient({
    canvas, fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1, lineWidth: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic',
    imageSmoothingEnabled: true, globalCompositeOperation: 'source-over', filter: 'none', lineCap: 'butt', lineJoin: 'miter', shadowBlur: 0, shadowColor: '#0000', shadowOffsetX: 0, shadowOffsetY: 0,
    fillRect() { counters.draws++ }, drawImage() { counters.draws++ }, fillText() { counters.draws++ }, fill() { counters.draws++ }, stroke() { counters.draws++ }, putImageData() { counters.draws++ },
    measureText: t => ({ width: String(t).length * 6, actualBoundingBoxAscent: 7, actualBoundingBoxDescent: 2 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), createConicGradient: () => ({ addColorStop() {} }), createPattern: () => ({ setTransform() {} }),
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h * 4)) }),
    createImageData: (w, h) => ({ width: w?.width ?? w, height: w?.height ?? h, data: new Uint8ClampedArray(Math.max(1, (w?.width ?? w) * (w?.height ?? h) * 4)) }),
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }), isPointInPath: () => false, isPointInStroke: () => false, getLineDash: () => [],
  })
  const element = (tag = 'div') => {
    const ev = events()
    const el = lenient({
      tagName: tag.toUpperCase(), nodeName: tag.toUpperCase(), style: {}, dataset: {}, children: [], childNodes: [], attributes: {}, textContent: '', innerHTML: '', innerText: '', value: '', hidden: false, parentNode: null,
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      appendChild(c) { this.children.push(c); return c }, removeChild(c) { return c }, remove() {}, append() {}, prepend() {}, insertBefore: c => c, replaceChildren() {},
      setAttribute(k, v) { this.attributes[k] = String(v) }, getAttribute(k) { return this.attributes[k] ?? null }, removeAttribute(k) { delete this.attributes[k] }, hasAttribute(k) { return k in this.attributes },
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 512, bottom: 448, width: 512, height: 448, x: 0, y: 0 }),
      focus() {}, blur() {}, click() {}, querySelector: () => null, querySelectorAll: () => [], getElementsByTagName: () => [], closest: () => null, contains: () => false,
      ...ev,
    })
    return el
  }
  const canvas = (w = 300, h = 150) => {
    const el = element('canvas')
    el.width = w
    el.height = h
    let c = null
    el.getContext = type => (type === '2d' ? (c ||= ctx2d(el)) : null)
    el.toDataURL = () => 'data:image/png;base64,'
    el.toBlob = cb => cb?.(null)
    return el
  }
  const byId = { game: canvas(512, 448) }
  const doc = events()
  const document = lenient({
    ...doc, readyState: 'complete', hidden: false, visibilityState: 'visible', title: 'The Endless Quest', cookie: '',
    body: element('body'), head: element('head'), documentElement: element('html'),
    getElementById: id => (byId[id] ||= element('div')),
    querySelector: sel => (sel.startsWith('#') ? (byId[sel.slice(1)] ||= element('div')) : sel === 'canvas' ? byId.game : null),
    querySelectorAll: sel => (sel === 'canvas' ? [byId.game] : []),
    getElementsByTagName: tag => (tag === 'canvas' ? [byId.game] : []),
    createElement: tag => (String(tag).toLowerCase() === 'canvas' ? canvas() : element(tag)),
    createElementNS: (ns, tag) => element(tag), createTextNode: text => ({ textContent: text }), createDocumentFragment: () => element('fragment'),
  })
  const store = () => {
    const m = new Map()
    return { getItem: k => (m.has(String(k)) ? m.get(String(k)) : null), setItem: (k, v) => m.set(String(k), String(v)), removeItem: k => m.delete(String(k)), clear: () => m.clear(), key: i => [...m.keys()][i] ?? null, get length() { return m.size } }
  }
  class Image { constructor() { this.width = 0; this.height = 0; this.complete = false } set src(v) { this._src = v; this.complete = true; this.width = this.height = 16; queueMicrotask(() => this.onload?.()) } get src() { return this._src } decode() { return Promise.resolve() } addEventListener(t, f) { if (t === 'load') this.onload = f } }
  class Event { constructor(type, init = {}) { Object.assign(this, init); this.type = type; this.defaultPrevented = false } preventDefault() { this.defaultPrevented = true } stopPropagation() {} stopImmediatePropagation() {} }
  const win = events()
  return {
    win, doc, document, element, byId,
    globals: {
      document, Image, Event, KeyboardEvent: Event, MouseEvent: Event, PointerEvent: Event, TouchEvent: Event, CustomEvent: Event,
      AudioContext, webkitAudioContext: AudioContext, OfflineAudioContext: AudioContext, Audio: class { constructor() { return node({ play: () => Promise.resolve(), pause() {}, load() {}, volume: 1, currentTime: 0, src: '' }) } },
      HTMLCanvasElement: function HTMLCanvasElement() {}, OffscreenCanvas: class { constructor(w, h) { return canvas(w, h) } },
      localStorage: store(), sessionStorage: store(),
      navigator: { userAgent: 'EndlessQuestPlaytest', language: 'en', languages: ['en'], maxTouchPoints: 0, getGamepads: () => [], vibrate: () => false, onLine: true },
      location: { href: 'https://quest.local/', origin: 'https://quest.local', protocol: 'https:', host: 'quest.local', hostname: 'quest.local', pathname: '/', search: '', hash: '', reload() {}, assign() {}, replace() {} },
      history: { pushState() {}, replaceState() {}, back() {} },
      screen: { width: 1280, height: 800, availWidth: 1280, availHeight: 800, orientation: { type: 'landscape-primary', addEventListener() {} } },
      innerWidth: 1024, innerHeight: 896, outerWidth: 1024, outerHeight: 896, devicePixelRatio: 1, scrollX: 0, scrollY: 0,
      matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
      getComputedStyle: () => ({ getPropertyValue: () => '' }),
      alert() {}, confirm: () => false, prompt: () => null, focus() {}, blur() {}, scrollTo() {}, open: () => null, postMessage() {},
      fetch: () => Promise.reject(new Error('playtest: fetch is not available: keep the game\'s data in its scripts')),
      XMLHttpRequest: class { open() {} send() { throw new Error('playtest: XMLHttpRequest is not available: keep the game\'s data in its scripts') } setRequestHeader() {} },
      WebSocket: class { constructor() { throw new Error('playtest: no network') } },
      Worker: class { constructor() { throw new Error('playtest: Web Workers are not available: keep the game in plain scripts') } },
      structuredClone, TextEncoder, TextDecoder, URL, URLSearchParams, atob, btoa, crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a }, randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    },
  }
}

// A deterministic random number generator (mulberry32), so a failure can be replayed.
const rng = seed => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

const KEYCODES = { ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39], ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9], ShiftLeft: ['Shift', 16] }
const keyEvent = (type, code) => {
  const [key, keyCode] = KEYCODES[code] || (code.startsWith('Key') ? [code.slice(3).toLowerCase(), code.charCodeAt(3)] : code.startsWith('Digit') ? [code.slice(5), code.charCodeAt(5)] : [code, 0])
  return { type, code, key, keyCode, which: keyCode, repeat: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, target: null, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} }
}

// Loads the game in a fake browser, as the page would, and fires the load
// event. read(path) returns a file of game/ (path relative to game/).
function boot(read, { seed = 7 } = {}) {
  const problems = []
  const clock = { now: 0 }
  const counters = { draws: 0 }
  const errors = []
  const raf = [], timers = []
  let rafId = 0, timerId = 0
  const fb = fakeBrowser(clock, counters)
  const sandbox = {
    ...fb.globals,
    console: { log() {}, info() {}, debug() {}, warn() {}, error() {}, trace() {}, table() {}, group() {}, groupEnd() {}, groupCollapsed() {}, time() {}, timeEnd() {}, assert() {} },
    requestAnimationFrame: fn => { raf.push({ id: ++rafId, fn }); return rafId },
    cancelAnimationFrame: id => { const i = raf.findIndex(r => r.id === id); if (i !== -1) raf.splice(i, 1) },
    setTimeout: (fn, ms = 0, ...args) => { timers.push({ id: ++timerId, at: clock.now + Math.max(0, +ms || 0), fn, args }); return timerId },
    setInterval: (fn, ms = 0, ...args) => { const every = Math.max(1, +ms || 1); timers.push({ id: ++timerId, at: clock.now + every, every, fn, args }); return timerId },
    clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i !== -1) timers.splice(i, 1) },
    performance: { now: () => clock.now, mark() {}, measure() {} },
    addEventListener: fb.win.addEventListener, removeEventListener: fb.win.removeEventListener, dispatchEvent: fb.win.dispatchEvent, _fire: fb.win._fire,
    __raf: raf, __timers: timers, __errors: errors, __clock: clock,
  }
  sandbox.clearInterval = sandbox.clearTimeout
  const context = vm.createContext(sandbox, { microtaskMode: 'afterEvaluate' })
  vm.runInContext(`
    globalThis.window = globalThis; globalThis.self = globalThis; globalThis.top = globalThis; globalThis.parent = globalThis
    globalThis.queueMicrotask = fn => { Promise.resolve().then(fn) }
    Math.random = (${rng.toString()})(${seed})
    globalThis.__frame = function (now) {
      __clock.now = now
      for (const t of __timers.filter(t => t.at <= now).sort((a, b) => a.at - b.at)) {
        if (t.every) t.at += t.every; else __timers.splice(__timers.indexOf(t), 1)
        try { typeof t.fn === 'function' && t.fn(...t.args) } catch (e) { __errors.push(e) }
      }
      for (const r of __raf.splice(0)) { try { r.fn(now) } catch (e) { __errors.push(e) } }
    }`, context)

  // The place in the game's code to blame: the first frame outside the
  // engine when there is one (the content that called it), else the engine.
  const blame = stack => {
    const at = String(stack || '').split('\n').map(l => l.match(/(game\/[^\s):]+:\d+)/)?.[1]).filter(Boolean)
    return at.find(a => !a.startsWith('game/engine.js')) || at[0]
  }
  const where = e => {
    const at = blame(e?.stack)
    return `${e?.name || 'Error'}: ${e?.message || e}${at ? ` (${at})` : ''}`
  }
  const fail = (msg) => { problems.push(msg); return problems }
  const evaluate = (code, label) => {
    try { return vm.runInContext(code, context, { timeout: 2000 }) } catch (e) { problems.push(`${label}: ${where(e)}`); return undefined }
  }
  const game = { problems, fail, evaluate, fb, clock, counters, errors, blame, where }

  // Load every script of game/index.html, in order, as the browser would.
  const html = read('index.html') ?? ''
  for (const s of pageScripts(html)) {
    const name = s.src ? `game/${s.src.replace(/^\.\//, '')}` : 'game/index.html (inline script)'
    const code = s.src ? read(s.src.replace(/^\.\//, '')) ?? '' : s.code
    try {
      new vm.Script(code, { filename: name }).runInContext(context, { timeout: 5000 })
    } catch (e) {
      fail(`the game does not load: ${where(e)}${e?.name === 'SyntaxError' ? ` in ${name}` : ''}`)
      return game
    }
  }
  evaluate(`document._fire?.({ type: 'DOMContentLoaded' }); window._fire?.({ type: 'DOMContentLoaded' }); window._fire({ type: 'load' })`, 'starting the page')
  if (problems.length) return game
  if (evaluate('typeof Q === "object" && Q && typeof Q.rooms === "object"', 'checking the engine') !== true) fail('the engine (game/engine.js) did not define Q')
  else if (evaluate('!!Q.rooms["0_0"] && !!Q.types.hero', 'checking the start') !== true) fail('the game needs room 0_0 and the hero')
  return game
}

const fromDir = dir => path => { try { return readFileSync(join(dir, path), 'utf8') } catch { return null } }

// What a version of the game holds: its cast, its dungeons and its figures.
// null when it does not load.
export function inventory(read) {
  const game = boot(read)
  if (game.problems.length) return null
  return JSON.parse(game.evaluate(`JSON.stringify({
    cast: (Q.cast || []).map(c => ({ step: c.step, by: c.by, did: c.did })),
    dungeons: (Q.dungeons || []).map(d => ({ id: d.id, name: d.name })),
    figures: (Q.figures || []).map(f => ({ name: f.name, born: f.born, died: f.died, room: f.room, dungeon: Q.parseKey(f.room)?.grid || '' })),
  })`, 'reading the game') || 'null')
}

const listNames = ds => ds.map(d => d.name).join(', ')
// The dungeons that wait for a figure.
export const waitingDungeons = inv => inv.dungeons.filter(d => !inv.figures.some(f => f.dungeon === d.id))

// What a step must do, given the game it starts from.
export function stepTask(inv) {
  const waiting = waitingDungeons(inv)
  if (waiting.length) return `hide a figure from history in ${listNames(waiting)} (it waits for one), then add one more thing of your choice`
  return `${inv.dungeons.length ? 'every dungeon has its figure' : 'there is no dungeon yet'}: build a new dungeon, with a way in from the world, and leave it waiting for the next model's figure`
}

// Rule 6: the game before the step (before) and after it (after).
export function stepProblems(before, after) {
  const out = []
  const line = c => `${c.step}|${c.by}|${c.did}`
  if (before.cast.some((c, i) => !after.cast[i] || line(c) !== line(after.cast[i]))) out.push('never change or remove a line of the cast (game/cast.js)')
  else if (after.cast.length === before.cast.length) out.push('add your line to the cast: Q.credit({ by, did }) at the end of game/cast.js')
  else if (after.cast.length > before.cast.length + 1) out.push('add one line to the cast (game/cast.js), not more')
  for (const d of before.dungeons) if (!after.dungeons.some(a => a.id === d.id)) out.push(`never remove a dungeon: ${d.name} is gone`)
  for (const f of before.figures) if (!after.figures.some(a => a.name === f.name)) out.push(`never remove a figure: ${f.name} is gone`)
  const waiting = waitingDungeons(before)
  const added = after.figures.filter(f => !before.figures.some(b => b.name === f.name))
  const built = after.dungeons.filter(d => !before.dungeons.some(b => b.id === d.id))
  if (added.length > 1) out.push(`hide one figure per step: this step added ${added.length} (${added.map(f => f.name).join(', ')})`)
  for (const f of added) {
    if (waiting.some(d => d.id === f.dungeon)) continue
    out.push(waiting.length
      ? `${f.name} must hide in a dungeon that was waiting for its figure: ${listNames(waiting)}`
      : `${f.name}: no dungeon was waiting for a figure, so this step builds a new dungeon and leaves it for the next model`)
  }
  if (waiting.length && !added.length) out.push(`${listNames(waiting)} ${waiting.length > 1 ? 'wait' : 'waits'} for a figure: hide a figure from history there (Q.figure)`)
  if (!waiting.length && !built.length) out.push(`${before.dungeons.length ? 'every dungeon had its figure' : 'there was no dungeon'}: build a new dungeon (Q.dungeon) and leave it waiting for the next model's figure`)
  return out
}

// Plays the game in game/ (dir) and returns the problems found, or [].
export function playtest(dir, options) {
  return [...new Set(play(dir, options))]
}
function play(dir, { seed = 7 } = {}) {
  const game = boot(fromDir(dir), { seed })
  const { problems, fail, evaluate, fb, clock, counters, errors, blame, where } = game
  if (problems.length) return problems

  // The bot: holds a direction for a while, presses act now and then, and
  // tries other keys a model may have given a meaning to.
  const random = rng(seed)
  const held = new Set()
  const press = code => { fb.win._fire(keyEvent('keydown', code)); fb.doc._fire(keyEvent('keydown', code)) }
  const release = code => { fb.win._fire(keyEvent('keyup', code)); fb.doc._fire(keyEvent('keyup', code)) }
  const releaseAll = () => { for (const k of held) release(k); held.clear() }
  const DIRS = [['ArrowLeft', 'KeyA'], ['ArrowRight', 'KeyD'], ['ArrowUp', 'KeyW'], ['ArrowDown', 'KeyS']]
  const OTHER = ['KeyK', 'KeyE', 'KeyQ', 'KeyI', 'KeyM', 'KeyL', 'KeyF', 'KeyR', 'KeyX', 'KeyZ', 'KeyC', 'Escape', 'Tab', 'ShiftLeft', 'Digit1', 'Digit2', 'Digit3']
  let nextMove = 0, nextAct = 0, nextOther = 0, tapped = []
  const bot = () => {
    for (const k of tapped) release(k)
    tapped = []
    const t = clock.now
    if (t >= nextMove) {
      releaseAll()
      const n = random() < 0.15 ? 0 : random() < 0.75 ? 1 : 2
      const pick = [...DIRS].sort(() => random() - 0.5).slice(0, n)
      for (const pair of pick) { const k = pair[random() < 0.5 ? 0 : 1]; press(k); held.add(k) }
      nextMove = t + 300 + random() * 900
    }
    if (t >= nextAct) { const k = ['Space', 'KeyJ', 'Enter'][Math.floor(random() * 3)]; press(k); tapped.push(k); nextAct = t + 200 + random() * 900 }
    if (t >= nextOther) { const k = OTHER[Math.floor(random() * OTHER.length)]; press(k); tapped.push(k); nextOther = t + 800 + random() * 2000 }
  }

  let frames = 0
  const run = (seconds, label, { botOn = true } = {}) => {
    const end = clock.now + seconds * 1000
    while (clock.now < end) {
      if (botOn) bot()
      const before = counters.draws
      evaluate(`__frame(${clock.now + 1000 / 60})`, label)
      frames++
      if (errors.length) { problems.push(`${label}: ${where(errors[0])}`); errors.length = 0 }
      const err = evaluate('Q.error ? String(Q.error.stack || Q.error) : null', label)
      if (err) {
        const at = blame(err)
        return fail(`${label}: ${err.split('\n')[0]}${at ? ` (${at})` : ''}`)
      }
      if (problems.length) return problems
      if (counters.draws === before && frames > 2) {
        // A frame with no drawing at all: count it, a few are fine (a pause).
        counters.blank = (counters.blank || 0) + 1
      }
    }
    return problems
  }
  const playing = () => evaluate('Q.mode', 'reading the mode') === 'play'
  const startGame = label => {
    releaseAll()
    for (let i = 0; i < 40 && !playing(); i++) { press('Space'); run(0.1, label, { botOn: false }); release('Space'); run(0.15, label, { botOn: false }) }
    return playing()
  }

  if (run(1, 'on the title screen', { botOn: false }).length) return problems
  if (!startGame('starting a new game')) return fail('pressing Space on the title screen does not start the game (Q.mode never becomes "play")')
  if (run(12, 'playing from the start').length) return problems

  // Every room, one after the other, as if the hero walked in.
  const rooms = evaluate('Object.keys(Q.rooms)', 'listing the rooms') || []
  for (const key of rooms) {
    const label = `in room ${key}`
    if (!playing() && !startGame(label)) return fail(`${label}: the game could not be restarted`)
    evaluate(`Q.goto(${JSON.stringify(key)})`, `entering room ${key}`)
    if (problems.length) return problems
    if (run(3, label).length) return problems
  }

  // Every figure: stand before them, talk, ask every question, leave.
  const figures = evaluate('(Q.figures || []).map(f => ({ name: f.name, room: f.room, x: f.at[0], y: f.at[1] }))', 'listing the figures') || []
  for (const f of figures) {
    const label = `talking to ${f.name}`
    if (!playing() && !startGame(label)) return fail(`${label}: the game could not be restarted`)
    releaseAll()
    evaluate(`Q.goto(${JSON.stringify(f.room)}, ${f.x * 32 + 8}, ${f.y * 32 + 38}); Q.hero.dir = 'up'`, label)
    if (problems.length) return problems
    for (let i = 0; i < 48; i++) {
      const k = i % 6 === 5 ? 'ArrowDown' : 'Space'
      press(k)
      run(0.05, label, { botOn: false })
      release(k)
      if (run(0.15, label, { botOn: false }).length) return problems
    }
  }
  // The Chronicle, opened, leafed through and closed.
  if (!playing() && !startGame('opening the Chronicle')) return problems
  releaseAll()
  for (const k of ['KeyC', 'ArrowRight', 'ArrowLeft', 'KeyC']) {
    press(k)
    run(0.05, 'reading the Chronicle', { botOn: false })
    release(k)
    if (run(0.2, 'reading the Chronicle', { botOn: false }).length) return problems
  }

  // Falling, then trying again.
  if (!playing() && !startGame('before the hero falls')) return problems
  evaluate('Q.hero.inv = 0; Q.hurt(999)', 'hurting the hero')
  if (problems.length || run(2, 'after the hero fell', { botOn: false }).length) return problems
  if (!startGame('starting again after falling')) return fail('after the hero fell, pressing Space does not start a new game')
  if (run(3, 'playing again after falling').length) return problems

  if (counters.blank > frames / 2) problems.push('the game draws nothing on most frames')
  return problems
}

// ------------------------------------------------------------------ the CLI
function cli() {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  const tryGit = (...args) => { try { return git(...args) } catch { return '' } }
  const problems = []
  // What changed since the last commit, staged or not, new files included.
  const changes = tryGit('diff', 'HEAD', '--name-status', '--no-renames').split('\n').filter(Boolean)
    .map(l => { const [status, ...p] = l.split('\t'); return { status: status[0], path: p.join('\t') } })
  for (const path of tryGit('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean)) changes.push({ status: 'A', path })
  const removed = tryGit('diff', 'HEAD', '--numstat', '--no-renames').split('\n').filter(Boolean)
    .reduce((n, l) => n + (Number(l.split('\t')[1]) || 0), 0)
  const questBefore = tryGit('show', 'HEAD:QUEST.md')
  const questAfter = existsSync('QUEST.md') ? readFileSync('QUEST.md', 'utf8') : ''
  problems.push(...changeProblems({ changes, removed, questBefore, questAfter }))

  const files = walk('game').map(f => `game/${f}`).filter(f => TEXT.test(f)).map(path => ({ path, text: readFileSync(path, 'utf8') }))
  problems.push(...linkProblems(files))
  problems.push(...loadProblems('game'))
  if (!problems.some(p => p.includes('does not exist'))) problems.push(...playtest('game'))

  // The game as the last step left it, and as it is now.
  const before = inventory(path => tryGit('show', `HEAD:game/${path}`) || null)
  const after = inventory(fromDir('game'))
  if (before && after && changes.length) problems.push(...stepProblems(before, after))
  const now = after || before
  if (now) {
    console.log(`The game holds ${now.dungeons.length} dungeon${now.dungeons.length === 1 ? '' : 's'}, ${now.figures.length} figure${now.figures.length === 1 ? '' : 's'} from history and ${now.cast.length} line${now.cast.length === 1 ? '' : 's'} in the cast.`)
    for (const d of now.dungeons) console.log(`  - ${d.name} (${d.id}:…): ${now.figures.find(f => f.dungeon === d.id)?.name || 'waiting for its figure'}`)
  }
  if (before) console.log(`This step's share of the quest: ${stepTask(before)}.`)

  if (problems.length) {
    console.error(`npm test: ${problems.length} problem${problems.length > 1 ? 's' : ''}`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }
  console.log(`npm test: the game starts and runs, and the step keeps to the rules (${changes.length} file${changes.length === 1 ? '' : 's'} changed).`)
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) cli()
