// The Endless Quest: the engine.
//
// Every model builds on this file through one global, Q: tiles, rooms,
// entities, sounds and event handlers (QUEST.md lists the whole API). Content
// lives in content/; change the engine only where a new piece needs a hook.
'use strict'
const Q = (() => {
  const W = 512, H = 448, TILE = 32, COLS = 16, ROWS = 12, HUD = H - ROWS * TILE
  const ROOM_H = ROWS * TILE
  const Q = { W, H, TILE, COLS, ROWS, HUD, time: 0, mode: 'title', error: null }
  const canvas = document.getElementById('game')
  let ctx = canvas.getContext('2d')
  Q.canvas = canvas
  Object.defineProperty(Q, 'ctx', { get: () => ctx })

  // ------------------------------------------------------------------ events
  // Q.on('update', dt => …). The engine emits: boot (once, every script
  // loaded), start, enter, update, draw (room space, over the entities), hud
  // (screen space), act, alt, hurt, death, give. A handler that returns true
  // stops the ones after it.
  const handlers = {}
  Q.on = (name, fn) => { (handlers[name] ||= []).push(fn); return fn }
  Q.off = (name, fn) => { handlers[name] = (handlers[name] || []).filter(f => f !== fn) }
  Q.emit = (name, ...args) => {
    for (const fn of [...(handlers[name] || [])]) if (fn(...args) === true) return true
    return false
  }

  // ------------------------------------------------------------------- input
  // Physical keys (KeyboardEvent.code) to actions; a model may add its own.
  Q.keys = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    Space: 'act', KeyJ: 'act', Enter: 'act', KeyK: 'alt', KeyC: 'book',
  }
  const held = {}, hit = {}
  addEventListener('keydown', e => {
    const k = Q.keys[e.code]
    if (!k) return
    e.preventDefault()
    if (!held[k]) hit[k] = true
    held[k] = true
    Q.unlockAudio()
  })
  addEventListener('keyup', e => { const k = Q.keys[e.code]; if (k) held[k] = false })
  addEventListener('blur', () => { for (const k in held) held[k] = false })
  canvas.addEventListener('pointerdown', () => { Q.unlockAudio(); if (Q.mode !== 'play') hit.act = true })
  Q.down = k => !!held[k]       // held right now
  Q.pressed = k => !!hit[k]     // went down since the last update

  // ----------------------------------------------------------------- sprites
  // A sprite is rows of palette keys, one character per pixel ('.' is clear),
  // drawn once to a canvas of its own. Q.palette (palette.js) maps the keys.
  Q.sprite = (rows, palette = Q.palette) => {
    const h = rows.length, w = Math.max(...rows.map(r => r.length))
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.' || ch === ' ') return
      if (!palette[ch]) throw new Error(`Q.sprite: "${ch}" is not a palette key (palette.js)`)
      g.fillStyle = palette[ch]
      g.fillRect(x, y, 1, 1)
    }))
    return { canvas: c, w, h }
  }
  // Draws a sprite with its top-left corner at x, y; flip mirrors it.
  Q.draw = (s, x, y, flip = false) => {
    x = Math.round(x)
    y = Math.round(y)
    if (!flip) return ctx.drawImage(s.canvas, x, y)
    ctx.save()
    ctx.translate(x + s.w, y)
    ctx.scale(-1, 1)
    ctx.drawImage(s.canvas, 0, 0)
    ctx.restore()
  }
  // Draws a sprite standing on an entity: centred on its box, feet on its bottom.
  Q.drawOn = (e, s, flip = false) => Q.draw(s, e.x + e.w / 2 - s.w / 2, e.y + e.h - s.h, flip)

  // Q.paint(w, h, p => { … }) → a sprite drawn with shapes, whole pixels only:
  // the way to draw anything bigger than a few pixels. Every shape takes a
  // palette key, and may take `only` (a key or a list of keys) to paint just
  // over the pixels of those colours: shading and highlights inside a shape.
  //   p.rect(x, y, w, h, key)      p.ellipse(cx, cy, rx, ry, key)
  //   p.circle(cx, cy, r, key)     p.line(x0, y0, x1, y1, key)
  //   p.poly([[x, y], …], key)     p.dot(x, y, key)
  //   p.dither(x, y, w, h, key)    a checkerboard, for soft shading
  //   p.rows(rows, x, y)           stamps rows of keys, as Q.sprite takes them
  //   p.outline(key)               a one-pixel outline around everything so far
  //   p.mirror()                   copies the left half onto the right half
  //   p.get(x, y)                  the key at a pixel, or null
  Q.paint = (w, h, draw, palette = Q.palette) => {
    const px = new Array(w * h).fill(null)
    const get = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? px[y * w + x] : null)
    const over = only => (only == null ? () => true : Array.isArray(only) ? v => only.includes(v) : v => v === only)
    const put = (x, y, k, ok) => {
      x = Math.floor(x)
      y = Math.floor(y)
      if (x >= 0 && y >= 0 && x < w && y < h && ok(px[y * w + x])) px[y * w + x] = k
    }
    const p = {
      w, h, get,
      dot: (x, y, k, only) => put(x, y, k, over(only)),
      rect(x, y, rw, rh, k, only) {
        const ok = over(only)
        for (let j = Math.round(y); j < Math.round(y + rh); j++) for (let i = Math.round(x); i < Math.round(x + rw); i++) put(i, j, k, ok)
      },
      ellipse(cx, cy, rx, ry, k, only) {
        const ok = over(only)
        let n = 0
        for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++) for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) {
          const dx = (i + 0.5 - cx) / rx, dy = (j + 0.5 - cy) / ry
          if (dx * dx + dy * dy <= 1) { put(i, j, k, ok); n++ }
        }
        if (!n) put(cx, cy, k, ok)
      },
      circle: (cx, cy, r, k, only) => p.ellipse(cx, cy, r, r, k, only),
      line(x0, y0, x1, y1, k, only) {
        const ok = over(only)
        x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1)
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
        let err = dx + dy
        for (;;) {
          put(x0, y0, k, ok)
          if (x0 === x1 && y0 === y1) break
          const e2 = 2 * err
          if (e2 >= dy) { err += dy; x0 += sx }
          if (e2 <= dx) { err += dx; y0 += sy }
        }
      },
      poly(points, k, only) {
        const ok = over(only)
        const ys = points.map(q => q[1])
        for (let j = Math.floor(Math.min(...ys)); j <= Math.ceil(Math.max(...ys)); j++) {
          const y = j + 0.5, xs = []
          points.forEach(([ax, ay], n) => {
            const [bx, by] = points[(n + 1) % points.length]
            if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax))
          })
          xs.sort((a, b) => a - b)
          for (let n = 0; n + 1 < xs.length; n += 2) for (let i = Math.round(xs[n]); i < Math.round(xs[n + 1]); i++) put(i, j, k, ok)
        }
      },
      dither(x, y, rw, rh, k, only) {
        const ok = over(only)
        for (let j = Math.round(y); j < Math.round(y + rh); j++) for (let i = Math.round(x); i < Math.round(x + rw); i++) if ((i + j) % 2 === 0) put(i, j, k, ok)
      },
      rows(rows, x = 0, y = 0) {
        rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.' && ch !== ' ') put(x + i, y + j, ch, () => true) }))
      },
      outline(k = 'k') {
        const edge = []
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          if (!px[j * w + i] && (get(i - 1, j) || get(i + 1, j) || get(i, j - 1) || get(i, j + 1))) edge.push(j * w + i)
        }
        for (const n of edge) px[n] = k
      },
      mirror() {
        for (let j = 0; j < h; j++) for (let i = 0; i < Math.floor(w / 2); i++) px[j * w + (w - 1 - i)] = px[j * w + i]
      },
    }
    draw(p)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = px[j * w + i]
      if (!k) continue
      if (!palette[k]) throw new Error(`Q.paint: "${k}" is not a palette key (palette.js)`)
      g.fillStyle = palette[k]
      g.fillRect(i, j, 1, 1)
    }
    return { canvas: c, w, h }
  }

  // A soft shadow on the ground under an entity: call it first in draw().
  const shadows = {}
  Q.shadow = (e, width = e.w + 8) => {
    const w = Math.max(4, Math.round(width)), h = Math.max(3, Math.round(w / 3.5))
    const s = (shadows[w] ||= Q.paint(w, h, p => p.ellipse(w / 2, h / 2, w / 2, h / 2, 'k')))
    ctx.globalAlpha = 0.25
    Q.draw(s, e.x + e.w / 2 - w / 2, e.y + e.h - h / 2 - 1)
    ctx.globalAlpha = 1
  }
  // A soft light (a lamp, a fire, magic), added over the scene: use it in
  // the 'draw' event, or in an entity's draw().
  Q.glow = (x, y, r, color = '#ffcd75', strength = 0.35) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, /^#[0-9a-f]{6}$/i.test(color) ? `${color}00` : 'rgba(0, 0, 0, 0)')
    ctx.save()
    ctx.globalAlpha = strength
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
    ctx.restore()
  }

  // -------------------------------------------------------------------- text
  // A 5×7 pixel font drawn in code (the printable ASCII characters; g, j,
  // p, q and y hang one row lower): Q.text(str, x, y, colour, scale, shadow).
  // Lines are 10 pixels apart.
  const FONT = '000000000000005F00000007000700147F147F14242A7F2A12231308646236495522500005030000001C2241000041221C00082A1C2A0808083E080800503000000808080808006060000020100804023E5149453E00427F400042615149462141454B311814127F1027454545393C4A49493001710905033649494936064949291E003636000000563600000008142241141414141441221408000201510906324979413E7E1111117E7F494949363E414141227F4141221C7F494949417F090901013E414151327F0808087F00417F41002040413F017F081422417F404040407F0204027F7F0408107F3E4141413E7F090909063E4151215E7F09192946464949493101017F01013F4040403F1F2040201F7F2018207F63140814630304780403615149454300007F4141020408102041417F000004020102044040404040000102040020545454787F484444383844444420384444487F3854545418087E09010218A4A4A47C7F0804047800447D40004080847D00007F10284400417F40007C041804787C080404783844444438FC2424241818242418FC7C080404084854545420043F4440203C4040207C1C2040201C3C4030403C44281028441CA0A0A07C4464544C44000836410000007F000000413608000804081008'
  Q.text = (str, x, y, color = '#f4f4f4', scale = 1, shadow = null) => {
    if (shadow) Q.text(str, x + scale, y + scale, shadow, scale)
    ctx.fillStyle = color
    let cx = x
    for (const ch of String(str)) {
      if (ch === '\n') { cx = x; y += 10 * scale; continue }
      let i = ch.charCodeAt(0) - 32
      if (i < 0 || i > 94) i = 31   // '?'
      for (let col = 0; col < 5; col++) {
        const bits = parseInt(FONT.substr(i * 10 + col * 2, 2), 16)
        for (let row = 0; row < 8; row++) if (bits & (1 << row)) ctx.fillRect(cx + col * scale, y + row * scale, scale, scale)
      }
      cx += 6 * scale
    }
  }
  Q.textWidth = (str, scale = 1) => Math.max(0, String(str).length * 6 - 1) * scale
  const wrap = (str, width) => {
    const lines = []
    for (const para of String(str).split('\n')) {
      let line = ''
      for (const word of para.split(/\s+/).filter(Boolean)) {
        if (line && (line + ' ' + word).length > width) { lines.push(line); line = word } else line = line ? line + ' ' + word : word
      }
      lines.push(line)
    }
    return lines
  }

  // ------------------------------------------------------------------- sound
  // Tiny synthesised sounds. Q.sfx(name, def) registers one (Q.beep options,
  // a list of them, or a function); Q.play(name) plays it.
  let audio = null
  Q.unlockAudio = () => {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!audio && AC) audio = new AC()
    if (audio && audio.state === 'suspended') audio.resume()
  }
  Q.audio = () => audio  // the AudioContext, null until the player pressed a key
  Q.beep = ({ wave = 'square', freq = 440, to = freq, dur = 0.12, vol = 0.12, delay = 0 } = {}) => {
    if (!audio) return
    const t = audio.currentTime + delay
    const o = audio.createOscillator(), g = audio.createGain()
    o.type = wave
    o.frequency.setValueAtTime(freq, t)
    o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur)
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(audio.destination)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
  const sounds = {}
  Q.sfx = (name, def) => { sounds[name] = def }
  Q.play = name => {
    const s = sounds[name]
    if (typeof s === 'function') s()
    else if (s) [].concat(s).forEach(Q.beep)
  }
  Q.sfx('start', [{ freq: 523, dur: 0.1 }, { freq: 659, dur: 0.1, delay: 0.1 }, { freq: 784, dur: 0.22, delay: 0.2 }])
  Q.sfx('talk', { freq: 700, dur: 0.03, vol: 0.04 })
  Q.sfx('hurt', { wave: 'sawtooth', freq: 320, to: 70, dur: 0.25 })
  Q.sfx('bump', { wave: 'triangle', freq: 180, to: 120, dur: 0.08, vol: 0.1 })

  // ---------------------------------------------------------- tiles and rooms
  // A tile is one character of a room's map: { sprite, solid }. Or variants:
  // sprites picked by position, so a field doesn't repeat; frames (and fps)
  // to animate it; draw(x, y, tileX, tileY, map) to draw it yourself, edges
  // that depend on the neighbours included. A sprite taller than a tile
  // stands on it and rises over the row above (a tree, a tower). Pass a
  // dungeon's grid as the third argument and the tile exists only in that
  // dungeon's rooms, so every dungeon can use any character it likes.
  Q.tiles = {}
  Q.tile = (ch, def, grid = '') => { Q.tiles[grid ? `${grid}:${ch}` : ch] = { solid: false, ...def } }
  const tileIn = (r, ch) => (r.grid && Q.tiles[`${r.grid}:${ch}`]) || Q.tiles[ch]
  // A room is one screen, at X_Y on a grid. The world is one grid: x grows
  // east, y grows south, and 0_0 is where the hero wakes. A dungeon (a cave, a
  // house) is a grid of its own: its rooms are keyed grid:X_Y (hollow:0_0),
  // join each other by their edges, and join the world only through doors
  // (Q.goto). A map is 12 strings of 16 tile characters. def: { name, map,
  // things: [[type, tileX, tileY, props]], enter(room), update(room, dt),
  // draw(room) under the entities }.
  Q.rooms = {}
  const KEY = /^(?:([a-z][a-z0-9-]*):)?(-?\d+)_(-?\d+)$/
  Q.parseKey = key => { const m = KEY.exec(key); return m ? { grid: m[1] || '', x: +m[2], y: +m[3] } : null }
  Q.room = (key, def) => {
    if (!Q.parseKey(key)) throw new Error(`Q.room: "${key}" is not a room key (X_Y in the world, grid:X_Y in a dungeon)`)
    const map = def.map || []
    if (map.length !== ROWS || map.some(r => r.length !== COLS)) throw new Error(`Q.room ${key}: the map needs ${ROWS} rows of ${COLS} characters`)
    Q.rooms[key] = { name: key, ...def, key }
  }
  const keyOf = (grid, x, y) => `${grid ? `${grid}:` : ''}${x}_${y}`

  // ---------------------------------------------------------------- entities
  // A kind of thing that lives in a room. def: { w, h (its box, in pixels),
  // solid, init(e), update(e, dt), draw(e), touch(e) while it overlaps the
  // hero, interact(e) when the hero faces it and presses act, hit(e, damage,
  // from) when something strikes it (see Q.strike) }.
  Q.types = {}
  Q.entity = (type, def) => { Q.types[type] = { w: 12, h: 12, ...def } }
  Q.spawn = (type, x, y, props = {}) => {
    const def = Q.types[type]
    if (!def) throw new Error(`Q.spawn: no entity type "${type}"`)
    const e = { type, def, x, y, w: def.w, h: def.h, solid: !!def.solid, dir: 'down', t: 0, dead: false, ...props }
    def.init?.(e)
    room.entities.push(e)
    return e
  }
  Q.all = type => room.entities.filter(e => !e.dead && (!type || e.type === type))
  Q.remove = e => { e.dead = true }
  Q.overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  // Strikes every entity with a hit() handler inside a box; returns how many.
  Q.strike = (box, damage = 1, from = null) => {
    let n = 0
    for (const e of Q.all()) if (e.def.hit && Q.overlap(box, e)) { e.def.hit(e, damage, from); n++ }
    return n
  }

  // ---------------------------------------------------------- the game state
  let room = null, prev = null, hero = null, slide = null, dialog = null, toast = null, overlay = null, overAt = 0, edgeWait = 0, fade = 0
  Object.defineProperty(Q, 'here', { get: () => room })   // the current room: { key, grid, x, y, def, map, entities }
  Object.defineProperty(Q, 'hero', { get: () => hero })
  Q.state = null   // this game's state: { hp, maxHp, items, flags }; a model may add fields on 'start'
  Q.start = { room: '0_0', x: 240, y: 240 }   // where a new game begins (room pixels)

  Q.neighbour = (dx, dy) => (room && Q.rooms[keyOf(room.grid, room.x + dx, room.y + dy)]) || null
  Q.tileAt = (px, py) => {   // the tile under a point of the current room, null outside it
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE)
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return null
    return tileIn(room, room.map[ty][tx]) || null
  }
  // Changes one tile of the current room until the hero leaves it (a cut bush,
  // an opened door); remember lasting changes with Q.flag and redo them in enter().
  Q.setTile = (tx, ty, ch) => { room.map[ty] = room.map[ty].slice(0, tx) + ch + room.map[ty].slice(tx + 1) }

  const exitOpen = (tx, ty) => {
    const dx = tx < 0 ? -1 : tx >= COLS ? 1 : 0, dy = ty < 0 ? -1 : ty >= ROWS ? 1 : 0
    return (dx === 0 || dy === 0) && !!Q.neighbour(dx, dy)
  }
  // Whether a box (room pixels) runs into a solid tile, a solid entity or the
  // edge of the world. Only the hero walks off an edge, and only into a room.
  Q.blocked = (x, y, w, h, self = null) => {
    const x0 = Math.floor(x / TILE), x1 = Math.floor((x + w - 0.001) / TILE)
    const y0 = Math.floor(y / TILE), y1 = Math.floor((y + h - 0.001) / TILE)
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const out = tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS
      if (out ? !(self === hero && exitOpen(tx, ty)) : tileIn(room, room.map[ty][tx])?.solid) return true
    }
    const box = { x, y, w, h }
    for (const o of room.entities) if (o !== self && o.solid && !o.dead && Q.overlap(box, o)) return true
    return false
  }
  // Moves an entity by dx, dy pixels, sliding along walls, and slips it
  // round a corner it almost clears. Returns false when something stopped it.
  Q.move = (e, dx, dy) => {
    let free = true
    for (const axis of ['x', 'y']) {
      let left = axis === 'x' ? dx : dy
      while (left !== 0) {
        const s = Math.abs(left) > 1 ? Math.sign(left) : left
        const nx = axis === 'x' ? e.x + s : e.x, ny = axis === 'y' ? e.y + s : e.y
        if (!Q.blocked(nx, ny, e.w, e.h, e)) { e[axis] += s; left -= s; continue }
        free = false
        const other = axis === 'x' ? 'y' : 'x'
        if ((axis === 'x' ? dy : dx) === 0) for (let k = 1; k <= 6; k++) {
          const side = [-k, k].find(o => !Q.blocked(axis === 'x' ? nx : nx + o, axis === 'y' ? ny : ny + o, e.w, e.h, e))
          if (side) { if (!Q.blocked(other === 'x' ? e.x + Math.sign(side) : e.x, other === 'y' ? e.y + Math.sign(side) : e.y, e.w, e.h, e)) e[other] += Math.sign(side); break }
        }
        break
      }
    }
    return free
  }
  // Finds the nearest free spot for an entity that stands inside a wall.
  const unstick = e => {
    if (!Q.blocked(e.x, e.y, e.w, e.h, e)) return
    for (let r = 4; r < W; r += 4) for (const [ox, oy] of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]]) {
      const x = Math.min(Math.max(e.x + ox, 0), W - e.w), y = Math.min(Math.max(e.y + oy, 0), ROOM_H - e.h)
      if (!Q.blocked(x, y, e.w, e.h, e)) { e.x = x; e.y = y; return }
    }
  }

  function enter(key, x, y) {
    const def = Q.rooms[key]
    if (!def) throw new Error(`there is no room "${key}"`)
    const { grid, x: rx, y: ry } = Q.parseKey(key)
    room = { key, grid, x: rx, y: ry, def, map: [...def.map], entities: [] }
    for (const row of room.map) for (const ch of row) if (!tileIn(room, ch)) throw new Error(`room ${key}: no tile "${ch}" (Q.tile)`)
    if (x != null) { hero.x = x; hero.y = y }
    for (const [type, tx, ty, props] of def.things || []) {
      const t = Q.types[type] || { w: 12, h: 12 }
      Q.spawn(type, tx * TILE + (TILE - t.w) / 2, ty * TILE + (TILE - t.h) / 2, props)
    }
    def.enter?.(room)
    Q.emit('enter', room)
    unstick(hero)
  }
  // Moves the hero to a room at once (a door, a stair, a teleport), with a
  // short fade from black.
  Q.goto = (key, x = hero.x, y = hero.y) => { slide = null; prev = null; fade = 0.35; enter(key, x, y) }

  Q.newGame = () => {
    const def = Q.types.hero
    if (!def) throw new Error('no hero: content/hero.js registers Q.entity("hero", …)')
    Q.state = { hp: 6, maxHp: 6, items: {}, flags: {} }
    hero = { type: 'hero', def, x: Q.start.x, y: Q.start.y, w: def.w, h: def.h, dir: 'down', t: 0, dead: false, inv: 0, stun: 0, kx: 0, ky: 0 }
    def.init?.(hero)
    dialog = toast = slide = prev = overlay = null
    fade = 0
    Q.mode = 'play'
    Q.emit('start', Q.state)
    enter(Q.start.room)
    Q.play('start')
  }

  // Items and flags last for one game.
  Q.give = (item, n = 1) => { Q.state.items[item] = (Q.state.items[item] || 0) + n; Q.emit('give', item, n) }
  Q.has = (item, n = 1) => (Q.state.items[item] || 0) >= n
  Q.take = (item, n = 1) => { if (!Q.has(item, n)) return false; Q.state.items[item] -= n; return true }
  Q.flag = (name, value) => { if (value !== undefined) Q.state.flags[name] = value; return Q.state.flags[name] }

  // The hero takes damage, in half hearts, and is knocked away from `from`.
  Q.hurt = (amount = 1, from = null) => {
    if (Q.mode !== 'play' || hero.inv > 0) return false
    Q.state.hp = Math.max(0, Q.state.hp - amount)
    hero.inv = 1
    if (from) {
      const dx = hero.x + hero.w / 2 - (from.x + (from.w || 0) / 2), dy = hero.y + hero.h / 2 - (from.y + (from.h || 0) / 2)
      const d = Math.hypot(dx, dy) || 1
      hero.kx = (dx / d) * 320
      hero.ky = (dy / d) * 320
      hero.stun = 0.15
    }
    Q.play('hurt')
    Q.emit('hurt', amount, from)
    if (Q.state.hp <= 0) { Q.mode = 'over'; overAt = Q.time; Q.emit('death') }
    return true
  }
  Q.heal = (amount = 2) => { Q.state.hp = Math.min(Q.state.maxHp, Q.state.hp + amount) }

  // A message box; the game waits until the player has read every page.
  Q.say = (text, done = null) => {
    const lines = [].concat(text).flatMap(t => wrap(t, 38))
    const pages = []
    for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3).join('\n'))
    dialog = { pages, page: 0, shown: 0, done }
  }
  // A message that ends with a choice: up and down pick, act confirms, and
  // pick(index, label) runs (a question to a character, a shop, yes or no).
  Q.ask = (text, choices, pick = null) => {
    const list = [].concat(choices).map(String).slice(0, 4)
    Q.say(text, () => pick?.(d.choice, list[d.choice]))
    const d = dialog
    d.choices = list
    d.choice = 0
  }
  Q.talking = () => !!dialog
  // A full screen over the paused game (a book, a map, an inventory):
  // def { update(dt) → false to close it, draw() in screen space }.
  // Q.overlay(null) closes it.
  Q.overlay = def => { overlay = def || null }
  // A short line at the top of the screen that does not stop the game.
  Q.toast = (text, seconds = 2.5) => { toast = { text: String(text), until: Q.time + seconds } }

  // The cast: every model that built the game, one line each, in the order
  // they came (game/cast.js). It rolls on the title screen. The first line is
  // the base; a line's place in the list is its step number.
  Q.cast = []
  Q.credit = entry => {
    const { by, did } = entry || {}
    if (typeof by !== 'string' || !by.trim()) throw new Error('Q.credit: by is your name, the model you are')
    if (typeof did !== 'string' || !did.trim()) throw new Error(`Q.credit (${by}): did says what you added, in one sentence`)
    if (did.length > 160) throw new Error(`Q.credit (${by}): keep did to one sentence (under 160 characters)`)
    Q.cast.push({ step: Q.cast.length, by: by.trim(), did: did.trim() })
  }

  // ------------------------------------------------------------------ update
  const facingBox = () => {
    const r = 20
    const cx = hero.x + hero.w / 2, cy = hero.y + hero.h / 2
    const off = { up: [0, -r], down: [0, r], left: [-r, 0], right: [r, 0] }[hero.dir] || [0, r]
    return { x: cx + off[0] - 10, y: cy + off[1] - 10, w: 20, h: 20 }
  }

  function scroll(dx, dy) {
    prev = room
    const x = dx ? (dx > 0 ? 0 : W - hero.w) : hero.x
    const y = dy ? (dy > 0 ? 0 : ROOM_H - hero.h) : hero.y
    enter(keyOf(room.grid, room.x + dx, room.y + dy), x, y)
    slide = { dx, dy, t: 0 }
  }

  let roll = null, titleIdle = 0
  function update(dt) {
    Q.time += dt
    if (Q.mode === 'title') {
      if (hit.act) return Q.newGame()
      if (hit.book) { roll = roll ? null : { y: 0 }; titleIdle = 0 }
      if (roll) {
        // A long cast rolls faster, so it never takes much more than a
        // minute and a half; down speeds it up, up winds it back.
        // It stops on its last lines (the count of steps and models) for a
        // few seconds, then the title comes back.
        const height = castHeight(), speed = Math.max(30, height / 90), end = height + 120
        roll.y = Math.min(end, Math.max(0, roll.y + speed * dt * (held.down ? 6 : held.up ? -4 : 1)))
        roll.hold = roll.y >= end ? (roll.hold || 0) + dt : 0
        if (roll.hold > 6) { roll = null; titleIdle = 0 }
      } else if ((titleIdle += dt) > 10) roll = { y: 0 }
      return
    }
    if (Q.mode === 'over') { if (hit.act && Q.time - overAt > 1) Q.newGame(); return }
    if (slide) { slide.t += dt / 0.45; if (slide.t >= 1) { slide = null; prev = null } return }
    if (fade > 0) fade -= dt
    if (overlay) { if (overlay.update?.(dt) === false) overlay = null; return }
    if (dialog) {
      const page = dialog.pages[dialog.page] || ''
      if (dialog.shown < page.length) {
        dialog.shown = Math.min(page.length, dialog.shown + dt * 45)
        if (Math.floor(dialog.shown) % 3 === 0) Q.play('talk')
      }
      const choosing = dialog.choices && dialog.page === dialog.pages.length - 1 && dialog.shown >= page.length
      if (choosing && (hit.up || hit.down)) {
        dialog.choice = (dialog.choice + (hit.down ? 1 : -1) + dialog.choices.length) % dialog.choices.length
        Q.play('talk')
      }
      if (hit.act) {
        if (dialog.shown < page.length) dialog.shown = page.length
        else if (++dialog.page >= dialog.pages.length) { const done = dialog.done; dialog = null; done?.() }
        else dialog.shown = 0
      }
      return
    }
    hero.t += dt
    if (hero.inv > 0) hero.inv -= dt
    if (hero.stun > 0) { hero.stun -= dt; Q.move(hero, hero.kx * dt, hero.ky * dt) } else hero.def.update?.(hero, dt)
    if (hit.act) {
      const f = facingBox()
      const near = Q.all().find(e => e.def.interact && Q.overlap(f, e))
      if (near) near.def.interact(near)
      else Q.emit('act')
    }
    if (hit.alt) Q.emit('alt')
    for (const e of [...room.entities]) {
      if (e.dead || Q.mode !== 'play' || dialog) continue
      e.t += dt
      e.def.update?.(e, dt)
      if (!e.dead && e.def.touch && Q.overlap(e, hero)) e.def.touch(e)
    }
    if (Q.mode !== 'play') return
    room.def.update?.(room, dt)
    Q.emit('update', dt)
    room.entities = room.entities.filter(e => !e.dead)
    if (dialog || Q.mode !== 'play') return
    // Walking off an edge: into the next room, or against the end of the world.
    const cx = hero.x + hero.w / 2, cy = hero.y + hero.h / 2
    const ex = cx < 0 ? -1 : cx >= W ? 1 : 0, ey = cy < 0 ? -1 : cy >= ROOM_H ? 1 : 0
    if ((ex || ey) && Q.neighbour(ex, ey)) return scroll(ex, ey)
    if (edgeWait > 0) edgeWait -= dt
    const pushing = (hero.x <= 0.5 && Q.down('left') && !Q.neighbour(-1, 0)) || (hero.x >= W - hero.w - 0.5 && Q.down('right') && !Q.neighbour(1, 0)) ||
      (hero.y <= 0.5 && Q.down('up') && !Q.neighbour(0, -1)) || (hero.y >= ROOM_H - hero.h - 0.5 && Q.down('down') && !Q.neighbour(0, 1))
    if (pushing && edgeWait <= 0) { Q.toast('The land beyond is not built yet.'); Q.play('bump'); edgeWait = 3 }
  }

  // ------------------------------------------------------------------ render
  function drawTiles(r) {
    const map = r.map
    for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
      const t = tileIn(r, map[ty][tx])
      if (!t) continue
      const x = tx * TILE, y = ty * TILE
      if (t.draw) { t.draw(x, y, tx, ty, map); continue }
      const s = t.frames ? t.frames[Math.floor(Q.time * (t.fps || 3)) % t.frames.length]
        : t.variants ? t.variants[(tx * 7 + ty * 13 + ((tx * ty) % 5)) % t.variants.length] : t.sprite
      if (s) Q.draw(s, x + (TILE - s.w) / 2, y + TILE - s.h)
    }
  }
  // Mist over the openings that lead to rooms nobody has built yet.
  function drawMist(r) {
    const shimmer = 0.75 + 0.25 * Math.sin(Q.time * 2)
    const open = (tx, ty) => !tileIn(r, r.map[ty][tx])?.solid
    const sides = [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dx, dy]) => !Q.rooms[keyOf(r.grid, r.x + dx, r.y + dy)])
    ctx.fillStyle = '#f4f4f4'
    for (const [dx, dy] of sides) {
      const n = dx ? ROWS : COLS
      for (let i = 0; i < n; i++) {
        const tx = dx ? (dx < 0 ? 0 : COLS - 1) : i, ty = dy ? (dy < 0 ? 0 : ROWS - 1) : i
        if (!open(tx, ty)) continue
        for (let band = 0; band < 3; band++) {
          ctx.globalAlpha = [0.55, 0.3, 0.12][band] * shimmer
          const d = band * 10
          if (dx) ctx.fillRect(dx < 0 ? d : W - d - 10, ty * TILE, 10, TILE)
          else ctx.fillRect(tx * TILE, dy < 0 ? d : ROOM_H - d - 10, TILE, 10)
        }
      }
    }
    ctx.globalAlpha = 1
  }
  function drawRoom(r, ox, oy) {
    ctx.save()
    ctx.translate(Math.round(ox), Math.round(oy))
    drawTiles(r)
    r.def.draw?.(r)
    drawMist(r)
    const things = r.entities.filter(e => !e.dead)
    if (r === room) things.push(hero)
    things.sort((a, b) => a.y + a.h - (b.y + b.h))
    for (const e of things) {
      if (e === hero && hero.inv > 0 && Math.floor(hero.inv * 12) % 2) continue
      e.def.draw?.(e)
    }
    if (r === room) Q.emit('draw')
    ctx.restore()
  }
  const HEART = {}
  const heart = (left, right) => Q.paint(17, 15, p => {
    const shape = k => { p.circle(4.5, 4.5, 4, k); p.circle(11.5, 4.5, 4, k); p.poly([[1, 6], [16, 6], [8.5, 14]], k) }
    shape(left)
    if (right !== left) { p.rect(9, 0, 8, 15, right, left) }
    if (left === 'r') { p.dot(3, 3, 'w'); p.dot(4, 2, 'w'); p.dot(3, 4, 'o') }
    p.outline('k')
  })
  function hearts() {
    HEART.full ||= heart('r', 'r')
    HEART.half ||= heart('r', 'D')
    HEART.empty ||= heart('D', 'D')
    for (let i = 0; i < Q.state.maxHp / 2; i++) {
      const left = Q.state.hp - i * 2
      Q.draw(left >= 2 ? HEART.full : left === 1 ? HEART.half : HEART.empty, 16 + i * 20, 24)
    }
  }
  function drawHud() {
    ctx.fillStyle = '#1a1c2c'
    ctx.fillRect(0, 0, W, HUD)
    ctx.fillStyle = '#333c57'
    ctx.fillRect(0, HUD - 2, W, 2)
    hearts()
    const name = room.def.name || room.key
    Q.text(name, W - 16 - Q.textWidth(name, 2), 25, '#94b0c2', 2, '#1a1c2c')
    Q.emit('hud')
  }
  function drawDialog() {
    const page = dialog.pages[dialog.page] || ''
    const choosing = dialog.choices && dialog.page === dialog.pages.length - 1 && dialog.shown >= page.length
    const lines = page.split('\n').length
    const x = 12, w = W - 24, h = choosing ? 26 + lines * 20 + 8 + dialog.choices.length * 22 : 82, y = H - h - 12
    ctx.fillStyle = '#1a1c2c'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#94b0c2'
    ctx.fillRect(x + 3, y + 3, w - 6, 2)
    ctx.fillRect(x + 3, y + h - 5, w - 6, 2)
    ctx.fillRect(x + 3, y + 3, 2, h - 6)
    ctx.fillRect(x + w - 5, y + 3, 2, h - 6)
    Q.text(page.slice(0, Math.floor(dialog.shown)), x + 14, y + 13, '#f4f4f4', 2)
    if (choosing) {
      dialog.choices.forEach((c, i) => {
        const cy = y + 13 + lines * 20 + 8 + i * 22, on = i === dialog.choice
        if (on) Q.text('>', x + 18 + (Math.floor(Q.time * 4) % 2), cy, '#ffcd75', 2)
        Q.text(c, x + 40, cy, on ? '#ffcd75' : '#94b0c2', 2)
      })
    } else if (dialog.shown >= page.length && Math.floor(Q.time * 3) % 2) Q.text('>', x + w - 22, y + h - 22, '#ffcd75', 2)
  }
  function drawToast() {
    const w = Q.textWidth(toast.text, 2) + 24
    const x = Math.round((W - w) / 2), y = HUD + 12
    ctx.fillStyle = '#1a1c2c'
    ctx.globalAlpha = 0.85
    ctx.fillRect(x, y, w, 26)
    ctx.globalAlpha = 1
    Q.text(toast.text, x + 12, y + 6, '#ffcd75', 2)
  }
  function drawTitle() {
    const start = Q.rooms[Q.start.room]
    ctx.save()
    ctx.translate(0, HUD)
    if (start) {
      const r = { ...Q.parseKey(start.key), key: start.key, def: start, map: start.map, entities: [] }
      drawTiles(r)
      start.draw?.(r)
    }
    ctx.restore()
    ctx.fillStyle = '#1a1c2c'
    ctx.globalAlpha = 0.72
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
    const center = (s, y, color, scale) => Q.text(s, Math.round((W - Q.textWidth(s, scale)) / 2), y, color, scale, '#1a1c2c')
    if (roll) return drawCast(center)
    center('THE ENDLESS', 96, '#f4f4f4', 4)
    center('QUEST', 136, '#ffcd75', 9)
    center('A game built by AI models,', 218, '#94b0c2', 2)
    center('one addition at a time', 238, '#94b0c2', 2)
    if (Math.floor(Q.time * 2) % 2 === 0) center('PRESS SPACE', 290, '#f4f4f4', 3)
    center('C: the cast', 344, '#ffcd75', 2)
    center('Arrows or WASD: move   Space or J: act   K: alt   C: chronicle', 404, '#94b0c2', 1)
  }
  // The cast, rolling up like the end of a film: [text, scale, colour, space after].
  function castLines() {
    const out = [['THE CAST', 4, '#ffcd75', 18], ['Every model that built this game,', 2, '#94b0c2', 0], ['in the order they came', 2, '#94b0c2', 44]]
    for (const c of Q.cast) {
      out.push([c.step ? `STEP ${c.step}` : 'THE BASE', 1, '#ffcd75', 6], [c.by, 2, '#f4f4f4', 6])
      for (const line of wrap(c.did, 64)) out.push([line, 1, '#94b0c2', 3])
      out[out.length - 1][3] = 30
    }
    const steps = Q.cast.filter(c => c.step), models = new Set(steps.map(c => c.by)).size
    if (steps.length) out.push([`${steps.length} step${steps.length > 1 ? 's' : ''} by ${models} model${models > 1 ? 's' : ''}`, 2, '#ffcd75', 14])
    out.push(['...and the next model.', 2, '#94b0c2', 0])
    return out
  }
  const castHeight = () => castLines().reduce((n, [, scale, , gap]) => n + 10 * scale + gap, 0)
  function drawCast(center) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 24, W, H - 72)
    ctx.clip()
    let y = H - 48 - roll.y
    for (const [text, scale, color, gap] of castLines()) {
      if (y > -40 && y < H) center(text, Math.round(y), color, scale)
      y += 10 * scale + gap
    }
    ctx.restore()
    center('Space: play    C: back    Up/Down: wind the cast', H - 30, '#94b0c2', 1)
  }
  function drawOver() {
    ctx.fillStyle = '#1a1c2c'
    ctx.globalAlpha = 0.8
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
    const center = (s, y, color, scale) => Q.text(s, Math.round((W - Q.textWidth(s, scale)) / 2), y, color, scale, '#1a1c2c')
    center('YOU FELL', 170, '#b13e53', 6)
    if (Q.time - overAt > 1) center('Press Space to try again', 254, '#f4f4f4', 2)
  }
  function drawError() {
    ctx.fillStyle = '#5d275d'
    ctx.fillRect(0, 0, W, H)
    Q.text('SOMETHING BROKE', 32, 40, '#ffcd75', 3)
    wrap(String(Q.error?.message || Q.error), 38).slice(0, 14).forEach((line, i) => Q.text(line, 32, 96 + i * 22, '#f4f4f4', 2))
  }

  function render() {
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#1a1c2c'
    ctx.fillRect(0, 0, W, H)
    if (Q.mode === 'title') return drawTitle()
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, HUD, W, ROOM_H)
    ctx.clip()
    if (slide && prev) {
      const p = 1 - (1 - slide.t) ** 3
      const sw = slide.dx * W, sh = slide.dy * ROOM_H
      drawRoom(prev, -sw * p, HUD - sh * p)
      drawRoom(room, sw * (1 - p), HUD + sh * (1 - p))
    } else drawRoom(room, 0, HUD)
    ctx.restore()
    if (fade > 0) {
      ctx.fillStyle = '#1a1c2c'
      ctx.globalAlpha = Math.min(1, fade / 0.35)
      ctx.fillRect(0, HUD, W, ROOM_H)
      ctx.globalAlpha = 1
    }
    drawHud()
    if (toast && Q.time < toast.until) drawToast()
    if (dialog) drawDialog()
    if (overlay) overlay.draw?.()
    if (Q.mode === 'over') drawOver()
  }

  // -------------------------------------------------------------- main loop
  const STEP = 1 / 60
  let last = null, acc = 0
  function frame(now) {
    if (Q.error) return
    requestAnimationFrame(frame)
    try {
      acc += Math.min(0.25, last == null ? 0 : (now - last) / 1000)
      last = now
      while (acc >= STEP) {
        update(STEP)
        acc -= STEP
        for (const k in hit) hit[k] = false
      }
      render()
    } catch (err) {
      Q.error = err
      console.error(err)
      drawError()
    }
  }
  // The largest whole-pixel scale that fits the window.
  function fit() {
    const k = Math.min(innerWidth / W, innerHeight / H)
    const s = k >= 1 ? Math.floor(k) : k
    canvas.style.width = `${W * s}px`
    canvas.style.height = `${H * s}px`
  }
  Q.boot = () => {
    fit()
    addEventListener('resize', fit)
    try {
      if (!Q.rooms[Q.start.room]) throw new Error(`no start room "${Q.start.room}"`)
      Q.emit('boot')   // every script is loaded: a good time to check content
    } catch (err) {
      Q.error = err
      drawError()
      throw err
    }
    requestAnimationFrame(frame)
  }
  addEventListener('load', () => Q.boot())
  return Q
})()
