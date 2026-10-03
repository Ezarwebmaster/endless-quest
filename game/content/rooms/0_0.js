// The Endless Quest: Willow Meadow, where the hero wakes (room 0_0).
// Roads leave it to the north and to the east, into rooms nobody has built.
// The old willow by the pond hides the way down to the Willow Hollow.
(() => {
  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647
  // The old willow: three tiles wide, its branches hanging to the ground,
  // a hollow between its roots. The room draws it over the tiles; 'Y' marks
  // the ground it covers and 'O' the hollow, which the hero can walk into.
  const WILLOW = Q.paint(104, 112, p => {
    const r = seq(42)
    p.poly([[41, 50], [63, 50], [65, 98], [76, 110], [28, 110], [39, 98]], 'u')
    p.poly([[57, 50], [63, 50], [65, 98], [76, 110], [58, 110]], 'U')
    p.line(44, 56, 42, 100, 'h'); p.line(47, 62, 46, 82, 'h')
    for (const x of [51, 55]) p.line(x, 56, x - 1, 84, 'U', 'u')
    p.line(30, 109, 40, 104, 'h'); p.line(64, 104, 74, 109, 'U')
    // The hollow, dark, its rim lit from the left.
    p.ellipse(52, 93, 9, 9, 'k'); p.rect(43, 93, 18, 16, 'k')
    p.line(42, 92, 42, 108, 'h'); p.line(61, 92, 61, 108, 'U')
    p.ellipse(52, 92, 10, 10, 'U', [null, 'u']); p.ellipse(52, 93, 9, 9, 'k')
    // The crown.
    const clumps = [[52, 26, 24], [30, 32, 19], [74, 32, 19], [14, 44, 12], [90, 44, 12], [40, 16, 16], [66, 17, 16], [52, 40, 22]]
    for (const [x, y, rad] of clumps) p.circle(x, y, rad, 't')
    for (const [x, y, rad] of clumps) p.circle(x - 3, y - 4, rad - 5, 'G', 't')
    for (const [x, y, rad] of clumps.slice(0, 7)) p.circle(x - 6, y - 8, rad / 2.6, 'g', 'G')
    for (const [x, y, rad] of clumps.slice(0, 7)) { p.dot(x - 8, y - 11, 'l'); p.dot(x - 7, y - 11, 'l'); p.dot(x - 8, y - 10, 'l') }
    for (let i = 0; i < 50; i++) p.dot(6 + Math.floor(r() * 92), 4 + Math.floor(r() * 50), r() < 0.5 ? 't' : 'G', ['g', 'G'])
    // Branches hang to the ground on both sides of the trunk.
    for (let x = 3; x <= 101; x += 2) {
      if (x > 35 && x < 69) continue
      const top = 34 + Math.floor(r() * 12), bottom = 92 + Math.floor(r() * 14)
      const lean = x < 52 ? -1 : 1
      p.line(x, top, x + lean, bottom, (x >> 1) % 3 ? 'G' : 'g')
      p.line(x + 1, top + 6, x + 1 + lean, bottom - 8, 't')
      p.dot(x + lean, bottom, 'l')
    }
    for (let x = 37; x <= 67; x += 3) p.line(x, 44, x, 52 + Math.floor(r() * 8), (x >> 1) % 2 ? 'G' : 'g')
    p.outline('k')
    p.ellipse(52, 109, 50, 4, 'v', [null])
  })
  Q.tile('Y', { name: 'under the willow', solid: true, variants: Q.tiles['.'].variants })
  Q.tile('O', { name: 'the willow\'s hollow', variants: Q.tiles['.'].variants })

  Q.room('0_0', {
    name: 'Willow Meadow',
    map: [
      'TTTTTTT==TTTTTTT',
      'TT,....==...,.TT',
      'T,.....==......T',
      'T..~~..==....,.T',
      'T.~~~~.==......T',
      'T.~~~..=========',
      'T.YYY..=========',
      'T,YYY..........T',
      'T.YOY,.........T',
      'T.........,..#.T',
      'TT.,..........TT',
      'TTTTTTTTTTTTTTTT',
    ],
    things: [
      ['sign', 10, 7, { text: 'Willow Meadow. Roads lead north and east, into lands no one has built yet. Something stirs under the old willow.' }],
      ['door', 3, 8, { to: 'hollow:0_0', at: [7.5, 8.5], face: 'up' }],
    ],
    draw() { Q.draw(WILLOW, 60, 176) },
  })
})()
