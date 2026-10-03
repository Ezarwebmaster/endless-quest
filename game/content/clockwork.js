// The Endless Quest: The Clockwork Vault, a subterranean sanctum of brass,
// steam, and ancient interlocking gears.
// Three regulator levers unlock the gate to the Master Atelier.
// Rooms: content/rooms/clockwork/.
(() => {
  Q.dungeon('clockwork', { name: 'The Clockwork Vault' })

  // --- Sound Effects ---
  Q.sfx('gear_click', [
    { wave: 'triangle', freq: 440, to: 880, dur: 0.05, vol: 0.1 },
    { wave: 'sine', freq: 660, to: 1320, dur: 0.08, vol: 0.08, delay: 0.04 },
  ])
  Q.sfx('steam_vent', [
    { wave: 'triangle', freq: 280, to: 70, dur: 0.22, vol: 0.08 },
    { wave: 'sine', freq: 200, to: 50, dur: 0.3, vol: 0.06, delay: 0.05 },
  ])
  Q.sfx('vault_unlock', [
    { wave: 'triangle', freq: 160, to: 90, dur: 0.15, vol: 0.12 },
    { wave: 'triangle', freq: 330, to: 440, dur: 0.12, vol: 0.1, delay: 0.12 },
    { wave: 'triangle', freq: 440, to: 554, dur: 0.14, vol: 0.1, delay: 0.22 },
    { wave: 'triangle', freq: 554, to: 659, dur: 0.16, vol: 0.1, delay: 0.32 },
    { wave: 'triangle', freq: 659, to: 880, dur: 0.28, vol: 0.12, delay: 0.44 },
  ])

  // --- World Facade Tiles (for room 0_-1) ---
  Q.tile('V', { name: 'vault cliff foundations', solid: true, variants: Q.tiles['.'].variants })
  Q.tile('E', {
    name: 'vault threshold',
    sprite: Q.paint(32, 32, p => {
      p.rect(0, 0, 32, 32, 'u')
      p.rect(2, 2, 28, 28, 'U')
      for (const y of [8, 16, 24]) {
        p.line(4, y, 27, y, 'h')
        p.dot(4, y, 'y'); p.dot(27, y, 'y')
      }
      p.outline('k')
    }),
  })

  // --- Clockwork Dungeon Tiles ---
  const bronzeFloor = seed => Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'u')
    p.rect(1, 1, 30, 30, 'U')
    p.line(2, 2, 29, 2, 'h'); p.line(2, 3, 2, 28, 'h')
    p.line(29, 3, 29, 29, 'k'); p.line(2, 29, 29, 29, 'k')
    // Corner rivets
    p.dot(4, 4, 'y'); p.dot(27, 4, 'y'); p.dot(4, 27, 'y'); p.dot(27, 27, 'y')
    if (seed === 1) {
      p.circle(16, 16, 7, 'u'); p.circle(16, 16, 5, 'U'); p.circle(16, 16, 2, 'h')
      for (const [dx, dy] of [[0, -8], [0, 8], [-8, 0], [8, 0]]) {
        p.rect(16 + dx - 1, 16 + dy - 1, 3, 3, 'u')
      }
    } else if (seed === 2) {
      p.line(8, 8, 24, 24, 'u'); p.line(8, 24, 24, 8, 'u')
    }
  })
  const BRONZE_FLOOR = [bronzeFloor(0), bronzeFloor(1), bronzeFloor(2)]
  Q.tile('_', { name: 'bronze floor', variants: BRONZE_FLOOR }, 'clockwork')

  const VAULT_WALL = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'D')
    for (const y of [0, 10, 20]) {
      p.rect(0, y + 1, 32, 8, 'd')
      p.line(0, y + 1, 31, y + 1, 's')
      p.line(0, y + 8, 31, y + 8, 'k')
      p.dot(6, y + 4, 's'); p.dot(7, y + 4, 'k')
      p.dot(22, y + 4, 's'); p.dot(23, y + 4, 'k')
    }
    p.rect(2, 0, 3, 32, 'u'); p.line(3, 0, 3, 31, 'h')
    p.rect(0, 30, 32, 2, 'k')
  })
  Q.tile('X', {
    name: 'vault wall',
    solid: true,
    sprite: VAULT_WALL,
  }, 'clockwork')

  const gearFrame = angleOffset => Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'D')
    p.rect(0, 0, 32, 3, 'd'); p.line(0, 0, 31, 0, 's')
    p.rect(0, 29, 32, 3, 'k')
    p.rect(4, 4, 24, 24, 'k')
    p.rect(5, 5, 22, 22, 'k')
    const cx = 16, cy = 16
    for (let i = 0; i < 8; i++) {
      const a = angleOffset + (i * Math.PI) / 4
      const tx = Math.round(cx + Math.cos(a) * 9)
      const ty = Math.round(cy + Math.sin(a) * 9)
      p.rect(tx - 1, ty - 1, 3, 3, 'h')
      p.dot(tx, ty, 'y')
    }
    p.circle(cx, cy, 7, 'U')
    p.circle(cx, cy, 6, 'h')
    p.circle(cx, cy, 4, 'y')
    p.circle(cx, cy, 2, 'd')
    p.dot(cx, cy, 's')
    p.outline('k')
  })
  const GEAR_FRAMES = [0, 1, 2, 3].map(i => gearFrame((i * Math.PI) / 16))
  Q.tile('G', {
    name: 'wall gear',
    solid: true,
    frames: GEAR_FRAMES,
    fps: 5,
  }, 'clockwork')

  const GRATING = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'u')
    p.rect(2, 2, 28, 28, 'U')
    p.rect(4, 4, 24, 24, 'k')
    for (let y = 6; y < 26; y += 4) {
      p.line(5, y, 26, y, 'h')
      p.line(5, y + 1, 26, y + 1, 'o')
    }
    p.dot(3, 3, 'y'); p.dot(28, 3, 'y'); p.dot(3, 28, 'y'); p.dot(28, 28, 'y')
    p.outline('k')
  })
  Q.tile('*', {
    name: 'steam grating',
    draw(x, y, tx, ty) {
      Q.draw(GRATING, x, y)
      if (Math.sin(Q.time * 3 + tx * 2 + ty * 3) > 0.6) {
        Q.glow(x + 16, y + 16, 24, Q.palette.y, 0.1)
      }
    },
  }, 'clockwork')

  const GEAR_STAIRS = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'k')
    for (let i = 0; i < 4; i++) {
      const y = 2 + i * 7
      p.rect(2 + i * 2, y, 28 - i * 4, 3, 'y')
      p.rect(2 + i * 2, y + 3, 28 - i * 4, 4, 'h')
      p.rect(2 + i * 2, y + 6, 28 - i * 4, 1, 'U')
    }
    p.outline('k')
  })
  Q.tile('^', {
    name: 'gear stairs',
    sprite: GEAR_STAIRS,
  }, 'clockwork')

  const CONDUIT = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'u')
    p.rect(2, 2, 28, 28, 'U')
    for (const x of [10, 18]) {
      p.rect(x, 0, 4, 32, 'u')
      p.line(x + 1, 0, x + 1, 31, 'o')
      p.line(x + 2, 0, x + 2, 31, 'h')
      p.rect(x - 1, 8, 6, 3, 'y')
      p.rect(x - 1, 22, 6, 3, 'y')
    }
    p.outline('k')
  })
  Q.tile('=', {
    name: 'copper conduit',
    sprite: CONDUIT,
  }, 'clockwork')

  // --- Clockwork Entities ---
  const leverSprite = engaged => Q.paint(28, 34, p => {
    p.rect(4, 22, 20, 10, 'U')
    p.rect(6, 24, 16, 7, 'u')
    p.line(4, 22, 23, 22, 'h')
    p.line(4, 31, 23, 31, 'k')
    p.circle(14, 27, 4, 'h')
    p.dot(14, 27, 'y')
    p.circle(14, 18, 3, 'd')
    p.dot(14, 18, 's')
    if (engaged) {
      p.line(14, 18, 22, 12, 's')
      p.line(15, 18, 23, 12, 'd')
      p.circle(23, 11, 3, 'h')
      p.dot(23, 11, 'y')
      p.circle(14, 6, 5, 'y')
      p.circle(14, 6, 3, 'w')
    } else {
      p.line(14, 18, 7, 10, 's')
      p.line(15, 18, 8, 10, 'd')
      p.circle(6, 9, 3, 'h')
      p.dot(6, 9, 'y')
      p.circle(14, 6, 4, 'r')
      p.circle(14, 6, 2, 'p')
    }
    p.outline('k')
  })
  const LEVERS = [leverSprite(false), leverSprite(true)]

  Q.entity('clockwork-lever', {
    w: 20, h: 16, solid: true,
    interact(e) {
      const flagKey = 'clockwork:lever_' + e.number
      if (Q.flag(flagKey)) {
        Q.toast('Regulator gear ' + e.number + ' is already turning smoothly.')
        return
      }
      Q.flag(flagKey, true)
      Q.play('gear_click')
      Q.play('steam_vent')
      const count = [1, 2, 3].filter(n => Q.flag('clockwork:lever_' + n)).length
      if (count === 3) {
        Q.flag('clockwork:gate_open', true)
        for (const gate of Q.all('clockwork-gate')) Q.remove(gate)
        Q.play('vault_unlock')
        Q.toast('All three regulators lock into place! The vault gate grinds open.', 4)
      } else {
        Q.toast('Regulator ' + e.number + ' engaged (' + count + '/3). Steam hisses through the conduits.')
      }
    },
    draw(e) {
      const engaged = !!Q.flag('clockwork:lever_' + e.number)
      Q.shadow(e, 24)
      Q.drawOn(e, LEVERS[engaged ? 1 : 0])
      Q.text(String(e.number), Math.round(e.x + 8), Math.round(e.y + 4), engaged ? Q.palette.y : Q.palette.s)
      if (engaged) {
        Q.glow(e.x + 10, e.y - 12, 36, Q.palette.y, 0.22)
      }
    },
  })

  const GATE = Q.paint(32, 40, p => {
    p.rect(0, 0, 32, 40, 'k')
    p.rect(2, 2, 28, 36, 'U')
    p.rect(4, 4, 24, 32, 'D')
    p.circle(16, 20, 11, 'h')
    p.circle(16, 20, 8, 'y')
    p.circle(16, 20, 4, 'U')
    p.dot(16, 20, 'y')
    p.rect(14, 2, 4, 36, 's')
    p.rect(2, 18, 28, 4, 's')
    p.line(15, 2, 15, 37, 'w')
    p.line(2, 19, 29, 19, 'w')
    p.outline('k')
  })
  Q.entity('clockwork-gate', {
    w: 32, h: 32, solid: true,
    init(e) {
      if (Q.flag('clockwork:gate_open')) Q.remove(e)
    },
    interact() {
      Q.say('A heavy brass vault gate, held shut by three interlocking gear bars. Each regulator lever must be engaged to release the mechanism.')
    },
    draw(e) {
      Q.drawOn(e, GATE)
    },
  })

  const OWL = Q.paint(24, 28, p => {
    p.rect(9, 23, 6, 5, 'U')
    p.rect(4, 26, 16, 2, 'h')
    p.ellipse(12, 15, 8, 10, 'h')
    p.ellipse(12, 16, 6, 8, 'u')
    p.ellipse(12, 17, 4, 5, 'y')
    p.poly([[4, 11], [8, 12], [6, 22], [3, 19]], 'h')
    p.poly([[20, 11], [16, 12], [18, 22], [21, 19]], 'U')
    p.circle(12, 8, 7, 'h')
    p.ellipse(12, 8, 6, 5, 'U')
    p.circle(9, 7, 3, 'a'); p.dot(9, 6, 'w'); p.dot(9, 7, 'k')
    p.circle(15, 7, 3, 'a'); p.dot(15, 6, 'w'); p.dot(15, 7, 'k')
    p.poly([[11, 9], [13, 9], [12, 12]], 'y')
    p.rect(17, 13, 5, 2, 'y')
    p.circle(21, 14, 3, 'y'); p.dot(21, 14, 'k')
    p.outline('k')
  })
  Q.entity('clockwork-owl', {
    w: 20, h: 18, solid: true,
    interact() {
      Q.say([
        'A small brass automaton shaped like an owl. A key slowly turns in its back: click... clack...',
        '"Greetings, traveller," chirps the automaton. "The Master Atelier has been prepared. Blueprint tables, brass calipers, and fine oil."',
        '"We wait for an inventor who understands the rhythm of machines. One day, the mist will guide them here."',
      ])
    },
    draw(e) {
      Q.shadow(e, 22)
      Q.drawOn(e, OWL)
      if (Math.sin(Q.time * 4) > 0.85) {
        Q.ctx.fillStyle = '#f4f4f4'
        Q.ctx.fillRect(Math.round(e.x + 8), Math.round(e.y - 10), 2, 2)
        Q.ctx.fillRect(Math.round(e.x + 14), Math.round(e.y - 10), 2, 2)
      }
    },
  })

  const BENCH = Q.paint(48, 36, p => {
    p.rect(3, 16, 5, 20, 'U')
    p.rect(40, 16, 5, 20, 'U')
    p.rect(3, 31, 42, 3, 'u')
    p.rect(1, 12, 46, 7, 'u')
    p.line(1, 12, 46, 12, 'h')
    p.line(1, 18, 46, 18, 'U')
    p.rect(8, 6, 22, 9, 'w')
    p.rect(9, 7, 20, 7, 'c')
    p.line(12, 9, 26, 9, 'd')
    p.line(12, 11, 23, 11, 'd')
    p.circle(16, 10, 2, 'w')
    p.rect(29, 7, 4, 8, 'y')
    p.line(34, 8, 38, 14, 'y'); p.line(38, 8, 34, 14, 'y')
    p.dot(36, 8, 'w')
    p.rect(38, 4, 6, 8, 'd')
    p.rect(39, 1, 4, 4, 'y'); p.dot(40, 0, 'w')
    p.outline('k')
  })
  Q.entity('clockwork-bench', {
    w: 44, h: 20, solid: true,
    interact() {
      Q.say([
        'A broad drafting table covered in mechanical schematics and brass instruments.',
        'Calculations for escapement gears and differential levers are penned in neat, precise ink. The ink is still fresh.',
      ])
    },
    draw(e) {
      Q.shadow(e, 46)
      Q.drawOn(e, BENCH)
      Q.glow(e.x + 38, e.y - 8, 28, Q.palette.y, 0.25)
    },
  })

  const CHAIR = Q.paint(24, 34, p => {
    p.rect(4, 22, 3, 11, 'U'); p.rect(17, 22, 3, 11, 'U')
    p.line(4, 30, 19, 30, 'u')
    p.rect(3, 17, 18, 6, 'r')
    p.line(3, 17, 20, 17, 'P')
    p.line(3, 22, 20, 22, 'p')
    p.rect(4, 3, 16, 15, 'u')
    p.rect(6, 5, 12, 11, 'r')
    p.dot(5, 5, 'y'); p.dot(18, 5, 'y'); p.dot(5, 14, 'y'); p.dot(18, 14, 'y')
    p.line(4, 2, 19, 2, 'h')
    p.outline('k')
  })
  Q.entity('clockwork-chair', {
    w: 20, h: 14, solid: true,
    interact() {
      Q.say('A high-backed drafting chair with a velvet cushion, pulled up beside the drafting table.')
    },
    draw(e) {
      Q.shadow(e, 22)
      Q.drawOn(e, CHAIR)
    },
  })

  // --- Large Decorative Artwork ---
  const VAULT_FACADE = Q.paint(96, 128, p => {
    p.rect(8, 20, 80, 106, 'd')
    p.rect(12, 24, 72, 102, 'D')
    p.line(8, 20, 87, 20, 's')
    p.line(8, 20, 8, 125, 's')
    for (const y of [38, 56, 74, 92, 110]) {
      p.line(9, y, 86, y, 'D'); p.line(9, y + 1, 86, y + 1, 's')
    }
    p.rect(16, 8, 64, 8, 'u')
    p.line(16, 9, 79, 9, 'o'); p.line(16, 10, 79, 10, 'h')
    p.circle(48, 28, 12, 'h'); p.circle(48, 28, 10, 'y'); p.circle(48, 28, 8, 'w')
    p.line(48, 28, 52, 24, 'r'); p.dot(48, 28, 'k')
    for (const cx of [20, 76]) {
      p.circle(cx, 72, 14, 'U'); p.circle(cx, 72, 12, 'h'); p.circle(cx, 72, 8, 'y'); p.circle(cx, 72, 4, 'D')
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        p.rect(cx + Math.cos(a) * 13 - 1, 72 + Math.sin(a) * 13 - 1, 3, 3, 'h')
      }
    }
    p.ellipse(48, 88, 18, 18, 'h')
    p.rect(30, 88, 36, 40, 'h')
    p.ellipse(48, 89, 15, 16, 'U')
    p.rect(33, 89, 30, 39, 'U')
    p.ellipse(48, 90, 12, 14, 'k')
    p.rect(36, 90, 24, 38, 'k')
    p.line(33, 126, 62, 126, 'h')
    p.outline('k')
  })

  const CHRONOMETER = Q.paint(128, 64, p => {
    p.circle(28, 32, 22, 'U'); p.circle(28, 32, 18, 'u'); p.circle(28, 32, 16, 'D')
    p.circle(100, 32, 22, 'U'); p.circle(100, 32, 18, 'u'); p.circle(100, 32, 16, 'D')
    p.circle(64, 32, 28, 'U'); p.circle(64, 32, 26, 'h'); p.circle(64, 32, 23, 'y')
    p.circle(64, 32, 21, 'D'); p.circle(64, 32, 19, 'n')
    p.dot(64, 15, 'y'); p.dot(64, 49, 'y'); p.dot(47, 32, 'y'); p.dot(81, 32, 'y')
    p.dot(73, 17, 'y'); p.dot(79, 23, 'y'); p.dot(79, 41, 'y'); p.dot(73, 47, 'y')
    p.dot(55, 17, 'y'); p.dot(49, 23, 'y'); p.dot(49, 41, 'y'); p.dot(55, 47, 'y')
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      p.rect(28 + Math.cos(a) * 20 - 1, 32 + Math.sin(a) * 20 - 1, 3, 3, 'h')
      p.rect(100 + Math.cos(a + 0.2) * 20 - 1, 32 + Math.sin(a + 0.2) * 20 - 1, 3, 3, 'h')
    }
    p.rect(48, 29, 6, 6, 'h'); p.rect(74, 29, 6, 6, 'h')
    p.outline('k')
  })

  // Dynamic drawing hooks
  Q.on('draw', () => {
    if (Q.here.key === '0_-1') {
      Q.draw(VAULT_FACADE, 320, 32)
    }
    if (Q.here.key === 'clockwork:0_-1') {
      Q.draw(CHRONOMETER, 192, 8)
      const ctx = Q.ctx
      const cx = 256, cy = 40
      const mAngle = Q.time * 0.4
      ctx.strokeStyle = Q.palette.y
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(mAngle) * 14, cy + Math.sin(mAngle) * 14)
      ctx.stroke()

      const hAngle = Q.time * 0.08
      ctx.strokeStyle = Q.palette.w
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(hAngle) * 9, cy + Math.sin(hAngle) * 9)
      ctx.stroke()

      ctx.fillStyle = Q.palette.y
      ctx.fillRect(cx - 1, cy - 1, 3, 3)

      const pendAngle = Math.sin(Q.time * 2.2) * 0.25
      const pendLen = 22
      const bx = cx + Math.sin(pendAngle) * pendLen
      const by = cy + 24 + Math.cos(pendAngle) * pendLen
      ctx.strokeStyle = Q.palette.h
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx, cy + 24)
      ctx.lineTo(bx, by)
      ctx.stroke()
      ctx.fillStyle = Q.palette.y
      ctx.beginPath()
      ctx.arc(bx, by, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = Q.palette.k
      ctx.stroke()

      Q.glow(256, 40, 60, Q.palette.y, 0.15)
    }
    if (Q.here.grid === 'clockwork') {
      Q.glow(256, 192, 100, Q.palette.y, 0.08)
    }
  })
})()
