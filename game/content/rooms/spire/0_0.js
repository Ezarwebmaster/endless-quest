// The Endless Quest: the Cloud Court, the first chamber of The Cloudspire.
// The wind blows from the east, so each of the three brass vanes must be
// turned to face it; then the Sky Gate at the head of the court opens.
(() => {
  Q.room('spire:0_0', {
    name: 'The Cloud Court',
    map: [
      'XXXXXXXXXXXXXXXX',
      'X______________X',
      'X____X______X__X',
      'X______________X',
      'X__X________X__X',
      'X______________X',
      'X______X_______X',
      'X______________X',
      'X___X_______X__X',
      'X______________X',
      'X__X________X__X',
      'XXXXXXX_XXXXXXXX',
    ],
    things: [
      ['door', 7, 11, { to: '1_1', at: [7.5, 6.5], face: 'up' }],
      ['door', 7, 1, { to: 'spire:0_-1', at: [7, 10.5], face: 'down' }],
      ['sky-gate', 7, 1],
      ['wind-vane', 3, 3, { number: 1 }],
      ['wind-vane', 12, 6, { number: 2 }],
      ['wind-vane', 5, 8, { number: 3 }],
      ['spire-gust', 2, 5, { dx: 1 }],
      ['spire-gust', 10, 9, { dx: -1 }],
      ['spire-gust', 12, 2, { dx: -1 }],
      ['sign', 9, 10, { text: 'A note fastened to a post, in a careful hand: "Watch the streaks of wind that drift across the court. Turn each vane until its sail stands into the wind, and the gate will know the wind and nothing else."' }],
    ],
  })
})()