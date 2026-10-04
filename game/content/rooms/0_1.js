// The Endless Quest: the South Hollow, a meadow path south of Willow Meadow.
// The road leads down through the long grass to a dark mouth in the
// hillside, the entrance to the Crystal Caverns.
(() => {
  const CAVE_MOUTH = Q.paint(96, 48, p => {
    p.rect(8, 0, 80, 48, 'g')
    p.rect(0, 16, 96, 32, 'U')
    p.rect(2, 20, 92, 28, 'k')
    p.ellipse(48, 28, 38, 20, 'D')
    p.ellipse(48, 30, 34, 16, 'k')
    p.line(8, 0, 14, 16, 't')
    p.line(88, 0, 82, 16, 't')
    p.line(4, 20, 12, 20, 'h')
    p.line(84, 20, 92, 20, 'U')
    for (let i = 0; i < 6; i++) p.dot(10 + i * 14, 8 + (i % 2) * 2, 'G')
    p.outline('k')
  })

  Q.room('0_1', {
    name: 'The South Hollow',
    map: [
      'TTTTTTT==TTTTTTT',
      'TT,...,==.,...,T',
      'T.,....==....,.T',
      'T......==......T',
      'T.,....==....,.T',
      'T..,...==.,..,.T',
      'T......==......T',
      'T.,....==....,.T',
      'T......==......T',
      'T.,....==....,.T',
      'TT.,...==...,.TT',
      'TTTTTTT==TTTTTTT',
    ],
    things: [
      ['sign', 5, 5, { text: 'A new road, barely a track. The long grass parts around it, and ahead the ground drops away to a dark mouth in the hillside.' }],
      ['door', 7, 11, { to: 'crystal:0_0', at: [7, 10.5], face: 'down' }],
    ],
    draw() {
      Q.draw(CAVE_MOUTH, 208, 320)
      Q.glow(256, 344, 80, Q.palette.a, 0.1)
    },
  })
})()
