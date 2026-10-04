// The Endless Quest: the Orrery Chamber, the top room of The Cloudspire.
// A ring of brass and cloudstone under a great window of sky. It has been
// left clear for the next figure from history: the floor around the orrery
// stand at [7, 4] is empty and waiting.
(() => {
  Q.room('spire:0_-1', {
    name: 'The Orrery Chamber',
    map: [
      'XXXXXXXXXXXXXXXX',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X___X______X___X',
      'X______________X',
      'X______________X',
      'X______________X',
      'XXXXXXX_XXXXXXXX',
    ],
    things: [
      ['door', 7, 11, { to: 'spire:0_0', at: [7, 1.5], face: 'down' }],
      ['spire-gust', 3, 6, { dx: 1 }],
      ['spire-gust', 11, 4, { dx: -1 }],
      ['sign', 4, 9, { text: 'The brass rings of a great orrery turn here above the clouds, and the room is quiet, and empty of anyone. Someone is expected.' }],
    ],
  })
})()