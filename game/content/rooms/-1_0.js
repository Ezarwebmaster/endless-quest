// The Endless Quest: Saltmarsh Shore, the western road from Willow Meadow.
// The sea has come up to the meadow's edge, and an old sea wall runs out
// into the water with a tide gate set in it: the way down to the Sunken
// Temple.
(() => {
  // The sea wall, seen from above: a run of old blocks, and the round arch
  // of the tide gate standing open on the strand.
  const GATE_ARCH = Q.paint(96, 128, p => {
    const r = () => 0.5
    p.rect(0, 0, 96, 128, 'd')
    p.rect(2, 2, 92, 124, 's')
    p.rect(5, 5, 86, 118, 'd')
    for (let y = 6; y < 122; y += 12) {
      p.line(5, y, 90, y, 'k')
      for (const x of (y / 12) % 2 ? [18, 54, 84] : [36, 70]) p.line(x, y, x, y + 10, 'k')
    }
    // The arch itself, its stones turning round the opening.
    p.rect(18, 26, 60, 100, 'd')
    p.rect(21, 29, 54, 97, 'k')
    p.rect(24, 32, 48, 94, 'q')
    p.rect(24, 60, 48, 66, 'q')
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI
      p.rect(48 + Math.cos(a) * 32 - 4, 64 + Math.sin(a) * 32 - 4, 8, 8, 's')
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI
      p.rect(48 + Math.cos(a) * 32 - 4, 64 + Math.sin(a) * 32 - 4, 8, 8, 'w')
    }
    p.ellipse(48, 64, 22, 20, 'v')
    p.ellipse(48, 66, 18, 16, 'n')
    // Seaweed and the wet line of the tide on the stones.
    for (let i = 0; i < 10; i++) {
      const x = 8 + Math.floor(r() * 80)
      p.rect(x, 100 + Math.floor(r() * 18), 1, 4, 'G'); p.dot(x, 100 + Math.floor(r() * 18), 'l')
    }
    p.rect(0, 118, 96, 10, 'b'); p.dither(0, 118, 96, 6, 'n')
    p.outline('k')
  })

  Q.room('-1_0', {
    name: 'Saltmarsh Shore',
    map: [
      'TT~~TTTTT~~TTTTT',
      'T~~..TTTT~TTTTTT',
      'T~~.....TTTT~~~T',
      'T........,~~.~~~',
      'T..##.........~~',
      'T.####.....~~~~~',
      'T..##..........~',
      'T....,.......~~~',
      'T~........####.~',
      '.~~.==..........',
      '~~~...==.....~~~',
      'TTTT...==...TTTT',
    ],
    things: [
      ['sign', 5, 8, { text: 'Saltmarsh Shore. The western road ends at the sea, and an old sea wall runs out into the water. The tide gate in it is open: the Sunken Temple lies below.' }],
      ['door', 7, 9, { to: 'brine:0_0', at: [7.5, 9.5], face: 'up' }],
      ['sign', 6, 2, { text: 'A new road leaves Willow Meadow to the west, over the salt grass to the shore.' }],
    ],
    draw() {
      Q.draw(GATE_ARCH, 192, 224)
      Q.glow(240, 328, 70, Q.palette.a, 0.18 + Math.sin(Q.time * 1.7) * 0.03)
    },
  })
})()
