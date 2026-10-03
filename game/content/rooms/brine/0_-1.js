// The Endless Quest: the Shrine of the Tide, the dry heart of the Sunken
// Temple. The water is gone from this room; the altar has been left clear for
// the next figure from history.
(() => {
  const ALTAR = Q.paint(64, 44, p => {
    p.rect(2, 18, 60, 10, 's')
    p.rect(2, 18, 60, 3, 'w')
    p.rect(4, 28, 56, 12, 'd')
    p.rect(6, 40, 52, 4, 'D')
    for (const x of [10, 52]) { p.rect(x, 28, 3, 12, 'k') }
    // A tide bowl on the top, waiting for something.
    p.rect(26, 10, 12, 8, 's')
    p.rect(27, 11, 10, 6, 'd')
    p.ellipse(32, 11, 6, 2, 'a')
    p.line(26, 10, 37, 10, 'w')
    p.rect(30, 18, 4, 2, 'k')
    p.outline('k')
  })

  Q.entity('tide-altar', {
    w: 56, h: 20, solid: true,
    interact() {
      Q.say([
        'A stone altar stands dry in the middle of the shrine, its tide bowl full of clear water.',
        'The bowl holds a still reflection: a room much like this one, and a figure standing where you stand. The mist has not taken it kindly.',
        'Someone was lost here, and left their work on the altar. The shrine is waiting for them still.',
      ])
    },
    draw(e) {
      Q.shadow(e, 58)
      Q.drawOn(e, ALTAR)
      Q.glow(e.x + 32, e.y - 8, 60, Q.palette.a, 0.2 + Math.sin(Q.time * 1.6) * 0.03)
    },
  })

  Q.room('brine:0_-1', {
    name: 'The Shrine of the Tide',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XXX____^_____XXX',
      'XX____________XX',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'XX____________XX',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['door', 8, 1, { to: 'brine:0_0', at: [7.5, 2.5], face: 'down' }],
      ['tide-altar', 6, 6],
      ['tide-wisp', 4, 3, { number: 4 }],
    ],
    draw() {
      Q.glow(256, 150, 130, Q.palette.a, 0.1)
      // Sunbeams through a shaft in the roof, with dust in them.
      for (const [x, w] of [[176, 26], [232, 18]]) {
        Q.ctx.fillStyle = Q.palette.a
        Q.ctx.globalAlpha = 0.06 + Math.sin(Q.time * 0.8 + x) * 0.01
        Q.ctx.fillRect(x, 0, w, Q.ROWS * Q.TILE)
        Q.ctx.globalAlpha = 1
      }
    },
  })
})()
