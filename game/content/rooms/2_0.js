// The Endless Quest: the Cinder Headland, room 2_0, east of Starglass Glade.
// Ash and black basalt, and the smoking cone of a volcano: a stair of dark
// rock goes down its throat into The Emberdeep.
(() => {
  const seq = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // The volcano, seen from above: a black cone of ash, its crater smoking,
  // its throat a dark hole with a stair going down.
  const CONE = Q.paint(224, 208, p => {
    const r = seq(91)
    p.ellipse(112, 112, 106, 98, 'D')
    p.ellipse(110, 106, 96, 88, 'k')
    // The slope, ash pale on the sunward (upper left) side.
    p.poly([[10, 150], [96, 24], [214, 150], [10, 150]], 'D')
    p.poly([[18, 148], [96, 32], [120, 44], [46, 150]], 'd')
    p.poly([[96, 32], [206, 150], [168, 150], [100, 52]], 'k')
    for (let i = 0; i < 90; i++) {
      const x = 14 + Math.floor(r() * 196), y = 40 + Math.floor(r() * 110)
      p.rect(x, y, 1 + Math.floor(r() * 2), 1, r() < 0.3 ? 's' : (r() < 0.6 ? 'd' : 'k'))
    }
    // The crater and its throat, with fire lighting the inner wall.
    p.ellipse(100, 34, 62, 22, 'k')
    p.ellipse(100, 34, 56, 18, 'D')
    p.ellipse(100, 36, 34, 12, 'k')
    p.ellipse(100, 40, 30, 11, 'q')
    for (let i = 0; i < 5; i++) p.rect(74 + i * 13, 33 + (i % 2) * 3, 9, 4, i % 2 ? 'o' : 'r')
    // The stair down into it: three steps of cut basalt.
    for (let i = 0; i < 3; i++) {
      p.rect(80 - i * 3, 46 + i * 5, 40 + i * 6, 6, 'd')
      p.rect(80 - i * 3, 46 + i * 5, 40 + i * 6, 2, 's')
    }
    p.rect(70, 58, 60, 8, 'k')
    p.outline('k')
  })

  // Smoke, rising from the crater in slow rings.
  Q.on('draw', () => {
    if (Q.here.key !== '2_0') return
    Q.draw(CONE, 144, 56)
    const c = Q.ctx
    for (let i = 0; i < 9; i++) {
      const t = (Q.time * 0.16 + i / 9) % 1
      const x = 144 + 100 + Math.sin(t * 5 + i) * (10 + t * 40)
      const y = 56 + 30 - t * 46
      c.fillStyle = Q.palette.s
      c.globalAlpha = 0.5 * (1 - t)
      const r = 6 + t * 16
      c.fillRect(Math.round(x - r), Math.round(y - r / 2), Math.round(r * 2), Math.round(r))
    }
    c.globalAlpha = 1
    Q.glow(244, 96, 90, Q.palette.o, 0.16 + Math.sin(Q.time * 2) * 0.03)
  })

  Q.room('2_0', {
    name: 'The Cinder Headland',
    map: [
      'BBBBBBBBBBBBBBBB',
      'BAAAAAAAAAAAAAAB',
      'BAAABBBBBBBBAAAB',
      'BAAAAAAAAAAAAAAB',
      'BAAAAAAAAAAAAAAB',
      '.AAAAAAAAAAAAAAB',
      '.AAAAAAAAAAAAAAB',
      'BAAAAAAAAAAAAAAB',
      'BAAABBBBBBBBAAAB',
      'BAAABBBBBBBBAAAB',
      'BAAAAAAAAAAAAAAB',
      'BBBBBBBBBBBBBBBB',
    ],
    things: [
      ['sign', 5, 4, { text: 'The Cinder Headland. The trees stop and the ground turns to ash. The volcano smokes to the north: its throat is open, and a stair of black rock goes down it into The Emberdeep.' }],
      ['sign', 2, 7, { text: 'Walk west along the ash and the grass of the glade begins again.' }],
      ['door', 7, 3, { to: 'volcano:0_0', at: [7.5, 10.5], face: 'up' }],
    ],
  })
})()