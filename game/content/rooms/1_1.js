// The Endless Quest: the Windward Rise, room 1_1, south of Starglass Glade.
// A bare hilltop where the wind comes up off the eastern road, and a stair
// of pale stone climbing into the clouds: the way into The Cloudspire.
(() => {
  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // The stair, half swallowed by cloud, its top lost in the white.
  const STAIR = Q.paint(96, 144, p => {
    const r = seq(57)
    p.poly([[18, 0], [78, 0], [94, 144], [2, 144]], 's')
    for (let i = 0; i < 9; i++) {
      const y = 12 + i * 15, inset = 2 + i * 1.4
      p.rect(inset, y, 96 - inset * 2, 9, 'w')
      p.rect(inset, y + 9, 96 - inset * 2, 3, 'd')
      p.line(inset, y, 96 - inset, y, 'd')
    }
    // Cloud spilling over the steps.
    for (let i = 0; i < 16; i++) {
      const x = 2 + Math.floor(r() * 92), y = 20 + Math.floor(r() * 118)
      p.ellipse(x, y, 7 + Math.floor(r() * 8), 4 + Math.floor(r() * 3), 'w')
    }
    p.outline('k')
  })

  Q.room('1_1', {
    name: 'The Windward Rise',
    map: [
      'TTTTTTT==TTTTTTT',
      'TT,,,,...,,,,TTT',
      'T,,,......,.,,.T',
      'T..,.......,.,.T',
      'T,...........,,T',
      'T,,,...,..,..,TT',
      'T,,...,....,...T',
      'T,..,........,.T',
      'T,,.......,...,T',
      'T,..,..,...,..,T',
      'TT,,,.....,,,.TT',
      'TTTTTTT==TTTTTTT',
    ],
    things: [
      ['sign', 5, 4, { text: 'The Windward Rise. A pale stair climbs off the hilltop and into the clouds: it is the way up The Cloudspire. The wind up there blows from the east, and the tower\u2019s three vanes must face it.' }],
      ['door', 7, 6, { to: 'spire:0_0', at: [7, 10.5], face: 'down' }],
    ],
    draw() {
      Q.draw(STAIR, 208, 192)
      Q.glow(256, 210, 90, Q.palette.w, 0.12)
    },
  })
})()