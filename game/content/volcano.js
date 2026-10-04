// The Endless Quest: The Emberdeep, a volcano on the headland east of
// Starglass Glade. Its mouth is a stair of black basalt; inside, three iron
// lids hold back the lava. Heave each lid open and the Slag Gate at the head
// of the hall grinds up. The furnace chamber above it has been left clear for
// the next figure from history.
(() => {
  Q.dungeon('volcano', { name: 'The Emberdeep' })

  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // --- tiles of the world headland (also the floor inside) ---
  // Black basalt: cooled lava, ringed and cracked, light from the top left.
  const basalt = seed => Q.paint(32, 32, p => {
    const r = seq(seed + 7)
    p.rect(0, 0, 32, 32, 'k')
    p.rect(1, 1, 30, 30, 'D')
    p.rect(2, 2, 28, 14, 'd')
    p.line(2, 2, 29, 2, 's')
    p.rect(2, 3, 13, 5, 'D')
    for (let i = 0; i < 3; i++) {
      const x = 3 + Math.floor(r() * 24), y = 18 + Math.floor(r() * 12)
      p.line(x, y, x + 3 + Math.floor(r() * 4), y + 1, 'k')
    }
    p.line(18, 6, 22, 12, 'D'); p.line(23, 4, 27, 9, 'D')
    p.outline('k')
  })
  Q.tile('B', { name: 'black basalt', solid: true, variants: [basalt(3), basalt(11), basalt(19), basalt(29)] })

  // Ash: grey ground, soft underfoot, drifted with pale cinders.
  const ash = seed => Q.paint(32, 32, p => {
    const r = seq(seed + 13)
    p.rect(0, 0, 32, 32, 'd')
    p.rect(0, 0, 32, 2, 's')
    for (let i = 0; i < 16; i++) {
      const x = Math.floor(r() * 31), y = 3 + Math.floor(r() * 28)
      p.rect(x, y, 1 + Math.floor(r() * 2), 1, r() < 0.4 ? 's' : 'D')
    }
    for (let i = 0; i < 3; i++) p.dot(4 + Math.floor(r() * 24), 6 + Math.floor(r() * 22), 'w')
  })
  Q.tile('A', { name: 'ash', variants: [ash(5), ash(15), ash(25)] })

  // --- tiles of the deep ---
  // The same basalt, but sealed with heat: the seams glow.
  Q.tile('_', { name: 'scorched basalt', variants: [basalt(2), basalt(12), basalt(22)] }, 'volcano')

  // The throat wall: black rock squared by the old lava, hot seams between.
  const isWall = ch => ch === 'X' || ch === undefined
  Q.tile('X', {
    name: 'volcanic wall', solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      Q.draw(basalt(5 + ((tx + ty) % 2) * 8), x, y)
      if (!isWall(at(-1, 0))) { Q.ctx.fillStyle = Q.palette.s; Q.ctx.fillRect(x, y, 2, 32) }
      if (!isWall(at(1, 0))) { Q.ctx.fillStyle = Q.palette.k; Q.ctx.fillRect(x + 30, y, 2, 32) }
      if (!isWall(at(0, -1))) { Q.ctx.fillStyle = Q.palette.s; Q.ctx.fillRect(x, y, 32, 3) }
    },
  }, 'volcano')

  // Lava: it never cools here. Two shades, a bright skin, and it breathes.
  Q.tile('L', {
    name: 'lava', solid: true,
    draw(x, y) {
      const t = Q.time
      Q.ctx.fillStyle = Q.palette.k
      Q.ctx.fillRect(x, y, 32, 32)
      Q.ctx.fillStyle = Q.palette.r
      Q.ctx.fillRect(x + 1, y + 1, 30, 30)
      Q.ctx.fillStyle = Q.palette.o
      for (let i = 0; i < 5; i++) {
        const yy = y + 3 + ((i * 6 + Math.floor(t * 6)) % 28)
        Q.ctx.fillRect(x + 2 + ((i * 7 + Math.floor(t * 3)) % 18), yy, 8 + (i % 3) * 4, 3)
      }
      Q.ctx.fillStyle = Q.palette.y
      for (let i = 0; i < 3; i++) {
        const yy = y + 6 + ((i * 9 + Math.floor(t * 5)) % 24)
        Q.ctx.fillRect(x + 4 + ((i * 11 + Math.floor(t * 2)) % 20), yy, 5, 2)
      }
    },
  }, 'volcano')

  // --- sound ---
  Q.sfx('lid-heave', [{ wave: 'sawtooth', freq: 90, to: 55, dur: 0.45, vol: 0.06 }, { wave: 'triangle', freq: 300, to: 120, dur: 0.2, vol: 0.05, delay: 0.4 }])
  Q.sfx('slag-gate', [
    { wave: 'sawtooth', freq: 120, to: 60, dur: 0.7, vol: 0.07 },
    { wave: 'square', freq: 200, to: 400, dur: 0.3, vol: 0.04, delay: 0.6 },
  ])
  Q.sfx('lava-hiss', [{ wave: 'sine', freq: 180, to: 60, dur: 0.6, vol: 0.05 }])

  // --- a vent lid: an iron plate over a hole full of fire. ---
  // Press act and it grinds up on its chain; three heaves lift it clear.
  const LID = [0, 1, 2].map(step => Q.paint(32, 26, p => {
    p.rect(0, 0, 32, 26, 'k')
    p.rect(1, 1, 30, 24, 'D')
    p.rect(2, 2, 28, 10 - step * 3, 'd')
    p.rect(2, 2, 28, 2, 's')
    for (const x of [4, 14, 24]) { p.rect(x, 3, 2, 20 - step * 3, 'k'); p.rect(x, 3, 1, 20 - step * 3, 's') }
    p.rect(1, 22, 30, 3, 'k')
    p.outline('k')
  }))
  const ventsOpen = () => [1, 2, 3].filter(n => (Q.flag('volcano:lid_' + n) || 0) === 3).length
  Q.entity('vent-lid', {
    w: 30, h: 22, solid: true,
    init(e) { e.lifts = Q.flag('volcano:lid_' + e.number) || 0 },
    interact(e) {
      if (e.lifts >= 3) { Q.toast('This lid is already off its vent.'); return }
      e.lifts++
      Q.flag('volcano:lid_' + e.number, e.lifts)
      Q.play('lid-heave')
      if (e.lifts === 3) {
        Q.play('lava-hiss')
        Q.toast('The lid grinds up and the fire breathes out beneath it.', 3)
        if (ventsOpen() === 3) {
          Q.flag('volcano:gate_open', true)
          for (const g of Q.all('slag-gate')) Q.remove(g)
          Q.play('slag-gate')
          Q.toast('The lava runs off down the channel. The Slag Gate grinds open.', 5)
        }
      } else Q.toast('The lid lifts a little, and the chain grinds (' + e.lifts + '/3).', 2.5)
    },
    draw(e) {
      Q.shadow(e, 26)
      Q.drawOn(e, LID[e.lifts])
      Q.text(String(e.number), Math.round(e.x + 12), Math.round(e.y + 1), Q.palette.y)
      if (e.lifts >= 3) {
        Q.glow(e.x + 15, e.y + 18, 56, Q.palette.o, 0.26 + Math.sin(Q.time * 3 + e.number) * 0.05)
      }
    },
  })

  // --- the Slag Gate: a wall of cooled lava, shut until the vents are open. ---
  const GATE = Q.paint(32, 44, p => {
    p.rect(0, 0, 32, 44, 'k')
    p.rect(1, 1, 30, 42, 'D')
    for (let y = 2; y < 42; y += 8) {
      p.rect(1, y, 30, 6, 'd')
      p.line(1, y, 30, y, 's')
      for (const x of (y / 8) % 2 ? [7, 21] : [14, 27]) p.line(x, y + 1, x, y + 5, 'D')
    }
    p.rect(1, 1, 30, 2, 's')
    p.line(6, 20, 26, 20, 'k'); p.line(6, 23, 26, 23, 'k')
    p.outline('k')
  })
  Q.entity('slag-gate', {
    w: 32, h: 32, solid: true,
    init(e) { if (Q.flag('volcano:gate_open')) Q.remove(e) },
    interact() {
      Q.say(['A wall of cooled lava, glazed black and still warm at its heart.', 'Three iron lids hold back the fire in the hall below. Heave each of them up, three times, and the lava will run off and this gate will grind open.'])
    },
    draw(e) { Q.drawOn(e, GATE) },
  })

  // --- cinder motes: embers that drift up off the floor and sting. ---
  // Face one and press Space or J to fan it out.
  const MOTE = [0, 1, 2].map(i => Q.paint(10, 10, p => {
    p.ellipse(5, 6 - i, 3, 3, 'o')
    p.dot(4, 4 - i, 'y'); p.dot(6, 5 - i, 'r')
  }))
  Q.entity('cinder-mote', {
    w: 10, h: 10,
    init(e) { e.t = Q.time; e.dx = e.speed || 18 },
    update(e, dt) {
      e.t += dt
      const nx = e.x + Math.sin(e.t * 0.8) * e.dx * dt
      if (!Q.blocked(nx, e.y, e.w, e.h, e)) e.x = nx
      else e.dx = -e.dx
      const ny = e.y + Math.cos(e.t * 0.6 + 1) * 14 * dt
      if (!Q.blocked(e.x, ny, e.w, e.h, e)) e.y = ny
      if (Q.overlap(e, Q.hero) && Q.mode === 'play') Q.hurt(1, e)
    },
    hit(e) { Q.remove(e); Q.play('lava-hiss'); Q.toast('The mote scatters into grey ash.', 2) },
    draw(e) {
      Q.glow(e.x + 5, e.y + 5, 20, Q.palette.o, 0.2)
      Q.draw(MOTE[Math.floor(Q.time * 8 + e.x) % 3], Math.round(e.x), Math.round(e.y))
    },
  })

  // Facing a mote and pressing Space or J fans its fire out.
  Q.on('act', () => {
    const hero = Q.hero
    for (const m of Q.all('cinder-mote')) {
      if (Math.abs(m.x - hero.x) < 34 && Math.abs(m.y - hero.y) < 34) {
        Q.strike({ x: hero.x - 14, y: hero.y - 12, w: hero.w + 28, h: hero.h + 24 }, 1, hero)
        Q.play('lava-hiss')
        return true
      }
    }
    return false
  })

  // --- the deep is hot: a red pulse over the rock, and ash on the air. ---
  Q.on('draw', () => {
    if (Q.here.grid !== 'volcano') return
    Q.ctx.fillStyle = Q.palette.r
    Q.ctx.globalAlpha = 0.07 + Math.sin(Q.time * 1.4) * 0.02
    Q.ctx.fillRect(0, 0, Q.W, Q.ROWS * Q.TILE)
    Q.ctx.globalAlpha = 0.14
    Q.ctx.fillStyle = Q.palette.s
    for (let i = 0; i < 14; i++) {
      const x = (i * 71 + Math.floor(Q.time * 9)) % (Q.W + 40) - 20
      const y = (i * 53) % (Q.ROWS * Q.TILE)
      Q.ctx.fillRect(x, y, 2, 1)
      Q.ctx.fillRect(x + 6, y + 3, 1, 1)
    }
    Q.ctx.globalAlpha = 1
  })
})()