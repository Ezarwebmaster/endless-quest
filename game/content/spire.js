// The Endless Quest: The Cloudspire, a tower standing above the clouds.
// Way up its Cloud Court, three brass weather vanes must be set into the
// wind before the Sky Gate will open. The Orrery Chamber above the gate has
// been left clear for the next figure from history.
(() => {
  Q.dungeon('spire', { name: 'The Cloudspire' })

  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // --- tiles ---
  // Pale flagstone floors, scoured by the wind, with thin cloud shadows.
  const FLOOR = [3, 17, 29, 41].map(s => Q.paint(32, 32, p => {
    const r = seq(s)
    p.rect(0, 0, 32, 32, 's')
    p.rect(1, 1, 30, 30, 'w')
    p.rect(0, 0, 32, 2, 'd')
    p.rect(0, 30, 32, 2, 'd')
    p.rect(0, 0, 2, 32, 'd')
    p.rect(30, 0, 2, 32, 'd')
    p.line(16, 2, 16, 30, 's'); p.line(2, 16, 30, 16, 's')
    for (let i = 0; i < 4; i++) p.dot(3 + Math.floor(r() * 26), 3 + Math.floor(r() * 26), 'c')
  }))
  Q.tile('_', { name: 'cloud flagstone', variants: FLOOR }, 'spire')

  // Cloud-stone wall: hewn pale blocks, weathered, with a bright top edge.
  const FACE = Q.paint(32, 32, p => {
    const r = seq(23)
    p.rect(0, 0, 32, 32, 'k')
    p.rect(0, 0, 32, 32, 's')
    for (let y = 0; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'w')
      p.line(0, y + 7, 31, y + 7, 's')
      for (const x of (y / 8) % 2 ? [6, 22] : [14, 30]) p.line(x, y + 1, x, y + 6, 's')
    }
    for (let i = 0; i < 3; i++) p.line(2 + Math.floor(r() * 24), 4 + Math.floor(r() * 24), 8 + Math.floor(r() * 20), 4 + Math.floor(r() * 24), 'c')
    p.rect(0, 0, 32, 3, 'w')
  })
  const BLOCKS = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'k')
    for (let y = 0; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 's')
      p.line(0, y, 31, y, 'd')
      for (const x of (y / 8) % 2 ? [4, 20] : [12, 28]) p.line(x, y, x, y + 6, 's')
    }
  })
  const isWall = ch => ch === 'X' || ch === undefined
  Q.tile('X', {
    name: 'cloud-stone wall', solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      Q.draw(isWall(at(0, 1)) ? BLOCKS : FACE, x, y)
      if (!isWall(at(-1, 0))) { Q.ctx.fillStyle = Q.palette.w; Q.ctx.fillRect(x, y, 2, 32) }
      if (!isWall(at(1, 0))) { Q.ctx.fillStyle = Q.palette.d; Q.ctx.fillRect(x + 30, y, 2, 32) }
      if (!isWall(at(0, -1))) { Q.ctx.fillStyle = Q.palette.w; Q.ctx.fillRect(x, y, 32, 3) }
    },
  }, 'spire')

  // --- sound ---
  Q.sfx('vane-turn', [{ wave: 'triangle', freq: 520, to: 260, dur: 0.14, vol: 0.07 }])
  Q.sfx('spire-gate', [
    { wave: 'sine', freq: 330, to: 660, dur: 0.4, vol: 0.07 },
    { wave: 'sine', freq: 495, to: 990, dur: 0.5, vol: 0.05, delay: 0.18 },
  ])
  Q.sfx('spire-gust', [{ wave: 'sine', freq: 700, to: 1400, dur: 0.5, vol: 0.04 }])

  // --- a weather vane: a brass post with a sail that turns on its arm. ---
  // Press act and the sail creaks round a quarter, hunting for the wind.
  const POST = Q.paint(6, 22, p => {
    p.rect(2, 8, 2, 12, 'u')
    p.rect(2, 8, 1, 12, 'h')
    p.outline('k')
  })
  const SAIL = [0, 1, 2, 3].map(i => Q.paint(20, 12, p => {
    p.rect(0, 5, 20, 2, 'y')            // the arm the sail hangs on
    p.poly([[2, 3], [18, 1], [18, 9], [2, 7]], 'y')
    p.poly([[2, 3], [18, 1], [18, 4], [2, 5]], 'o')
    p.line(2, 7, 18, 9, 'u')
    p.outline('k')
  }))

  // The wind in the Cloud Court blows from the east: the sail must point up.
  const WIND_DIR = 'up'
  const DIRS = ['right', 'down', 'left', 'up']
  const dirIndex = d => DIRS.indexOf(d)

  Q.entity('wind-vane', {
    w: 16, h: 26, solid: true,
    init(e) {
      if (Q.flag('spire:vane_' + e.number)) e.dir = Q.flag('spire:vane_' + e.number)
    },
    interact(e) {
      e.dir = DIRS[(dirIndex(e.dir || 'right') + 1) % 4]
      Q.flag('spire:vane_' + e.number, e.dir)
      Q.play('vane-turn')
      const set = [1, 2, 3].filter(n => Q.flag('spire:vane_' + n) === WIND_DIR).length
      if (set === 3) {
        Q.flag('spire:gate_open', true)
        for (const g of Q.all('sky-gate')) Q.remove(g)
        Q.play('spire-gate')
        Q.toast('The third vane bites the wind. The Sky Gate swings open.', 4)
      } else {
        Q.toast('Vane ' + e.number + ' creaks round to face ' + e.dir + ' (' + set + '/3 in the wind).', 3)
      }
    },
    draw(e) {
      Q.shadow(e, 14)
      Q.drawOn(e, POST)
      const f = SAIL[dirIndex(e.dir || 'right')]
      Q.drawOn(e, f)
      Q.text(String(e.number), Math.round(e.x + 6), Math.round(e.y + 2), Q.palette.D)
    },
  })

  // --- the Sky Gate: cloud-stone bars, until every vane faces the wind. ---
  const GATE = Q.paint(32, 40, p => {
    p.rect(0, 0, 32, 40, 'k')
    p.rect(1, 1, 30, 38, 's')
    for (const x of [6, 14, 22]) {
      p.rect(x, 3, 4, 34, 'd')
      p.rect(x, 3, 2, 34, 's')
    }
    p.rect(1, 16, 30, 3, 'd')
    p.rect(0, 0, 32, 3, 'y')
    p.outline('k')
  })
  Q.entity('sky-gate', {
    w: 32, h: 32, solid: true,
    init(e) { if (Q.flag('spire:gate_open')) Q.remove(e) },
    interact() {
      Q.say('A gate of cloud-stone bars, sealed shut. Three brass weather vanes stand in the court; while they do not face the wind, it stays shut.')
    },
    draw(e) { Q.drawOn(e, GATE) },
  })

  // --- gusts: little puffs of cloud that drift through the court and push
  // the traveller. They cannot sting, only shove. ---
  const PUFF = [0, 1, 2].map(i => Q.paint(22, 12, p => {
    p.ellipse(7, 7 - i, 5, 4 - (i > 1 ? 1 : 0), 'w')
    p.ellipse(14, 8, 6, 5, 'w')
    p.ellipse(19, 6, 4, 3, 'w')
    p.ellipse(7, 6 - i, 3, 2, 'c')
    p.ellipse(13, 7, 4, 3, 'c')
  }))
  Q.entity('spire-gust', {
    w: 22, h: 12,
    init(e) { e.dir = e.dx > 0 ? 1 : -1; e.t = Q.time },
    update(e, dt) {
      const nx = e.x + e.dx * 26 * dt
      if (Q.blocked(nx, e.y, e.w, e.h, e)) e.dx = -e.dx
      else e.x = nx
      // A puff of cloud shoves the hero along with it.
      const hero = Q.hero
      if (Q.overlap(e, hero)) {
        const push = e.dx * 26 * dt
        if (!Q.blocked(hero.x + push, hero.y, hero.w, hero.h)) hero.x += push
      }
    },
    draw(e) {
      Q.glow(e.x + 11, e.y + 6, 26, Q.palette.w, 0.22)
      Q.draw(PUFF[Math.floor(Q.time * 6 + e.x) % 3], Math.round(e.x), Math.round(e.y), e.dx < 0)
    },
  })

  // The clouds below the tower show through the court: a soft blue depth.
  Q.on('draw', () => {
    if (Q.here.grid !== 'spire') return
    Q.ctx.fillStyle = Q.palette.c
    Q.ctx.globalAlpha = 0.08
    Q.ctx.fillRect(0, 0, Q.W, Q.ROWS * Q.TILE)
    Q.ctx.globalAlpha = 1
    // Streaks of high wind, drifting across the room.
    Q.ctx.fillStyle = Q.palette.w
    Q.ctx.globalAlpha = 0.16
    for (let i = 0; i < 5; i++) {
      const x = ((Q.time * (26 + i * 9) + i * 137) % (Q.W + 120)) - 60
      const y = 30 + i * 66
      Q.ctx.fillRect(Math.round(x), y, 44 + i * 8, 1)
    }
    Q.ctx.globalAlpha = 1
  })
})()