// The Endless Quest: Comet Sweeping. Once Caroline Herschel is found in
// Starglass Tower, the brass telescope of the Waiting Observatory lets the
// traveller sweep the night sky as she did. Steer the lens with the arrows
// or WASD, press Space or J when a comet is inside it, and record three to
// earn a new heart. K puts the telescope down.
(() => {
  const NEEDED = 3
  const LENS = 44
  const W = 512, H = 448

  Q.sfx('comet-seen', [880, 1175, 1568].map((freq, i) => ({ wave: 'triangle', freq, dur: 0.12, vol: 0.08, delay: i * 0.07 })))
  Q.sfx('comet-miss', { wave: 'square', freq: 180, to: 120, dur: 0.15, vol: 0.05 })

  // The sky: fixed stars, drawn once as whole pixels.
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const SKY = Q.paint(W, H, p => {
    const r = rng(1750)
    p.rect(0, 0, W, H, 'k')
    p.rect(0, 140, W, 160, 'n', 'k')
    for (let i = 0; i < 150; i++) p.dot(Math.floor(r() * W), Math.floor(r() * H), i % 5 ? 'd' : 's')
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(r() * W), y = Math.floor(r() * H)
      p.dot(x, y, 'w')
      if (i % 4 === 0) { p.dot(x - 1, y, 's'); p.dot(x + 1, y, 's'); p.dot(x, y - 1, 's'); p.dot(x, y + 1, 's') }
    }
  })
  // The lens: a brass ring.
  const RING = Q.paint(LENS * 2 + 6, LENS * 2 + 6, p => {
    const c = LENS + 3
    p.circle(c, c, LENS + 3, 'U'); p.circle(c, c, LENS + 1, 'u'); p.circle(c, c, LENS - 1, 'h')
    p.circle(c, c, LENS - 3, 'k')
    p.line(c - 8, c, c + 8, c, 'd'); p.line(c, c - 8, c, c + 8, 'd')
    p.outline('k')
  })

  let sweep = null
  const newComet = n => {
    const r = rng(300 + n * 97)
    const side = Math.floor(r() * 4)
    const t = 60 + r() * 0.8 * 300
    const from = [[-20, t], [W + 20, t], [t * 1.4, 80], [t * 1.4, H + 20]][side]
    const to = [[W + 20, 440 - t], [-20, 440 - t], [W - t * 1.4, H + 20], [W - t * 1.4, 80]][side]
    const len = Math.hypot(to[0] - from[0], to[1] - from[1])
    const speed = 80 + Math.min(n, 6) * 8
    return { x: from[0], y: from[1], vx: (to[0] - from[0]) / len * speed, vy: (to[1] - from[1]) / len * speed, age: 0, trail: [] }
  }
  const start = () => {
    sweep = { x: W / 2, y: H / 2, found: 0, tries: 0, comet: newComet(Q.flag('comets:seen') || 0), flash: 0, miss: 0, note: '' }
    Q.overlay({ update: sweepUpdate, draw: sweepDraw })
  }
  const finish = () => {
    const got = sweep.found
    sweep = null
    if (got < NEEDED) { Q.toast('You put the telescope down.'); return }
    Q.flag('comets:logged', (Q.flag('comets:logged') || 0) + 1)
    if (!Q.flag('comets:reward')) {
      Q.flag('comets:reward', true)
      Q.state.maxHp += 2
      Q.heal(Q.state.maxHp)
      Q.play('found')
      Q.say(['Three comets, all recorded! Caroline Herschel would be proud: she found eight of her own.', 'A warm light fills you. You have gained a heart!'])
    } else Q.say('Three more comets in the logbook. The sky is endless.')
  }
  function sweepUpdate(dt) {
    const s = sweep
    if (Q.pressed('alt')) { finish(); return false }
    const dx = (Q.down('right') ? 1 : 0) - (Q.down('left') ? 1 : 0)
    const dy = (Q.down('down') ? 1 : 0) - (Q.down('up') ? 1 : 0)
    const k = dx && dy ? Math.SQRT1_2 : 1
    s.x = Math.max(LENS, Math.min(W - LENS, s.x + dx * k * 190 * dt))
    s.y = Math.max(LENS + 8, Math.min(H - LENS, s.y + dy * k * 190 * dt))
    const c = s.comet
    c.age += dt
    c.x += c.vx * dt + Math.cos(c.age * 1.5) * 12 * dt
    c.y += c.vy * dt + Math.sin(c.age * 1.5) * 12 * dt
    c.trail.unshift([c.x, c.y]); if (c.trail.length > 22) c.trail.pop()
    if (s.flash > 0) s.flash -= dt
    if (s.miss > 0) s.miss -= dt
    if (c.x < -60 || c.x > W + 60 || c.y < -60 || c.y > H + 60) {
      Q.flag('comets:seen', (Q.flag('comets:seen') || 0) + 1)
      s.comet = newComet(Q.flag('comets:seen'))
      s.note = 'It slipped away. Another is coming.'
      s.miss = 1.5
    }
    if (Q.pressed('act')) {
      s.tries++
      if (Math.hypot(c.x - s.x, c.y - s.y) <= LENS - 6) {
        s.found++; s.flash = 1
        Q.flag('comets:seen', (Q.flag('comets:seen') || 0) + 1)
        Q.play('comet-seen')
        s.note = 'Comet recorded!'; s.miss = 1.5
        if (s.found >= NEEDED) { finish(); return false }
        s.comet = newComet(Q.flag('comets:seen'))
      } else { Q.play('comet-miss'); s.note = 'Nothing in the lens.'; s.miss = 1 }
    }
  }
  function sweepDraw() {
    const g = Q.ctx, s = sweep
    Q.draw(SKY, 0, 0)
    // The sky outside the lens is dimmed; inside it stays bright.
    g.save()
    g.globalAlpha = 0.55; g.fillStyle = Q.palette.k
    g.fillRect(0, 0, W, s.y - LENS)
    g.fillRect(0, s.y + LENS, W, H - s.y - LENS)
    g.fillRect(0, s.y - LENS, s.x - LENS, LENS * 2)
    g.fillRect(s.x + LENS, s.y - LENS, W - s.x - LENS, LENS * 2)
    g.restore()
    // The comet: a bright head and a tail of fading pixels.
    const c = s.comet
    c.trail.forEach(([x, y], i) => {
      if (i % 2) return
      g.fillStyle = i < 6 ? Q.palette.a : i < 14 ? Q.palette.c : Q.palette.b
      const sz = i < 8 ? 3 : 2
      g.fillRect(Math.round(x - sz / 2), Math.round(y - sz / 2), sz, sz)
    })
    g.fillStyle = Q.palette.w; g.fillRect(Math.round(c.x) - 3, Math.round(c.y) - 3, 6, 6)
    g.fillStyle = Q.palette.a; g.fillRect(Math.round(c.x) - 2, Math.round(c.y) - 2, 2, 2)
    Q.glow(c.x, c.y, 14, Q.palette.a, 0.5)
    if (s.flash > 0) Q.glow(s.x, s.y, LENS * 1.5, Q.palette.y, s.flash * 0.4)
    Q.draw(RING, s.x - LENS - 3, s.y - LENS - 3)
    Q.text('SWEEP THE SKY', 16, 12, Q.palette.y, 2, Q.palette.k)
    const count = `Comets ${s.found}/${NEEDED}`
    Q.text(count, W - 16 - Q.textWidth(count, 2), 12, Q.palette.w, 2, Q.palette.k)
    if (s.miss > 0) Q.text(s.note, 256 - Q.textWidth(s.note, 2) / 2, 40, Q.palette.a, 2, Q.palette.k)
    const help = 'Arrows: move the lens   Space: record   K: put away'
    Q.text(help, 256 - Q.textWidth(help, 1) / 2, H - 14, Q.palette.s, 1, Q.palette.k)
  }

  // The telescope of the Waiting Observatory (content/starglass.js): once
  // Caroline Herschel has been found, it can be used.
  Q.on('boot', () => {
    const scope = Q.types['star-telescope']
    const plain = scope.interact
    scope.interact = e => {
      const caroline = Q.figures.find(f => f.name === 'Caroline Herschel')
      if (!caroline || !Q.met(caroline)) return plain(e)
      const first = !Q.flag('comets:reward')
      Q.ask(first
        ? 'Caroline\'s telescope. Sweep the sky and record three comets to earn a heart.'
        : 'Caroline\'s telescope. Sweep the sky for comets again?',
      ['Look through it', 'Not now'], i => { if (i === 0) start() })
    }
  })
})()
