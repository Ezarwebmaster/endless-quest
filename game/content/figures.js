// The Endless Quest: the figures from history, and the dungeons that hide them.
//
// The mist does not only hide the lands nobody has built: it swallows people
// from other times and leaves them lost in the kingdom's dungeons, one in
// each. The traveller can find them, ask them about their life, and keep
// them in the Chronicle (C).
//
//   Q.dungeon('crypt', { name: 'The Sunken Crypt' })
//     A dungeon is a grid of its own: its rooms are 'crypt:0_0', 'crypt:1_0'…
//     Its tiles can be its own too: Q.tile('X', def, 'crypt').
//   Q.figure({ name, born, died, room: 'crypt:1_0', at: [7, 3],
//              hello, era, deed, sprite })
//     A real person, drawn so a player knows them at a glance. hello is what
//     they say first (who they are); era answers "When did you live?" and
//     deed "What did you do?". Years before Christ are negative.
(() => {
  const YEARS_SINCE_DEATH = 70
  const MAX_TEXT = 300
  Q.dungeons = []
  Q.figures = []

  Q.dungeon = (id, def = {}) => {
    if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`Q.dungeon: "${id}" must be a lowercase name (its rooms are ${id}:0_0…)`)
    if (Q.dungeons.some(d => d.id === id)) throw new Error(`Q.dungeon: there is already a dungeon "${id}"`)
    if (typeof def.name !== 'string' || !def.name.trim()) throw new Error(`Q.dungeon ${id}: give it a name`)
    Q.dungeons.push({ ...def, id, name: def.name.trim() })
  }

  Q.figure = def => {
    const who = def?.name
    if (typeof who !== 'string' || !who.trim()) throw new Error('Q.figure: name is the person\'s real name')
    const bad = msg => new Error(`Q.figure ${who}: ${msg}`)
    if (Q.figures.some(f => f.name.toLowerCase() === who.trim().toLowerCase())) throw bad('is already in the game: choose someone else')
    if (!Number.isInteger(def.born) || !Number.isInteger(def.died) || def.died < def.born || def.died - def.born > 120) throw bad('born and died are years (whole numbers, negative before Christ)')
    const limit = new Date().getFullYear() - YEARS_SINCE_DEATH
    if (def.died > limit) throw bad(`only people who died more than ${YEARS_SINCE_DEATH} years ago (in ${limit} or before)`)
    for (const k of ['hello', 'era', 'deed']) {
      if (typeof def[k] !== 'string' || !def[k].trim()) throw bad(`${k} is missing`)
      if (def[k].length > MAX_TEXT) throw bad(`${k} is ${def[k].length} characters: keep each answer under ${MAX_TEXT}`)
    }
    if (!def.sprite?.canvas) throw bad('sprite is missing: draw them with Q.paint')
    if (!Array.isArray(def.at) || def.at.length !== 2) throw bad('at is the tile they stand on: [tileX, tileY]')
    Q.figures.push({ ...def, name: who.trim() })
  }

  // Everything must fit together once every script is loaded.
  Q.on('boot', () => {
    for (const d of Q.dungeons) {
      if (!Object.keys(Q.rooms).some(k => Q.parseKey(k).grid === d.id)) throw new Error(`dungeon ${d.id} has no room: name its rooms ${d.id}:0_0…`)
    }
    const taken = {}
    for (const f of Q.figures) {
      const room = Q.rooms[f.room]
      if (!room) throw new Error(`Q.figure ${f.name}: there is no room "${f.room}"`)
      const grid = Q.parseKey(f.room).grid
      const dungeon = Q.dungeons.find(d => d.id === grid)
      if (!dungeon) throw new Error(`Q.figure ${f.name}: ${f.room} is not in a dungeon; figures hide in dungeons (Q.dungeon)`)
      if (taken[grid]) throw new Error(`Q.figure ${f.name}: ${dungeon.name} already hides ${taken[grid]}; one figure per dungeon`)
      taken[grid] = f.name
      const [tx, ty] = f.at
      const ch = room.map[ty]?.[tx]
      const tile = ch && ((grid && Q.tiles[`${grid}:${ch}`]) || Q.tiles[ch])
      if (!tile || tile.solid) throw new Error(`Q.figure ${f.name}: tile [${tx}, ${ty}] of ${f.room} is outside the room or solid`)
    }
  })
  Q.dungeonOf = f => Q.dungeons.find(d => d.id === Q.parseKey(f.room)?.grid)
  Q.met = f => !!Q.flag(`met:${f.name}`)

  // ------------------------------------------------------------ the figures
  Q.sfx('found', [523, 659, 784, 1047].map((freq, i) => ({ wave: 'triangle', freq, dur: 0.14, vol: 0.1, delay: i * 0.09 })))
  Q.entity('figure', {
    w: 20,
    h: 12,
    solid: true,
    interact(e) {
      const f = e.figure
      if (!Q.met(f)) {
        Q.flag(`met:${f.name}`, true)
        const found = Q.figures.filter(Q.met).length
        Q.toast(`${f.name} joins your Chronicle (${found}/${Q.figures.length})`, 3.5)
        Q.play('found')
      }
      const ask = text => Q.ask(text, ['When did you live?', 'What did you do?', 'Goodbye'], i => {
        if (i === 0) Q.say(f.era, () => ask('Anything else?'))
        if (i === 1) Q.say(f.deed, () => ask('Anything else?'))
      })
      ask(f.hello)
    },
    draw(e) {
      const f = e.figure
      Q.shadow(e, 24)
      const s = f.frames ? f.frames[Math.floor(Q.time * 1.5) % f.frames.length] : f.sprite
      Q.drawOn(e, s)
      if (!Q.met(f)) {
        // A glint over the head of someone the traveller has not met yet.
        const x = Math.round(e.x + e.w / 2), y = Math.round(e.y + e.h - s.h - 8 + Math.sin(Q.time * 3) * 2)
        Q.glow(x, y, 8, '#ffcd75', 0.5)
        Q.ctx.fillStyle = '#ffcd75'
        Q.ctx.fillRect(x - 1, y - 3, 2, 6)
        Q.ctx.fillRect(x - 3, y - 1, 6, 2)
        Q.ctx.fillStyle = '#f4f4f4'
        Q.ctx.fillRect(x - 1, y - 1, 2, 2)
      }
    },
  })
  Q.on('enter', room => {
    for (const f of Q.figures) {
      if (f.room !== room.key) continue
      Q.spawn('figure', f.at[0] * Q.TILE + 6, f.at[1] * Q.TILE + 14, { figure: f })
    }
  })

  // ---------------------------------------------------------- the Chronicle
  const years = y => (y < 0 ? `${-y} BC` : String(y))
  const silhouettes = new Map()
  const silhouette = s => {
    if (!silhouettes.has(s)) {
      const c = document.createElement('canvas')
      c.width = s.w
      c.height = s.h
      const g = c.getContext('2d')
      g.drawImage(s.canvas, 0, 0)
      g.globalCompositeOperation = 'source-in'
      g.fillStyle = '#333c57'
      g.fillRect(0, 0, s.w, s.h)
      silhouettes.set(s, { canvas: c, w: s.w, h: s.h })
    }
    return silhouettes.get(s)
  }
  const PER_PAGE = 6
  let page = 0
  const chronicle = {
    update() {
      const pages = Math.max(1, Math.ceil(Q.figures.length / PER_PAGE))
      if (Q.pressed('right')) page = (page + 1) % pages
      if (Q.pressed('left')) page = (page + pages - 1) % pages
      if (Q.pressed('book') || Q.pressed('act') || Q.pressed('alt')) return false
    },
    draw() {
      const { W, H } = Q, ctx = Q.ctx
      ctx.fillStyle = '#1a1c2c'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#333c57'
      ctx.fillRect(16, 16, W - 32, 2)
      ctx.fillRect(16, H - 18, W - 32, 2)
      const found = Q.figures.filter(Q.met).length
      Q.text('CHRONICLE', 32, 34, '#ffcd75', 3, '#000000')
      Q.text(`${found} of ${Q.figures.length} found`, W - 32 - Q.textWidth(`${found} of ${Q.figures.length} found`, 2), 40, '#94b0c2', 2)
      Q.text('People of other times, lost in the kingdom\'s dungeons.', 32, 72, '#94b0c2', 1)
      if (!Q.figures.length) Q.text('No one yet.', 32, 120, '#566c86', 2)
      Q.figures.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).forEach((f, i) => {
        const y = 96 + i * 52, met = Q.met(f), s = f.sprite
        Q.draw(met ? s : silhouette(s), 40 + (32 - s.w) / 2, y + 44 - s.h)
        const where = Q.dungeonOf(f)?.name || f.room
        if (met) {
          Q.text(f.name, 88, y + 12, '#f4f4f4', 2)
          Q.text(`${years(f.born)} - ${years(f.died)}   found in ${where}`, 88, y + 34, '#94b0c2', 1)
        } else {
          Q.text('? ? ?', 88, y + 12, '#566c86', 2)
          Q.text(`Lost somewhere in ${where}`, 88, y + 34, '#566c86', 1)
        }
      })
      const pages = Math.max(1, Math.ceil(Q.figures.length / PER_PAGE))
      const foot = pages > 1 ? `< page ${page + 1} of ${pages} >      C: close` : 'C: close'
      Q.text(foot, W - 32 - Q.textWidth(foot, 1), H - 34, '#94b0c2', 1)
    },
  }
  Q.on('update', () => { if (Q.pressed('book')) { page = 0; Q.overlay(chronicle) } })
})()
