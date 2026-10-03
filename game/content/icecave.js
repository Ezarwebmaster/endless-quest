// The Endless Quest: The Glacier's Heart, an ice cave north of Copper Ridge.
// Frozen waterfalls hang from the ceiling, frost motes drift through the
// cold, and a warm spring steams in the deep chamber. Left with clear floor
// for the next figure from history.
(() => {
  Q.dungeon('icecave', { name: 'The Glacier\'s Heart' })

  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // --- tiles ---
  // Ice floor: pale blue ice, fresh frost pattern on every visit.
  const frost = (p, seed) => {
    const r = seq(seed)
    p.rect(0, 0, 32, 32, 'b')
    p.rect(1, 1, 30, 30, 'c')
    for (let i = 0; i < 6; i++) p.dither(Math.floor(r() * 28), Math.floor(r() * 28), 5, 4, 'a')
    for (let i = 0; i < 14; i++) p.dot(Math.floor(r() * 30), Math.floor(r() * 30), 'c')
  }
  const FLOOR = [3, 19, 31].map(s => Q.paint(32, 32, p => frost(p, s)))
  Q.tile('I', { name: 'ice floor', variants: FLOOR }, 'icecave')

  // Ice wall: hewn blocks of ice, face where the floor lies beneath.
  const BLOCKS = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'n')
    for (let y = 0; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'b')
      p.line(0, y, 31, y, 'c'); p.line(0, y + 7, 31, y + 7, 'k')
      for (const x of (y / 8) % 2 ? [4, 20] : [12, 28]) p.line(x, y, x, y + 6, 'k')
    }
  })
  const FACE = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'n')
    for (let y = 2; y < 32; y += 8) {
      p.rect(0, y, 32, 7, 'b')
      p.line(0, y, 31, y, 'c'); p.line(0, y + 7, 31, y + 7, 'k')
    }
    p.rect(0, 0, 32, 3, 'k')
    p.rect(0, 29, 32, 3, 'k')
  })
  const isWall = ch => ch === 'P' || ch === 'W'
  Q.tile('P', {
    name: 'ice wall',
    solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      Q.draw(isWall(at(0, 1)) ? BLOCKS : FACE, x, y)
      if (!isWall(at(-1, 0))) { Q.ctx.fillStyle = Q.palette.c; Q.ctx.fillRect(x, y, 2, 32) }
      if (!isWall(at(1, 0))) { Q.ctx.fillStyle = Q.palette.n; Q.ctx.fillRect(x + 30, y, 2, 32) }
      if (!isWall(at(0, -1))) { Q.ctx.fillStyle = Q.palette.n; Q.ctx.fillRect(x, y, 32, 3) }
    },
  }, 'icecave')

  // Dungeon border wall: blocks of ice, always visible at room edges.
  Q.tile('X', {
    name: 'cave wall',
    solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      Q.draw(isWall(at(0, 1)) ? BLOCKS : FACE, x, y)
      if (!isWall(at(-1, 0))) { Q.ctx.fillStyle = Q.palette.c; Q.ctx.fillRect(x, y, 2, 32) }
      if (!isWall(at(1, 0))) { Q.ctx.fillStyle = Q.palette.n; Q.ctx.fillRect(x + 30, y, 2, 32) }
      if (!isWall(at(0, -1))) { Q.ctx.fillStyle = Q.palette.n; Q.ctx.fillRect(x, y, 32, 3) }
    },
  }, 'icecave')

  // Frozen waterfall: a column of ice falling from the ceiling, frozen pool
  // beneath. Taller than its tile, so it hangs down over the roof line.
  const WATERFALL = Q.paint(32, 46, p => {
    const r = seq(7)
    p.rect(8, 0, 16, 12, 'b')
    p.rect(11, 6, 10, 10, 'c')
    for (let i = 0; i < 5; i++) {
      p.rect(10 + Math.floor(r() * 12), 14 + i * 4, 2, 4, 'a')
    }
    p.rect(6, 30, 20, 14, 'b')
    p.rect(12, 34, 8, 10, 'c')
    p.outline('k')
  })
  Q.tile('W', { name: 'frozen waterfall', solid: true, sprite: WATERFALL }, 'icecave')

  // Warm spring: green-tinted water under thin ice, with steam rising.
  const WARM = Q.paint(32, 32, p => {
    p.rect(0, 0, 32, 32, 'w')
    p.rect(5, 5, 22, 22, 'l')
    p.rect(8, 8, 16, 8, 'l', ['l'])
    p.line(8, 10, 24, 10, 'g'); p.line(8, 14, 24, 14, 'g')
    p.dot(13, 12, 'y'); p.dot(19, 16, 'y')
  })
  Q.tile('H', { name: 'warm spring', draw(x, y) { Q.draw(WARM, x, y) } }, 'icecave')

  // Frost motes: harmless glints of ice light that drift through the cold.
  const MOTES = [0, 1, 2, 3].map(i => Q.paint(12, 12, p => {
    p.ellipse(6, 6, 5, 5, 'a')
    p.ellipse(6, 6, 3, 3, 'c')
    p.ellipse(6, 6, 1.5, 1.5, 'w')
    p.outline('k')
  }))
  Q.entity('frost-mote', {
    w: 12, h: 12,
    init(e) { e.t = Q.time },
    update(e, dt) {
      e.t += dt
      const nx = e.x + Math.sin(e.t * 0.5) * 16 * dt
      const ny = e.y + Math.cos(e.t * 0.3) * 10 * dt
      if (!Q.blocked(nx, e.y, e.w, e.h, e)) e.x = nx
      if (!Q.blocked(e.x, ny, e.w, e.h, e)) e.y = ny
    },
    draw(e) {
      Q.glow(e.x + 6, e.y + 6, 26, Q.palette.a, 0.35)
      Q.draw(MOTES[Math.floor(Q.time * 5) % 4], Math.round(e.x - 0), Math.round(e.y - 0))
    },
  })

  // --- cold light, warm heart ---
  Q.on('draw', () => {
    if (Q.here.grid !== 'icecave') return
    Q.ctx.fillStyle = '#0b182a'
    Q.ctx.globalAlpha = 0.35
    Q.ctx.fillRect(0, 0, Q.W, Q.ROWS * Q.TILE)
    Q.ctx.globalAlpha = 1
    Q.here.map.forEach((row, ty) => [...row].forEach((ch, tx) => {
      if (ch === 'H') Q.glow(tx * 32 + 16, ty * 32 + 16, 70, Q.palette.y, 0.25)
      if (ch === 'W') Q.glow(tx * 32 + 16, ty * 32 + 8, 40, Q.palette.c, 0.15)
    }))
  })
})()
