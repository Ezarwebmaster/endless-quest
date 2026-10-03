// The Endless Quest: the Willow Hollow, the first dungeon. A cave among the
// roots of the old willow in Willow Meadow, lit by glowing mushrooms. Its
// tiles belong to its grid (the third argument of Q.tile), so other dungeons
// can use the same characters for tiles of their own.
// Rooms: content/rooms/hollow/. Its figure: content/ada.js.
(() => {
  Q.dungeon('hollow', { name: 'The Willow Hollow' })

  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const earth = (p, seed) => {
    const r = seq(seed)
    p.rect(0, 0, 32, 32, 'u')
    for (let i = 0; i < 3; i++) p.dither(Math.floor(r() * 24), Math.floor(r() * 26), 8, 6, 'U')
    for (let i = 0; i < 18; i++) p.dot(Math.floor(r() * 32), Math.floor(r() * 32), i % 3 ? 'U' : 'h')
    for (let i = 0; i < 2; i++) { const x = 3 + Math.floor(r() * 25), y = 3 + Math.floor(r() * 25); p.rect(x, y, 3, 2, 'd'); p.dot(x, y, 's'); p.dot(x + 2, y + 1, 'D') }
  }
  const FLOOR = [5, 17, 29].map(seed => Q.paint(32, 32, p => earth(p, seed)))
  Q.tile('_', { name: 'earth floor', variants: FLOOR }, 'hollow')

  Q.tile(',', {
    name: 'moss',
    variants: [3, 13].map(seed => Q.paint(32, 32, p => {
      earth(p, seed)
      const r = seq(seed + 1)
      // Tufts of moss, each a dark clump with a lit top.
      for (let i = 0; i < 7; i++) {
        const x = 4 + Math.floor(r() * 22), y = 6 + Math.floor(r() * 20), w = 3 + Math.floor(r() * 4)
        p.ellipse(x, y, w, w * 0.6, 't')
        p.ellipse(x - 0.5, y - 1, w - 1.5, w * 0.35, 'G', 't')
        p.dot(x - 1, y - 2, 'g'); p.dot(x + 1, y - 1, 'g')
      }
      p.dot(10, 9, 'l'); p.dot(21, 18, 'l')
    })),
  }, 'hollow')

  // A wall is a mass of earth and roots: seen from above where more wall
  // lies south of it, its face where the floor begins.
  const TOP = Q.paint(32, 32, p => {
    const r = seq(11)
    p.rect(0, 0, 32, 32, 'k')
    for (let i = 0; i < 3; i++) { const y = 4 + Math.floor(r() * 24); p.line(0, y, 31, y + Math.floor(r() * 7) - 3, 'U') }
    for (let i = 0; i < 6; i++) p.dot(Math.floor(r() * 32), Math.floor(r() * 32), 'D')
  })
  const face = seed => Q.paint(32, 32, p => {
    const r = seq(seed)
    p.rect(0, 0, 32, 32, 'U')
    p.rect(0, 0, 32, 4, 'k')
    for (const y of [9, 17, 24]) p.line(0, y + Math.floor(r() * 3) - 1, 31, y + Math.floor(r() * 3) - 1, 'u')
    p.dither(0, 26, 32, 4, 'k')
    p.rect(0, 30, 32, 2, 'k')
    // Roots hang down the face.
    for (let i = 0; i < 2; i++) {
      let x = 4 + Math.floor(r() * 24)
      for (let y = 2; y < 22 + Math.floor(r() * 8); y++) { p.dot(x, y, 'h'); p.dot(x + 1, y, 'u'); if (r() < 0.2) x += r() < 0.5 ? -1 : 1 }
    }
  })
  const FACES = [face(7), face(19), face(23)]
  const isWall = ch => ch === 'X' || ch === undefined
  Q.tile('X', {
    name: 'earth wall',
    solid: true,
    draw(x, y, tx, ty, map) {
      const at = (dx, dy) => map[ty + dy]?.[tx + dx]
      if (!isWall(at(0, 1))) return Q.draw(FACES[(tx * 5 + ty) % FACES.length], x, y)
      Q.draw(TOP, x, y)
      // A rim where the wall meets the floor beside or above it.
      Q.ctx.fillStyle = Q.palette.U
      if (!isWall(at(-1, 0))) Q.ctx.fillRect(x, y, 2, 32)
      if (!isWall(at(1, 0))) Q.ctx.fillRect(x + 30, y, 2, 32)
      if (!isWall(at(0, -1))) Q.ctx.fillRect(x, y, 32, 3)
    },
  }, 'hollow')

  // Glowing mushrooms: the only light down here, with the candle.
  const SHROOMS = Q.paint(32, 32, p => {
    earth(p, 31)
    for (const [x, y, s] of [[10, 20, 5], [21, 16, 6], [17, 26, 4]]) {
      p.rect(x - 1, y, 3, s + 2, 'w'); p.rect(x + 1, y, 1, s + 2, 's')
      p.ellipse(x + 0.5, y, s, s * 0.6, 'a')
      p.ellipse(x + 1.5, y + 1, s - 1, s * 0.4, 'c', 'a')
      p.dot(x - 1, y - 1, 'w'); p.dot(x + 2, y - 2, 'w')
    }
    p.outline('k')
  })
  Q.tile('m', { name: 'glowing mushrooms', solid: true, sprite: SHROOMS }, 'hollow')

  // Steps of packed earth and roots, up to the daylight.
  const STEPS = Q.paint(32, 32, p => {
    earth(p, 41)
    for (let i = 0; i < 3; i++) {
      const y = 4 + i * 9
      p.rect(2, y, 28, 5, i === 0 ? 'y' : 'h')
      p.rect(2, y + 5, 28, 4, 'u')
      p.rect(2, y + 8, 28, 1, 'U')
    }
    p.outline('k')
  })
  Q.tile('^', { name: 'steps up', sprite: STEPS }, 'hollow')

  // Ada's desk: papers, an inkwell, and a candle.
  const DESK = Q.paint(44, 34, p => {
    p.rect(4, 20, 3, 13, 'U'); p.rect(37, 20, 3, 13, 'U')
    p.rect(1, 14, 42, 8, 'u'); p.rect(1, 14, 42, 2, 'h'); p.rect(1, 21, 42, 1, 'U')
    p.rect(8, 10, 12, 6, 'w'); p.rect(10, 8, 12, 6, 'w'); p.line(12, 10, 20, 10, 's'); p.line(12, 12, 18, 12, 's')
    p.rect(25, 10, 4, 4, 'k'); p.line(28, 4, 31, 11, 'w')
    p.rect(35, 6, 3, 8, 'w'); p.rect(36, 6, 1, 8, 's')
    p.rect(35, 2, 3, 3, 'y'); p.dot(36, 1, 'o')
    p.outline('k')
  })
  Q.entity('desk', {
    w: 40,
    h: 12,
    solid: true,
    interact() { Q.say('Pages of numbers and diagrams of gears. One sheet is headed "Note G".') },
    draw(e) { Q.shadow(e, 46); Q.drawOn(e, DESK) },
  })

  // The hollow is dark: shade it, then add the light of the mushrooms and
  // the candle, and the daylight coming down the steps.
  Q.on('draw', () => {
    const room = Q.here
    if (room.grid !== 'hollow') return
    Q.ctx.fillStyle = '#1a1c2c'
    Q.ctx.globalAlpha = 0.4
    Q.ctx.fillRect(0, 0, Q.W, Q.ROWS * Q.TILE)
    Q.ctx.globalAlpha = 1
    const flicker = 0.3 + Math.sin(Q.time * 9) * 0.03 + Math.sin(Q.time * 23) * 0.02
    room.map.forEach((row, ty) => [...row].forEach((ch, tx) => {
      if (ch === 'm') Q.glow(tx * 32 + 16, ty * 32 + 18, 60, '#73eff7', 0.28)
      if (ch === '^') Q.glow(tx * 32 + 16, ty * 32 + 8, 70, '#ffcd75', 0.22)
    }))
    for (const d of Q.all('desk')) Q.glow(d.x + d.w / 2 + 16, d.y + d.h - 32, 80, '#ffcd75', flicker)
  })
})()
