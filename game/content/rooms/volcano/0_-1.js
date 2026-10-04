// The Endless Quest: the Ember Furnace, the chamber at the heart of
// The Emberdeep. A great forge still burning under the rock. It has been left
// clear for the next figure from history: the floor at [7, 4] is empty and
// waiting for them.
(() => {
  Q.room('volcano:0_-1', {
    name: 'The Ember Furnace',
    map: [
      'XXXXXXXXXXXXXXXX',
      'X______________X',
      'X_X__XXXXX__X__X',
      'X______________X',
      'X______________X',
      'X______L___L___X',
      'X______L___L___X',
      'X______________X',
      'X__X________X__X',
      'X______________X',
      'X______________X',
      'XXXXXXX_XXXXXXXX',
    ],
    things: [
      ['door', 7, 11, { to: 'volcano:0_0', at: [7, 1.5], face: 'down' }],
      ['cinder-mote', 3, 4, { speed: 14 }],
      ['cinder-mote', 12, 5, { speed: 18 }],
      ['sign', 5, 8, { text: 'A great forge stands at the north wall, banked but still burning, and the stone around it is warm to the touch. Someone is expected here: the floor has been swept clean.' }],
    ],
    draw() {
      // The forge: a brick hearth with a low fire left in it.
      const p = Q.ctx
      const x = 224, y = 64
      p.fillStyle = Q.palette.k; p.fillRect(x, y, 64, 40)
      p.fillStyle = Q.palette.u; p.fillRect(x + 2, y + 2, 60, 36)
      p.fillStyle = Q.palette.D
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
        if ((r + c) % 2) p.fillRect(x + 2 + c * 10, y + 2 + r * 9, 9, 8)
      }
      p.fillStyle = Q.palette.k; p.fillRect(x + 8, y + 18, 48, 18)
      p.fillStyle = Q.palette.r; p.fillRect(x + 10, y + 22, 44, 14)
      p.fillStyle = Q.palette.o; p.fillRect(x + 14, y + 26, 36, 10)
      p.fillStyle = Q.palette.y
      for (let i = 0; i < 5; i++) {
        const f = Math.sin(Q.time * 3 + i * 1.7)
        p.fillRect(x + 16 + i * 8, y + 30 - Math.round(f * 2), 6, 6)
      }
      Q.glow(x + 32, y + 32, 96, Q.palette.o, 0.2 + Math.sin(Q.time * 2.5) * 0.04)
    },
  })
})()