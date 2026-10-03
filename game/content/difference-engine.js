// The Endless Quest: the Difference Engine, built from Babbage's designs in
// the Master Atelier of the Clockwork Vault. Once Charles Babbage has been
// found, turn its crank: it computes a table of squares by the method of
// differences, and the first table earns the traveller an extra heart.
(() => {
  const W = 512, H = 448
  const TABLE = [[0, 0, null, null], [1, 1, 1, null], [2, 4, 3, 2], [3, 9, 5, 2], [4, 16, 7, 2], [5, 25, 9, 2]]
  const HEADS = [['n', 150], ['n^2', 226], ['1st', 302], ['2nd', 368]]

  Q.sfx('engine-crank', [{ wave: 'triangle', freq: 120, to: 240, dur: 0.18, vol: 0.08 }, { wave: 'square', freq: 90, to: 90, dur: 0.05, vol: 0.04, delay: 0.12 }])
  Q.sfx('engine-bell', [{ wave: 'triangle', freq: 659, to: 880, dur: 0.16, vol: 0.1 }, { wave: 'triangle', freq: 880, to: 1175, dur: 0.22, vol: 0.1, delay: 0.14 }])

  const ENGINE = Q.paint(48, 46, p => {
    // The cabinet: dark brass with a lighter face and a plank top.
    p.rect(1, 7, 46, 37, 'U')
    p.rect(3, 9, 42, 33, 'u')
    p.line(3, 9, 44, 9, 'h'); p.line(3, 40, 44, 40, 'k')
    p.rect(0, 5, 48, 4, 'D'); p.line(0, 5, 47, 5, 's')
    p.rect(40, 36, 7, 4, 'h')
    // Three columns of toothed brass wheels.
    for (const cx of [11, 21, 31]) {
      p.rect(cx - 4, 12, 8, 25, 'D')
      for (let cy = 15; cy <= 34; cy += 6) {
        for (const [dx, dy] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) p.dot(cx + dx, cy + dy, 'h')
        p.circle(cx, cy, 3, 'h'); p.circle(cx, cy, 2, 'y'); p.dot(cx, cy, 'd')
      }
    }
    // A crank on the right, and a little output plate at the foot.
    p.rect(44, 15, 3, 3, 'h'); p.rect(44, 15, 2, 12, 'h')
    p.circle(45, 14, 3, 's'); p.dot(45, 14, 'y')
    p.rect(7, 41, 34, 3, 's'); p.line(7, 41, 40, 41, 'w')
    for (let x = 9; x < 40; x += 5) p.dot(x, 42, 'd')
    p.outline('k')
  })

  Q.entity('difference-engine', {
    w: 40, h: 16, solid: true,
    interact() {
      const babbage = Q.figures.find(f => f.name === 'Charles Babbage')
      if (!babbage || !Q.met(babbage)) {
        Q.say([
          'A tall brass calculating machine stands silent, its columns of toothed wheels still.',
          'A small plate is engraved: "Difference Engine No. 1, after the designs of C. Babbage. Awaiting its author\'s hand."',
        ])
        return
      }
      const first = !Q.flag('engine:reward')
      Q.ask(first
        ? 'The Difference Engine hums softly at your approach, eager to turn.'
        : 'The Difference Engine waits, ready to compute again.',
      ['Turn the crank', 'Leave it be'], i => { if (i === 0) startEngine() })
    },
    draw(e) {
      Q.shadow(e, 46)
      Q.drawOn(e, ENGINE)
      const busy = run ? 0.3 : 0.14
      Q.glow(e.x + e.w / 2, e.y + e.h - 20, 40, Q.palette.y, busy + 0.05 * Math.sin(Q.time * 3))
    },
  })

  // Spawn the machine in the Master Atelier, beside the drafting bench.
  Q.on('enter', room => {
    if (room.key !== 'clockwork:0_-1') return
    Q.spawn('difference-engine', 10 * Q.TILE + (Q.TILE - 40) / 2, 5 * Q.TILE + (Q.TILE - 16) / 2)
  })

  // The computation: a full screen over the paused game.
  let run = null
  function startEngine() {
    run = { t: 0, shown: 0 }
    Q.overlay({ update: engineUpdate, draw: engineDraw })
    Q.play('engine-crank')
  }
  function engineUpdate(dt) {
    run.t += dt
    const shown = Math.min(TABLE.length, Math.floor(run.t / 0.45) + 1)
    if (shown !== run.shown) { run.shown = shown; Q.play('gear_click') }
    if (Q.pressed('alt')) { run = null; return false }
    if (run.t > 0.45 * TABLE.length + 1) { finishEngine(); return false }
  }
  function finishEngine() {
    run = null
    if (!Q.flag('engine:reward')) {
      Q.flag('engine:reward', true)
      Q.state.maxHp += 2
      Q.heal(Q.state.maxHp)
      Q.play('engine-bell')
      Q.play('found')
      Q.say([
        'Row upon row, the wheels carry the differences forward: 0, 1, 4, 9, 16, 25. A whole table of squares, computed without a single hand.',
        'Babbage beams at the turning brass. A warm light fills you: you have gained a heart!',
      ])
    } else {
      Q.say('The engine turns again, and the table marches on. Numbers without end.')
    }
  }
  const gear = (g, cx, cy, rad, phase, color) => {
    g.strokeStyle = color; g.lineWidth = 2
    g.beginPath(); g.arc(cx, cy, rad, 0, Math.PI * 2); g.stroke()
    for (let i = 0; i < 8; i++) {
      const a = phase + (i * Math.PI) / 4
      g.beginPath()
      g.moveTo(cx + Math.cos(a) * (rad - 2), cy + Math.sin(a) * (rad - 2))
      g.lineTo(cx + Math.cos(a) * (rad + 3), cy + Math.sin(a) * (rad + 3))
      g.stroke()
    }
  }
  function engineDraw() {
    const g = Q.ctx
    g.fillStyle = '#1a1c2c'
    g.globalAlpha = 0.9
    g.fillRect(0, 0, W, H)
    g.globalAlpha = 1
    // The brass panel.
    g.fillStyle = Q.palette.U; g.fillRect(72, 48, 368, 352)
    g.fillStyle = Q.palette.u; g.fillRect(78, 54, 356, 340)
    g.fillStyle = Q.palette.D; g.fillRect(86, 62, 340, 324)
    // Gears turning in the corners.
    gear(g, 150, 150, 26, Q.time * 1.5, Q.palette.h)
    gear(g, 362, 150, 22, -Q.time * 1.9, Q.palette.h)
    gear(g, 150, 330, 20, -Q.time * 2.2, Q.palette.y)
    gear(g, 362, 330, 24, Q.time * 1.3, Q.palette.y)
    Q.glow(256, 210, 190, Q.palette.y, 0.1 + 0.04 * Math.sin(Q.time * 3))
    Q.text('THE DIFFERENCE ENGINE', 256 - Q.textWidth('THE DIFFERENCE ENGINE', 2) / 2, 74, Q.palette.y, 2, Q.palette.k)
    const sub = 'The method of differences: each row is built from the one before.'
    Q.text(sub, 256 - Q.textWidth(sub, 1) / 2, 98, Q.palette.s, 1, Q.palette.k)
    for (const [h, x] of HEADS) Q.text(h, x - Q.textWidth(h, 2) / 2, 128, Q.palette.w, 2, Q.palette.k)
    const shown = run ? run.shown : TABLE.length
    TABLE.forEach((row, i) => {
      if (i >= shown) return
      const y = 164 + i * 30
      const current = run && i === shown - 1
      if (current) { g.fillStyle = Q.palette.y; g.globalAlpha = 0.14; g.fillRect(96, y - 5, 320, 24); g.globalAlpha = 1 }
      const col = current ? Q.palette.y : Q.palette.w
      HEADS.forEach(([, x], c) => {
        if (row[c] == null) return
        const s = String(row[c])
        Q.text(s, x - Q.textWidth(s, 2) / 2, y, col, 2, Q.palette.k)
      })
    })
    if (run) Q.text('K: stop', 256 - Q.textWidth('K: stop', 1) / 2, H - 20, Q.palette.s, 1, Q.palette.k)
  }
})()
