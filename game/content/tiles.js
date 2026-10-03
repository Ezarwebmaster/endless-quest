// The Endless Quest: the first tiles, one character of a room's map each.
// Add new tiles in your own file the same way, with a character nobody uses.
(() => {
  // A repeatable "random" sequence, so every visit draws the same field.
  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  const lawn = (p, seed) => {
    const r = seq(seed)
    p.rect(0, 0, 32, 32, 'g')
    for (let i = 0; i < 3; i++) p.dither(Math.floor(r() * 26), Math.floor(r() * 28), 6, 4, 'G')
    for (let i = 0; i < 12; i++) {
      const x = Math.floor(r() * 31), y = 2 + Math.floor(r() * 29)
      p.dot(x, y, 'G'); p.dot(x, y - 1, 'G'); p.dot(x + 1, y - 2, 'l')
    }
    for (let i = 0; i < 5; i++) p.dot(Math.floor(r() * 32), Math.floor(r() * 32), 'l')
  }
  const grass = seed => Q.paint(32, 32, p => lawn(p, seed))
  const GRASS = [grass(11), grass(23), grass(37), grass(51)]
  const field = (x, y, tx, ty) => Q.draw(GRASS[(tx * 7 + ty * 13 + ((tx * ty) % 5)) % GRASS.length], x, y)
  Q.tile('.', { name: 'grass', variants: GRASS })

  const flower = (p, x, y, petal, heart) => {
    p.dot(x, y + 3, 'G'); p.dot(x, y + 4, 'G')
    p.rect(x - 3, y - 1, 2, 2, petal); p.rect(x + 2, y - 1, 2, 2, petal)
    p.rect(x - 1, y - 3, 2, 2, petal); p.rect(x - 1, y + 1, 2, 2, petal)
    p.rect(x - 1, y - 1, 2, 2, heart)
  }
  Q.tile(',', {
    name: 'flowers',
    variants: [[11, 1], [23, -1]].map(([seed, flip]) => Q.paint(32, 32, p => {
      lawn(p, seed)
      const fx = x => (flip > 0 ? x : 31 - x)
      flower(p, fx(8), 8, 'w', 'y')
      flower(p, fx(23), 6, 'P', 'o')
      flower(p, fx(17), 21, 'w', 'y')
      flower(p, fx(6), 25, 'r', 'y')
    })),
  })

  // The road: sand with pebbles, and grass leaning over its edges where it
  // meets anything else.
  const SAND = Q.paint(32, 32, p => {
    const r = seq(7)
    p.rect(0, 0, 32, 32, 'y')
    for (let i = 0; i < 26; i++) p.dot(Math.floor(r() * 32), Math.floor(r() * 32), i % 4 ? 'h' : 'o')
    for (let i = 0; i < 4; i++) { const x = 3 + Math.floor(r() * 26), y = 3 + Math.floor(r() * 26); p.rect(x, y, 2, 2, i % 2 ? 'o' : 'h'); p.dot(x, y, 'w') }
  })
  // The edge along the top of a tile; turned for the other sides.
  const edgeRows = (fill, line) => {
    const rows = []
    const r = seq(fill === 'g' ? 3 : 9)
    const depth = Array.from({ length: 32 }, () => 2 + Math.floor(r() * 3))
    for (let y = 0; y < 6; y++) rows.push(depth.map(d => (y < d ? fill : y === d ? line : '.')).join(''))
    return rows
  }
  const turned = (rows, side) => Q.paint(32, 32, p => {
    rows.forEach((row, d) => [...row].forEach((k, i) => {
      if (k === '.') return
      const [x, y] = side === 'top' ? [i, d] : side === 'bottom' ? [i, 31 - d] : side === 'left' ? [d, i] : [31 - d, i]
      p.dot(x, y, k)
    }))
  })
  const edges = (fill, line) => Object.fromEntries(['top', 'bottom', 'left', 'right'].map(s => [s, turned(edgeRows(fill, line), s)]))
  const ROAD_EDGE = edges('g', 'h')
  // Draws the edges of a tile toward neighbours that are not `same`. The
  // world beyond the room counts as the same tile, so roads run off the screen.
  const withEdges = (x, y, tx, ty, map, same, set) => {
    const at = (dx, dy) => map[ty + dy]?.[tx + dx]
    const other = (dx, dy) => at(dx, dy) !== undefined && !same(at(dx, dy))
    if (other(0, -1)) Q.draw(set.top, x, y)
    if (other(0, 1)) Q.draw(set.bottom, x, y)
    if (other(-1, 0)) Q.draw(set.left, x, y)
    if (other(1, 0)) Q.draw(set.right, x, y)
  }
  Q.tile('=', {
    name: 'road',
    draw(x, y, tx, ty, map) {
      Q.draw(SAND, x, y)
      withEdges(x, y, tx, ty, map, ch => ch === '=', ROAD_EDGE)
    },
  })

  // Water: ripples that drift, and a grassy bank with a dark shore line.
  const water = shift => Q.paint(32, 32, p => {
    const r = seq(5)
    p.rect(0, 0, 32, 32, 'b')
    for (let i = 0; i < 10; i++) p.dot(Math.floor(r() * 32), Math.floor(r() * 32), 'n')
    for (let i = 0; i < 5; i++) {
      const x = (Math.floor(r() * 32) + shift) % 32, y = 4 + Math.floor(r() * 24)
      p.line(x, y, x + 2, y - 1, 'c'); p.line(x + 3, y - 1, x + 5, y, 'c')
    }
    p.dot((20 + shift) % 32, 9, 'a'); p.dot((7 + shift * 2) % 32, 17, 'w')
  })
  const BANK = edges('g', 'v')
  Q.tile('~', {
    name: 'water',
    solid: true,
    frames: [water(0), water(3), water(6)],
    draw(x, y, tx, ty, map) {
      Q.draw(this.frames[Math.floor(Q.time * 2) % 3], x, y)
      withEdges(x, y, tx, ty, map, ch => ch === '~', BANK)
    },
  })

  // A tree is taller than its tile: its leaves rise over the row above.
  const TREE = Q.paint(32, 46, p => {
    p.rect(13, 30, 6, 13, 'u')
    p.rect(17, 30, 2, 13, 'U')
    p.dot(12, 42, 'u'); p.dot(19, 42, 'U')
    for (const [x, y, r] of [[16, 15, 13], [8, 22, 8], [24, 22, 8], [16, 26, 10]]) p.circle(x, y, r, 't')
    p.ellipse(16, 31, 13, 4, 'v', 't')
    p.circle(14, 13, 9, 'G', 't'); p.circle(8, 20, 5, 'G', 't'); p.circle(23, 18, 5, 'G', 't')
    p.circle(12, 10, 4.5, 'g', 'G'); p.circle(21, 15, 2.5, 'g', 'G'); p.circle(7, 19, 2, 'g', 'G')
    p.dot(10, 8, 'l'); p.dot(11, 8, 'l'); p.dot(10, 9, 'l'); p.dot(20, 14, 'l')
    p.dither(6, 25, 20, 5, 'v', 't')
    p.outline('k')
    p.ellipse(16, 43, 12, 3, 'v', [null])
  })
  Q.tile('T', {
    name: 'tree',
    solid: true,
    draw(x, y, tx, ty) { field(x, y, tx, ty); Q.draw(TREE, x, y + 32 - TREE.h) },
  })

  const ROCK = Q.paint(32, 32, p => {
    p.ellipse(16, 18, 13, 10, 's')
    p.ellipse(19, 21, 11, 8, 'd', 's')
    p.ellipse(21, 24, 7, 4, 'D', 'd')
    p.ellipse(11, 14, 4, 2.5, 'w', 's')
    p.line(14, 19, 17, 22, 'd', 's')
    p.outline('k')
    p.ellipse(17, 28, 13, 3, 'v', [null])
  })
  Q.tile('#', {
    name: 'rock',
    solid: true,
    draw(x, y, tx, ty) { field(x, y, tx, ty); Q.draw(ROCK, x, y) },
  })
})()
