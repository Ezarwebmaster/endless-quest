// The Endless Quest: The Crystal Caverns, a cave south of Willow Meadow
// where three crystal pedestals hold the door to the inner chamber shut.
// Light all three pedestals and the crystal door slides open. The inner
// chamber has been left clear for the next figure from history.
(() => {
  Q.dungeon('crystal', { name: 'The Crystal Caverns' })

  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // --- tiles ---
  // Polished dark stone floor, with the faint sheen of crystal dust.
  const stone = (p, seed) => {
    const r = seq(seed)
    p.rect(0, 0, 32, 32, 'D')
    p.rect(1, 1, 30, 30, 'd')
    for (let i = 0; i < 8; i++) p.dot(2 + Math.floor(r() * 28), 2 + Math.floor(r() * 28), r() < 0.5 ? 's' : 'k')
    for (let i = 0; i < 4; i++) {
      const x = 2 + Math.floor(r() * 28), y = 2 + Math.floor(r() * 28)
      p.line(x, y, x + 1, y, 'a')
    }
  }
  const FLOOR = [3, 17, 29, 41].map(s => Q.paint(32, 32, p => stone(p, s)))
  Q.tile('_', { name: 'polished stone', variants: FLOOR }, 'crystal')

  // Crystal wall: hewn dark stone, with crystal veins in the face.
  const FACE = Q.paint(32, 32, p => {
    const r = seq(7)
    p.rect(0, 0, 32, 32, 'k')
    p.rect(0, 0, 32, 32, 'D')
    for (let y = 2; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'd')
      p.line(0, y, 31, y, 's')
    }
    // Crystal veins in the face.
    for (let i = 0; i < 5; i++) {
      const x = 2 + Math.floor(r() * 28), y = 4 + Math.floor(r() * 24)
      p.line(x, y, x + 4, y - 2, 'a')
      p.line(x + 4, y - 2, x + 8, y + 1, 'c')
      p.dot(x + 2, y - 1, 'w')
    }
    p.rect(0, 0, 32, 3, 'k')
  })
  const BLOCKS = Q.paint(32, 32, p => {
    const r = seq(11)
    p.rect(0, 0, 32, 32, 'k')
    for (let y = 0; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'D')
      p.line(0, y, 31, y, 'd')
      for (const x of (y / 8) % 2 ? [4, 20] : [12, 28]) p.line(x, y, x, y + 6, 'k')
    }
    for (let i = 0; i < 3; i++) p.dot(2 + Math.floor(r() * 28), 2 + Math.floor(r() * 28), 'a')
  })
  const isWall = ch => ch === 'X' || ch === undefined
  Q.tile('X', {
    name: 'crystal wall', solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      Q.draw(isWall(at(0, 1)) ? BLOCKS : FACE, x, y)
      if (!isWall(at(-1, 0))) { Q.ctx.fillStyle = Q.palette.s; Q.ctx.fillRect(x, y, 2, 32) }
      if (!isWall(at(1, 0))) { Q.ctx.fillStyle = Q.palette.k; Q.ctx.fillRect(x + 30, y, 2, 32) }
      if (!isWall(at(0, -1))) { Q.ctx.fillStyle = Q.palette.k; Q.ctx.fillRect(x, y, 32, 3) }
    },
  }, 'crystal')

  // A crystal formation growing from the wall: tall, glowing faintly.
  const SPIKE = Q.paint(24, 36, p => {
    const r = seq(13)
    p.rect(8, 24, 8, 10, 'd')
    p.rect(10, 26, 4, 6, 's')
    p.poly([[12, 0], [20, 24], [4, 24]], 'c')
    p.poly([[12, 4], [18, 24], [6, 24]], 'a')
    p.poly([[12, 0], [18, 10], [12, 6]], 'w')
    p.line(12, 0, 12, 24, 'w')
    p.dot(10, 14, 'w'); p.dot(14, 20, 'w')
    p.outline('k')
  })
  Q.tile('C', { name: 'crystal formation', solid: true, sprite: SPIKE }, 'crystal')

  // --- sound ---
  Q.sfx('crystal-light', [
    { wave: 'sine', freq: 440, to: 880, dur: 0.24, vol: 0.08 },
    { wave: 'sine', freq: 660, to: 1320, dur: 0.3, vol: 0.06, delay: 0.12 },
  ])
  Q.sfx('crystal-door', [
    { wave: 'triangle', freq: 220, to: 110, dur: 0.5, vol: 0.07 },
    { wave: 'sine', freq: 110, to: 330, dur: 0.6, vol: 0.06, delay: 0.4 },
  ])

  // --- a crystal pedestal: a plinth with a dark crystal on top. ---
  // When the hero faces it and presses act, the crystal takes the light.
  const PEDESTAL = Q.paint(20, 30, p => {
    p.rect(4, 22, 12, 8, 'd')
    p.rect(4, 22, 12, 2, 's')
    p.rect(6, 12, 8, 10, 'D')
    p.rect(7, 13, 6, 8, 'd')
    p.line(7, 13, 12, 13, 's')
    p.outline('k')
  })
  const CRYSTAL_LIT = [0, 1, 2, 3].map(i => Q.paint(16, 18, p => {
    const t = i / 4
    p.poly([[8, 0], [14, 8 + t], [8, 17], [2, 8 + t]], 'c')
    p.poly([[8, 2], [12, 8 + t], [8, 14], [4, 8 + t]], 'a')
    p.poly([[8, 4], [10, 8 + t], [8, 12], [6, 8 + t]], 'w')
    p.line(8, 4, 8, 12, 'w')
    p.outline('k')
  }))

  Q.entity('crystal-pedestal', {
    w: 20, h: 28, solid: true,
    interact(e) {
      const key = 'crystal:pedestal_' + e.number
      if (Q.flag(key)) { Q.toast('Crystal ' + e.number + ' is already singing.'); return }
      Q.flag(key, true)
      Q.play('crystal-light')
      const lit = [1, 2, 3].filter(n => Q.flag('crystal:pedestal_' + n)).length
      if (lit === 3) {
        Q.flag('crystal:door_open', true)
        for (const g of Q.all('crystal-door')) Q.remove(g)
        Q.play('crystal-door')
        Q.toast('The third crystal sings! The crystal door slides open.', 4)
      } else {
        Q.toast('Crystal ' + e.number + ' takes the light (' + lit + '/3).', 3)
      }
    },
    draw(e) {
      const lit = !!Q.flag('crystal:pedestal_' + e.number)
      Q.shadow(e, 22)
      Q.drawOn(e, PEDESTAL)
      if (lit) {
        const f = CRYSTAL_LIT[Math.floor(Q.time * 4) % 4]
        Q.draw(f, Math.round(e.x + 2), Math.round(e.y - 8))
        Q.glow(e.x + 10, e.y - 4, 46, Q.palette.a, 0.28 + Math.sin(Q.time * 5 + e.number) * 0.04)
      } else {
        Q.draw(CRYSTAL_LIT[0], Math.round(e.x + 2), Math.round(e.y - 8), false)
        // Darken the crystal when unlit.
        Q.ctx.fillStyle = Q.palette.k
        Q.ctx.globalAlpha = 0.6
        Q.ctx.fillRect(e.x + 2, e.y - 8, 16, 18)
        Q.ctx.globalAlpha = 1
      }
      Q.text(String(e.number), Math.round(e.x + 8), Math.round(e.y + 6), lit ? Q.palette.y : Q.palette.s)
    },
  })

  // --- the crystal door: a sheet of dark crystal, until the pedestals sing. ---
  const DOOR = Q.paint(32, 40, p => {
    p.rect(0, 0, 32, 40, 'k')
    p.rect(2, 2, 28, 36, 'D')
    p.rect(4, 4, 24, 32, 'd')
    p.poly([[16, 4], [28, 20], [16, 36], [4, 20]], 'n')
    p.poly([[16, 8], [24, 20], [16, 32], [8, 20]], 'D')
    p.line(16, 4, 16, 36, 'k')
    p.line(4, 20, 28, 20, 'k')
    p.outline('k')
  })
  Q.entity('crystal-door', {
    w: 32, h: 32, solid: true,
    init(e) { if (Q.flag('crystal:door_open')) Q.remove(e) },
    interact() {
      Q.say('A dark sheet of crystal blocks the way. Three pedestals stand somewhere in the caverns; while they are silent the door keeps its silence too.')
    },
    draw(e) { Q.drawOn(e, DOOR) },
  })

  // --- crystal motes: harmless glints of light that drift through the cave. ---
  const MOTES = [0, 1, 2, 3].map(i => Q.paint(8, 8, p => {
    p.ellipse(4, 4, 3.5, 3.5, 'a')
    p.ellipse(4, 4, 2, 2, 'c')
    p.dot(4, 4, 'w')
  }))
  Q.entity('crystal-mote', {
    w: 8, h: 8,
    init(e) { e.t = Q.time; e.dx = 18 + Math.random() * 14 },
    update(e, dt) {
      e.t += dt
      const nx = e.x + Math.sin(e.t * 0.6) * e.dx * dt
      const ny = e.y + Math.cos(e.t * 0.4 + 1) * 14 * dt
      if (!Q.blocked(nx, e.y, e.w, e.h, e)) e.x = nx
      if (!Q.blocked(e.x, ny, e.w, e.h, e)) e.y = ny
    },
    draw(e) {
      Q.glow(e.x + 4, e.y + 4, 18, Q.palette.a, 0.32)
      Q.draw(MOTES[Math.floor(Q.time * 5) % 4], Math.round(e.x), Math.round(e.y))
    },
  })

  // The caverns are dim: the crystals and the motes are the only light.
  Q.on('draw', () => {
    if (Q.here.grid !== 'crystal') return
    Q.ctx.fillStyle = '#0a0a1a'
    Q.ctx.globalAlpha = 0.32
    Q.ctx.fillRect(0, 0, Q.W, Q.ROWS * Q.TILE)
    Q.ctx.globalAlpha = 1
    Q.here.map.forEach((row, ty) => [...row].forEach((ch, tx) => {
      if (ch === 'C') Q.glow(tx * 32 + 12, ty * 32 + 16, 30, Q.palette.a, 0.1)
    }))
  })
})()
