// Starglass Tower: light three lanterns to reach the empty observatory.
(() => {
  Q.dungeon('starglass', { name: 'Starglass Tower' })

  const floor = seed => Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'd')
    p.rect(1, 1, 30, 30, 'D')
    p.line(2, 2, 29, 2, 's'); p.line(2, 3, 2, 28, 'd')
    p.dot(6 + seed, 11, 'd'); p.dot(22, 20 + seed, 'd')
    p.line(24, 26, 28, 26, 'k')
  })
  const FLOOR = [floor(0), floor(3), floor(6)]
  Q.tile('_', { name: 'slate tiles', variants: FLOOR }, 'starglass')
  Q.tile('X', {
    name: 'tower wall', solid: true,
    sprite: Q.paint(32, 32, p => {
      p.rect(0, 0, 32, 32, 'D')
      for (const y of [0, 10, 20]) {
        p.rect(1, y + 1, 30, 8, 'd'); p.line(1, y + 1, 30, y + 1, 's')
        p.line(y === 10 ? 9 : 22, y + 2, y === 10 ? 9 : 22, y + 8, 'D')
      }
      p.rect(0, 30, 32, 2, 'k')
    }),
  }, 'starglass')
  Q.tile('^', {
    name: 'tower stairs',
    sprite: Q.paint(32, 32, p => {
      p.rect(0, 0, 32, 32, 'k')
      for (let i = 0; i < 4; i++) {
        p.rect(3 + i * 2, 2 + i * 7, 26 - i * 4, 6, 'd')
        p.rect(3 + i * 2, 2 + i * 7, 26 - i * 4, 2, 's')
      }
      p.outline('k')
    }),
  }, 'starglass')
  Q.tile('*', {
    name: 'open sky window', solid: true,
    draw(x, y, tx, ty) {
      const p = Q.ctx
      p.fillStyle = Q.palette.k; p.fillRect(x, y, 32, 32)
      p.fillStyle = Q.palette.n; p.fillRect(x + 3, y + 3, 26, 26)
      p.fillStyle = Q.palette.a
      p.fillRect(x + 7, y + 9, 2, 2); p.fillRect(x + 23, y + 19, 1, 1)
      if (Math.sin(Q.time * 2 + tx + ty) > 0) {
        p.fillStyle = Q.palette.w; p.fillRect(x + 18, y + 6, 1, 3)
        p.fillRect(x + 17, y + 7, 3, 1)
      }
      p.fillStyle = Q.palette.s; p.fillRect(x + 1, y + 30, 30, 2)
    },
  }, 'starglass')

  const lamp = lit => Q.paint(32, 44, p => {
    p.rect(9, 37, 14, 5, 'd'); p.rect(11, 37, 10, 2, 's')
    p.rect(14, 24, 4, 14, 'h'); p.rect(16, 24, 2, 14, 'U')
    p.rect(7, 8, 18, 19, 'U')
    p.rect(9, 10, 14, 14, lit ? 'y' : 'n')
    p.rect(17, 11, 5, 13, lit ? 'o' : 'D')
    p.rect(11, 12, 3, 9, lit ? 'w' : 'd')
    p.poly([[5, 8], [16, 1], [27, 8]], 'h')
    p.line(6, 8, 26, 8, 'y'); p.rect(6, 25, 20, 3, 'h')
    p.outline('k')
  })
  const LAMPS = [lamp(false), lamp(true)]
  Q.entity('star-lantern', {
    w: 20, h: 16, solid: true,
    interact(e) {
      const count = Q.flag('starglass:lamps') || 0
      if (count === 3 || e.number <= count) {
        Q.toast('This lantern is already shining.'); return
      }
      if (e.number !== count + 1) {
        Q.toast('The next lantern is number ' + (count + 1) + '.'); return
      }
      Q.flag('starglass:lamps', e.number)
      Q.beep({ wave: 'triangle', freq: 330 + e.number * 110, to: 660 + e.number * 110, dur: 0.3, vol: 0.08 })
      if (e.number === 3) {
        for (const gate of Q.all('star-gate')) Q.remove(gate)
        Q.toast('Three lights! The stair gate slides open.', 4)
      } else Q.toast('Lantern ' + e.number + ' glows. Find the next number.')
    },
    draw(e) {
      const lit = (Q.flag('starglass:lamps') || 0) >= e.number
      Q.shadow(e, 25); Q.drawOn(e, LAMPS[lit ? 1 : 0])
      Q.text(String(e.number), Math.round(e.x + 8), Math.round(e.y + 4), Q.palette.y)
      if (lit) Q.glow(e.x + 10, e.y - 16, 58, Q.palette.y, 0.2)
    },
  })
  const GATE = Q.paint(32, 40, p => {
    p.rect(1, 1, 30, 38, 'D')
    p.rect(4, 5, 24, 29, 'k')
    for (const x of [6, 14, 22]) {
      p.rect(x, 4, 3, 32, 'h'); p.rect(x, 4, 1, 32, 'y')
    }
    p.rect(2, 1, 28, 3, 's'); p.rect(2, 35, 28, 3, 'd')
    p.outline('k')
  })
  Q.entity('star-gate', {
    w: 32, h: 32, solid: true,
    init(e) { if (Q.flag('starglass:lamps') === 3) Q.remove(e) },
    interact() { Q.say('Three dark lanterns hold this gate shut. Light them in number order with Space or J.') },
    draw(e) { Q.drawOn(e, GATE) },
  })

  const TELESCOPE = Q.paint(56, 52, p => {
    p.line(27, 28, 14, 49, 'U'); p.line(28, 28, 41, 49, 'U')
    p.line(28, 28, 28, 50, 'h'); p.line(27, 30, 15, 48, 'h')
    p.circle(28, 27, 5, 'd'); p.circle(27, 26, 3, 's')
    p.poly([[8, 20], [37, 3], [47, 15], [16, 31]], 'h')
    p.poly([[13, 26], [43, 10], [47, 15], [16, 31]], 'u')
    p.line(10, 20, 37, 5, 'y')
    p.poly([[36, 3], [40, 1], [51, 14], [46, 17]], 'd')
    p.poly([[39, 4], [41, 3], [48, 12], [46, 13]], 'a')
    p.rect(5, 25, 9, 5, 'D'); p.rect(5, 25, 8, 1, 's')
    p.outline('k')
  })
  Q.entity('star-telescope', {
    w: 36, h: 18, solid: true,
    interact() {
      Q.say(['Through the brass telescope, the stars look like little lanterns. Beyond them, the mist curls around an unseen shore.', 'A spare chair waits nearby. Whoever the mist brings here next will have a clear view of the sky.'])
    },
    draw(e) { Q.shadow(e, 48); Q.drawOn(e, TELESCOPE) },
  })

  const CHAIR = Q.paint(30, 38, p => {
    p.rect(5, 2, 20, 23, 'u'); p.rect(7, 4, 16, 18, 'h')
    p.rect(10, 7, 10, 12, 'n'); p.rect(11, 8, 7, 9, 'b')
    p.rect(4, 26, 4, 10, 'u'); p.rect(22, 26, 4, 10, 'U')
    p.rect(3, 22, 24, 7, 'n'); p.rect(4, 22, 22, 3, 'b')
    p.line(5, 22, 23, 22, 'c'); p.rect(3, 29, 24, 2, 'h')
    p.dot(14, 11, 'y'); p.dot(15, 10, 'y'); p.dot(16, 11, 'y')
    p.outline('k')
  })
  Q.entity('star-chair', {
    w: 22, h: 14, solid: true,
    interact() { Q.say('An empty chair with a star sewn into its blue cushion. The keeper left it facing the telescope.') },
    draw(e) { Q.shadow(e, 29); Q.drawOn(e, CHAIR) },
  })

  // The facade occupies three columns; its centre threshold is walkable.
  Q.tile('B', { name: 'tower foundations', solid: true, variants: Q.tiles['.'].variants })
  Q.tile('A', {
    name: 'tower threshold',
    sprite: Q.paint(32, 32, p => {
      p.rect(0, 0, 32, 32, 'D')
      for (const y of [14, 22, 30]) {
        p.rect(2, y, 28, 2, 's'); p.rect(2, y + 2, 28, 4, 'd')
      }
    }),
  })
  const TOWER = Q.paint(96, 128, p => {
    p.rect(11, 44, 74, 82, 'd'); p.rect(62, 44, 23, 82, 'D')
    p.rect(13, 44, 7, 80, 's')
    for (const y of [58, 74, 90, 106, 122]) {
      p.line(12, y, 83, y, 'D'); p.line(13, y + 1, 61, y + 1, 's')
    }
    p.ellipse(48, 44, 42, 6, 'k')
    p.ellipse(48, 36, 39, 31, 'n')
    p.ellipse(39, 29, 26, 21, 'b', 'n')
    p.ellipse(31, 23, 13, 11, 'c', 'b')
    p.rect(7, 36, 82, 12, 'n'); p.rect(7, 44, 82, 4, 'h')
    p.line(9, 44, 87, 44, 'y')
    p.line(48, 6, 48, 42, 'd'); p.line(47, 6, 47, 42, 's')
    p.rect(46, 0, 4, 6, 'h'); p.dot(47, 0, 'y')
    for (const x of [26, 62]) {
      p.rect(x, 59, 9, 18, 'k'); p.rect(x + 2, 61, 5, 14, 'a')
      p.rect(x + 2, 69, 5, 2, 'd')
    }
    p.ellipse(48, 101, 12, 14, 'U'); p.rect(36, 101, 24, 25, 'U')
    p.ellipse(48, 102, 9, 12, 'k'); p.rect(39, 102, 18, 24, 'k')
    p.rect(37, 106, 2, 20, 'h'); p.rect(57, 106, 2, 20, 'D')
    p.outline('k')
  })
  Q.on('draw', () => {
    if (Q.here.key === '1_0') Q.draw(TOWER, 320, 32)
    if (Q.here.grid !== 'starglass') return
    for (const [x, y] of [[80, 48], [240, 48], [400, 48]]) {
      Q.glow(x, y, 60, Q.palette.a, 0.12)
    }
  })
})()
