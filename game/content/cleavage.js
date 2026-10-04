// The Endless Quest: Hauy's cleavage table, in the Chamber of Echoes. The
// specimen of Iceland spar stands on it, and a mirror swings above. Press
// Space or J when the mirror lies parallel to the natural face of the
// crystal: it splits cleanly, as a crystal splits. Strike it off the angle
// and it shatters. Three clean cleavings free the fundamental rhombohedron,
// and you have gained a heart.
(() => {
  const W = 512, H = 448
  const GOOD = 0.13          // how close the mirror must lie to the true plane
  const NEEDED = 3

  Q.sfx('cleave-good', [{ wave: 'triangle', freq: 880, to: 1760, dur: 0.18, vol: 0.09 }, { wave: 'sine', freq: 2640, dur: 0.22, vol: 0.04, delay: 0.1 }])
  Q.sfx('cleave-bad', [{ wave: 'square', freq: 260, to: 90, dur: 0.22, vol: 0.06 }, { wave: 'square', freq: 150, to: 70, dur: 0.2, vol: 0.05, delay: 0.08 }])

  // The table: a slab of dark wood with a small anvil of iron.
  const TABLE = Q.paint(36, 34, p => {
    p.rect(2, 22, 32, 4, 'U')
    p.rect(2, 26, 32, 6, 'u'); p.rect(2, 26, 32, 2, 'h')
    p.rect(4, 32, 4, 2, 'U'); p.rect(28, 32, 4, 2, 'U')
    p.rect(8, 16, 20, 6, 'D')
    p.rect(9, 17, 18, 5, 'd')
    p.rect(11, 18, 14, 4, 's')
    p.outline('k')
  })

  // A rhombohedron of Iceland spar, drawn at `size` pixels across.
  const spar = size => Q.paint(size, size, p => {
    const c = size / 2
    p.poly([[c, 1], [size - 1, c * 0.8], [c * 0.8, size - 2], [1, c * 1.2]], 's')
    p.poly([[c, 1], [c * 0.62, c * 1.1], [c * 0.7, size - 3], [c, c * 0.85]], 'w', 's')
    p.line(c, 1, c * 0.8, size - 2, 'k', ['s', 'w'])
    p.line(size - 1, c * 0.8, c * 0.8, size - 2, 'k', 's')
    p.line(c, 1, size - 1, c * 0.8, 'a', ['s', 'w'])
    p.outline('k')
  })
  const SPARS = [0, 1, 2, 3].map(n => spar(116 - n * 26))

  Q.entity('cleavage-table', {
    w: 30, h: 12, solid: true,
    interact() {
      const hauy = Q.figures.find(f => f.name === 'Rene Just Hauy')
      if (!hauy || !Q.met(hauy)) {
        Q.say([
          'A slab of dark wood stands in the singing quiet, an anvil of iron set in its top, and a polished mirror swings above it on a brass arm.',
          'A pale crystal rests on the anvil. It is shaped like a leaning brick, and one of its faces catches the light perfectly flat.',
          'A label in a careful hand reads: "Iceland spar. It splits of itself; help it not." Whoever wrote this is close.',
        ])
        return
      }
      const first = !Q.flag('cleave:reward')
      Q.ask(first
        ? 'Hauy\'s spar is on the anvil, and his mirror is swinging. Set it parallel to the natural face and the crystal will part along it, as it always does.'
        : 'Hauy\'s spar waits on the anvil. His mirror is still swinging.',
      ['Take the hammer', 'Leave it be'], i => { if (i === 0) start() })
    },
    draw(e) {
      Q.shadow(e, 30)
      Q.drawOn(e, TABLE)
      Q.draw(spar(14), Math.round(e.x + e.w / 2 - 7), Math.round(e.y - 2))
      Q.glow(e.x + e.w / 2, e.y + 2, 30, Q.palette.a, 0.16 + Math.sin(Q.time * 2) * 0.03)
    },
  })

  // The table stands in the Chamber of Echoes, beside Hauy.
  Q.on('enter', room => {
    if (room.key !== 'crystal:0_-1') return
    Q.spawn('cleavage-table', 10 * Q.TILE + (Q.TILE - 30) / 2, 7 * Q.TILE + (Q.TILE - 12) / 2)
  })

  let game = null
  const tiltNow = () => Math.sin(game.t * 1.35) * 0.9 + Math.sin(game.t * 2.7) * 0.1

  const start = () => {
    game = { t: 0, splits: 0, tries: 3, note: 'The mirror swings. Strike when it lies flat with the face.', flash: 0, bad: 0 }
    Q.overlay({ update: update, draw: drawTable })
  }

  const finish = () => {
    game = null
    if (!Q.flag('cleave:reward')) {
      Q.flag('cleave:reward', true)
      Q.state.maxHp += 2
      Q.heal(Q.state.maxHp)
      Q.play('found')
      Q.say([
        'The last face parts, and in your palm lies a little leaning brick of spar: the integrant molecule, the smallest piece that can still be called calcite.',
        'A warmth runs through you, and the cavern hums in tune with you. You have gained a heart!',
        '"One molecule of every species," Hauy\'s voice comes from somewhere behind you. "One fixed form. Divide them all, and you have the whole of nature in your hand."',
      ])
    } else {
      Q.flag('cleave:cleavages', (Q.flag('cleave:cleavages') || 0) + 1)
      Q.say(['The spar parts along its plane, as it has parted for every man who ever loved a stone.'])
    }
  }

  function update(dt) {
    const g = game
    if (Q.pressed('alt')) { game = null; Q.toast('You step back from the anvil.'); return false }
    g.t += dt
    g.flash = Math.max(0, g.flash - dt * 3)
    g.bad = Math.max(0, g.bad - dt * 3)
    if (Q.pressed('act')) {
      if (Math.abs(tiltNow()) <= GOOD) {
        g.splits++
        g.flash = 1
        Q.play('cleave-good')
        if (g.splits >= NEEDED) { finish(); return false }
        g.note = 'A clean face, smooth as a mirror. ' + (NEEDED - g.splits) + ' more to free the molecule.'
      } else {
        g.tries--
        g.bad = 1
        g.splits = 0
        Q.play('cleave-bad')
        if (g.tries <= 0) {
          g.tries = 3
          g.note = 'Shattered. Hauy says nothing, but hands you another specimen.'
        } else {
          g.note = 'It breaks ragged, off the plane. Try to set the mirror true. (' + g.tries + ' left)'
        }
      }
    }
    return true
  }

  function drawTable() {
    const g = Q.ctx, c = game
    const tilt = tiltNow()
    const aligned = Math.abs(tilt) <= GOOD
    g.fillStyle = Q.palette.k; g.globalAlpha = 0.94; g.fillRect(0, 0, W, H); g.globalAlpha = 1

    // The crystal, in the middle, with the mirror sweeping over it.
    const cx = 256, cy = 232
    const size = 116 - c.splits * 26
    Q.draw(SPARS[c.splits], Math.round(cx - size / 2), Math.round(cy - size / 2))
    Q.glow(cx, cy, 90 + c.flash * 50, aligned ? Q.palette.a : Q.palette.s, 0.14 + c.flash * 0.2)

    // The true plane, level across the crystal: catch it when the mirror matches.
    g.fillStyle = Q.palette.a; g.globalAlpha = aligned ? 0.55 + Math.sin(Q.time * 12) * 0.2 : 0.18
    g.fillRect(cx - size, cy - 1, size * 2, 2)
    g.globalAlpha = 1
    // The mirror above, turned to the tilt.
    const half = 74
    const dx = Math.sin(tilt) * half * 2
    g.strokeStyle = aligned ? Q.palette.a : Q.palette.s
    g.lineWidth = 3
    g.beginPath(); g.moveTo(cx - half + dx, cy - 96); g.lineTo(cx + half + dx, cy - 96); g.stroke()
    g.strokeStyle = Q.palette.k; g.lineWidth = 1
    g.beginPath(); g.moveTo(cx - half + dx, cy - 94); g.lineTo(cx + half + dx, cy - 94); g.stroke()
    g.fillStyle = Q.palette.u; g.fillRect(cx - 2, cy - 130, 4, 36)
    g.fillStyle = Q.palette.U; g.fillRect(cx - 10, cy - 136, 20, 8)

    // The gauge: the mirror's tilt, and the narrow band of truth.
    const gx = 116, gy = 372, gw = 280
    g.fillStyle = Q.palette.D; g.fillRect(gx, gy, gw, 14)
    g.fillStyle = Q.palette.k; g.fillRect(gx, gy + 6, gw, 2)
    g.fillStyle = aligned ? Q.palette.a : Q.palette.t
    g.fillRect(gx + gw / 2 - GOOD * gw / 2 - 1, gy - 3, GOOD * gw + 2, 20)
    g.fillStyle = Q.palette.w
    g.fillRect(Math.round(gx + gw / 2 + (tilt / 1.1) * gw / 2) - 2, gy - 6, 4, 26)

    const lines = [
      "HAUY'S CLEAVAGE TABLE",
      'Cleaved ' + c.splits + ' of ' + NEEDED + ' faces   -   specimens left: ' + c.tries,
      '',
      aligned ? 'Now. The mirror lies true with the face.' : 'Watch the mirror, and strike when it lies level.',
      'Press Space or J to strike.   Press K to step back.',
    ]
    lines.forEach((line, i) => Q.text(line, 28, 44 + i * 22, i === 3 && aligned ? Q.palette.a : Q.palette.w, 1, Q.palette.k))
    const note = c.bad > 0.3 ? c.note : (aligned ? 'The spar waits for the hammer.' : c.note)
    Q.text(note, 28, H - 46, c.bad > 0.3 ? Q.palette.r : Q.palette.s, 1, Q.palette.k)
  }
})()