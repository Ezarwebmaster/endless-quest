// The Endless Quest: The Sunken Temple, a drowned hall of stone and salt
// under the shore west of Willow Meadow. Its floor is still under water, so
// the traveller lights the three sunken braziers to open the Tide Gate and
// reach the Shrine of the Tide, left empty for the next figure from history.
// Rooms: content/rooms/brine/. Tiles belong to the brine grid alone.
(() => {
  Q.dungeon('brine', { name: 'The Sunken Temple' })

  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // Wet flagstone: two or three shades, with salt in the cracks.
  const flag = (p, seed) => {
    const r = seq(seed)
    p.rect(0, 0, 32, 32, 's')
    p.rect(1, 1, 30, 30, 'd')
    p.line(1, 1, 30, 1, 'D'); p.line(1, 1, 1, 30, 'D')
    p.line(30, 2, 30, 30, 'k'); p.line(2, 30, 30, 30, 'k')
    p.line(15, 2, 15, 15, 'D'); p.line(17, 15, 17, 30, 'D')
    for (let i = 0; i < 10; i++) p.dot(2 + Math.floor(r() * 28), 2 + Math.floor(r() * 28), r() < 0.5 ? 'D' : 'k')
    if (r() < 0.5) { p.dot(6, 22, 'w'); p.dot(7, 22, 'w'); p.dot(23, 7, 'w') }
  }
  const FLOOR = [3, 17, 29, 41].map(seed => Q.paint(32, 32, p => flag(p, seed)))
  Q.tile('_', { name: 'wet flagstone', variants: FLOOR }, 'brine')

  // A wall of cut blocks: a face where the floor begins, a top elsewhere.
  const BLOCKS = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'D')
    for (let y = 0; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'd')
      p.line(0, y, 31, y, 's')
      p.line(0, y + 7, 31, y + 7, 'k')
      for (const x of (y / 8) % 2 ? [4, 20] : [12, 28]) { p.line(x, y, x, y + 6, 'k') }
    }
  })
  const FACE = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'D')
    for (let y = 2; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'd')
      p.line(0, y, 31, y, 's')
      p.line(0, y + 7, 31, y + 7, 'k')
    }
    p.rect(0, 0, 32, 3, 'k')
    // Weed and wet stone down the face of the wall.
    const r = seq(77)
    for (let i = 0; i < 5; i++) {
      const x = 3 + Math.floor(r() * 26), h = 4 + Math.floor(r() * 6)
      p.rect(x, 2, 1, h, 'G'); p.dot(x, 2, 'l')
    }
    p.rect(0, 29, 32, 3, 'k')
  })
  const isWall = ch => ch === 'X' || ch === undefined
  Q.tile('X', {
    name: 'temple wall',
    solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      Q.draw(isWall(at(0, 1)) ? BLOCKS : FACE, x, y)
      if (!isWall(at(-1, 0))) { Q.ctx.fillStyle = Q.palette.s; Q.ctx.fillRect(x, y, 2, 32) }
      if (!isWall(at(1, 0))) { Q.ctx.fillStyle = Q.palette.k; Q.ctx.fillRect(x + 30, y, 2, 32) }
      if (!isWall(at(0, -1))) { Q.ctx.fillStyle = Q.palette.k; Q.ctx.fillRect(x, y, 32, 3) }
    },
  }, 'brine')

  // Deep water: too deep to wade, and it hides things.
  const deep = frame => Q.paint(32, 32, p => {
    const r = seq(91 + frame)
    p.rect(0, 0, 32, 32, 'n')
    p.rect(1, 1, 30, 30, 'v')
    for (let y = 2; y < 31; y += 5) {
      const off = Math.round(Math.sin((y + frame * 3) * 0.6) * 3)
      p.line(2 + off, y, 29 + off, y, 'b')
    }
    for (let i = 0; i < 8; i++) p.dot(2 + Math.floor(r() * 28), 2 + Math.floor(r() * 28), 'a')
    p.rect(0, 0, 32, 1, 'b'); p.rect(0, 31, 32, 1, 'b')
  })
  Q.tile('~', { name: 'deep water', solid: true, frames: [0, 1, 2].map(deep), fps: 3 }, 'brine')

  // Shallow water: you can wade it, and it shines.
  const shallow = Q.paint(32, 32, p => {
    flag(p, 53)
    p.rect(0, 0, 32, 32, 'b', ['s', 'd'])
    for (let y = 4; y < 32; y += 7) p.line(2 + Math.round(Math.sin(y) * 2), y, 20, y, 'c')
    p.dot(6, 9, 'a'); p.dot(25, 22, 'a')
  })
  Q.tile('w', {
    name: 'shallow water',
    draw(x, y) {
      Q.draw(shallow, x, y)
      if (Math.sin(Q.time * 2 + x * 0.05 + y * 0.03) > 0.7) Q.glow(x + 16, y + 16, 22, Q.palette.a, 0.14)
    },
  }, 'brine')

  // Steps up to the Shrine, wet and worn.
  const STEPS = Q.paint(32, 32, p => {
    flag(p, 61)
    for (let i = 0; i < 4; i++) {
      const y = 3 + i * 7
      p.rect(1, y, 30, 3, 's')
      p.line(1, y, 30, y, 'w')
      p.rect(1, y + 3, 30, 3, 'd')
      p.line(1, y + 6, 30, y + 6, 'k')
    }
  })
  Q.tile('^', { name: 'temple steps', sprite: STEPS }, 'brine')

  // --- Sound ---
  Q.sfx('tide-bubble', [
    { wave: 'sine', freq: 220, to: 520, dur: 0.18, vol: 0.08 },
    { wave: 'sine', freq: 520, to: 180, dur: 0.16, vol: 0.06, delay: 0.16 },
  ])
  Q.sfx('tide-light', [
    { wave: 'triangle', freq: 330, to: 495, dur: 0.2, vol: 0.09 },
    { wave: 'triangle', freq: 495, to: 660, dur: 0.26, vol: 0.08, delay: 0.16 },
  ])
  Q.sfx('tide-gate', [
    { wave: 'sawtooth', freq: 90, to: 60, dur: 0.4, vol: 0.06 },
    { wave: 'sine', freq: 140, to: 320, dur: 0.5, vol: 0.07, delay: 0.3 },
  ])
  Q.sfx('wisp-splash', [{ wave: 'triangle', freq: 700, to: 180, dur: 0.22, vol: 0.08 }])

  // --- A sunken brazier: a bowl on a plinth, dark until it is lit. ---
  const bowl = lit => Q.paint(26, 34, p => {
    p.rect(4, 24, 18, 8, 'd')
    p.rect(4, 24, 18, 2, 's')
    p.rect(2, 30, 22, 3, 'D')
    p.rect(6, 18, 14, 7, 's')
    p.rect(7, 19, 12, 5, 'd')
    p.line(7, 19, 18, 19, 'w')
    if (lit) {
      p.ellipse(13, 15, 8, 5, 'o')
      p.ellipse(13, 14, 5, 3, 'y')
      p.ellipse(13, 13, 3, 2, 'w')
      p.dot(11, 10, 'o'); p.dot(15, 9, 'y')
    } else {
      p.ellipse(13, 21, 6, 2, 'k')
      p.rect(9, 20, 3, 2, 'U')
    }
    p.outline('k')
  })

  Q.entity('tide-brazier', {
    w: 22, h: 14, solid: true,
    interact(e) {
      const key = 'brine:brazier_' + e.number
      if (Q.flag(key)) { Q.toast('Brazier ' + e.number + ' burns, and the water sinks a little further.'); return }
      Q.flag(key, true)
      Q.play('tide-light')
      const lit = [1, 2, 3].filter(n => Q.flag('brine:brazier_' + n)).length
      if (lit === 3) {
        Q.flag('brine:gate_open', true)
        for (const g of Q.all('tide-gate')) Q.remove(g)
        Q.play('tide-gate')
        Q.toast('The last brazier takes the flame. The water drains away and the Tide Gate grinds open!', 4)
      } else {
        Q.toast('Brazier ' + e.number + ' takes the flame (' + lit + '/3). The water sinks a little further.', 3)
      }
    },
    draw(e) {
      const lit = !!Q.flag('brine:brazier_' + e.number)
      Q.shadow(e, 24)
      Q.drawOn(e, bowl(lit))
      Q.text(String(e.number), Math.round(e.x + 9), Math.round(e.y - 2), lit ? Q.palette.y : Q.palette.s)
      if (lit) Q.glow(e.x + 13, e.y - 6, 52, Q.palette.o, 0.26 + Math.sin(Q.time * 7) * 0.03)
    },
  })

  // --- The Tide Gate, held shut while the hall is flooded. ---
  const GATE = Q.paint(32, 40, p => {
    p.rect(0, 0, 32, 40, 'D')
    p.rect(2, 2, 28, 36, 'd')
    p.circle(16, 20, 11, 's')
    p.circle(16, 20, 9, 'd')
    p.circle(16, 20, 6, 'b')
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      p.rect(15 + Math.cos(a) * 13, 19 + Math.sin(a) * 13, 3, 3, 's')
    }
    p.rect(14, 4, 4, 32, 'U'); p.line(15, 4, 15, 35, 'h')
    p.rect(2, 19, 28, 4, 'U'); p.line(2, 20, 29, 20, 'h')
    p.outline('k')
  })
  Q.entity('tide-gate', {
    w: 32, h: 30, solid: true,
    init(e) { if (Q.flag('brine:gate_open')) Q.remove(e) },
    interact() {
      Q.say('A round gate of blue stone, chained shut. Salt has crusted the chain. Three sunken braziers stand somewhere in the flooded hall; while they are cold the temple keeps its water.')
    },
    draw(e) { Q.drawOn(e, GATE) },
  })

  // --- A tide wisp: a lantern of jelly that drifts over the water. The
  // hero cannot fight, but a touch of the hand disperses it. ---
  const wisp = (p, frame) => {
    const t = frame / 4
    p.ellipse(13, 18 + t, 12, 10, 'c')
    p.ellipse(13, 17 + t, 8, 7, 'a')
    p.ellipse(13, 16 + t, 4, 4, 'w')
    for (const [x, y, r] of [[5, 21 + t, 4], [21, 22 + t, 3], [12, 26 + t, 3]]) {
      p.ellipse(x, y, r, r, 'c')
      p.ellipse(x, y - 1, r - 1, r - 2, 'a')
    }
    p.rect(6, 5, 2, 8 + t, 'c'); p.rect(20, 5, 2, 8 + t, 'c')
    p.dot(6, 5, 'w'); p.dot(20, 5, 'w')
    p.outline('k')
  }
  const WISP = [0, 1, 2, 3].map(f => Q.paint(26, 30, p => wisp(p, f)))

  Q.entity('tide-wisp', {
    w: 20, h: 18,
    init(e) { e.t = Q.time; e.dx = 40 + Math.random() * 30; e.hp = 1 },
    update(e, dt) {
      e.t += dt
      // Drift over the hall, turning at the walls.
      const nx = e.x + Math.sin(e.t * 0.7) * e.dx * dt
      const ny = e.y + Math.cos(e.t * 0.5 + 1) * 22 * dt
      if (!Q.blocked(nx, e.y, e.w, e.h, e)) e.x = nx
      if (!Q.blocked(e.x, ny, e.w, e.h, e)) e.y = ny
      if (Q.overlap(e, Q.hero) && Q.mode === 'play') Q.hurt(1, e)
    },
    hit(e) {
      if (Q.flag('brine:wisp_' + e.number)) return
      e.hp--
      if (e.hp > 0) return
      Q.flag('brine:wisp_' + e.number, true)
      Q.play('wisp-splash')
      const banished = [1, 2, 3].filter(n => Q.flag('brine:wisp_' + n)).length
      if (banished === 3) {
        Q.toast('The last tide wisp is dispersed. The water is still and clear again.', 3)
      } else {
        Q.toast('The tide wisp bursts into spray and drifts apart (' + banished + '/3).', 2.5)
      }
      Q.remove(e)
    },
    draw(e) {
      const bob = Math.sin(e.t * 2) * 1.5
      Q.ctx.globalAlpha = 0.25
      Q.ctx.fillStyle = Q.palette.k
      Q.ctx.beginPath(); Q.ctx.ellipse(e.x + 10, e.y + e.h - 2, 8, 3, 0, 0, Math.PI * 2); Q.ctx.fill()
      Q.ctx.globalAlpha = 1
      Q.draw(WISP[Math.floor(Q.time * 6) % 4], Math.round(e.x - 3), Math.round(e.y - 12 + bob))
      Q.glow(e.x + 10, e.y - 2, 46, Q.palette.a, 0.22 + Math.sin(Q.time * 3 + e.number) * 0.04)
    },
  })

  // The hero has no sword: touching a tide wisp with the act key disperses it.
  Q.on('act', () => {
    if (Q.here.grid !== 'brine') return false
    const hero = Q.hero
    for (const w of Q.all('tide-wisp')) {
      if (Math.abs(w.x - hero.x) < 30 && Math.abs(w.y - hero.y) < 30) {
        Q.strike({ x: hero.x - 12, y: hero.y - 10, w: hero.w + 24, h: hero.h + 22 }, 1, hero)
        Q.play('wisp-splash')
        return true
      }
    }
    return false
  })

  // The hall is dim: the braziers and the water are the only light.
  Q.on('draw', () => {
    if (Q.here.grid !== 'brine') return
    const open = Q.flag('brine:gate_open')
    Q.ctx.fillStyle = open ? '#101a30' : '#0c1626'
    Q.ctx.globalAlpha = 0.34
    Q.ctx.fillRect(0, 0, Q.W, Q.ROWS * Q.TILE)
    Q.ctx.globalAlpha = 1
    Q.here.map.forEach((row, ty) => [...row].forEach((ch, tx) => {
      if (ch === '~') Q.glow(tx * 32 + 16, ty * 32 + 16, 46, Q.palette.b, 0.12)
      if (ch === 'w') Q.glow(tx * 32 + 16, ty * 32 + 16, 34, Q.palette.a, 0.08)
    }))
  })
})()
