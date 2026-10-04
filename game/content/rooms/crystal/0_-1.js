// The Endless Quest: the Chamber of Echoes, the inner heart of the Crystal
// Caverns. The three crystals sing in the hall above, and their light
// gathers here on a clear floor left for the next figure from history.
(() => {
  Q.room('crystal:0_-1', {
    name: 'The Chamber of Echoes',
    map: [
      'XXXXXXXXXXXXXXXX',
      'X______________X',
      'X_C__________C_X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X______________X',
      'X_C__________C_X',
      'X______________X',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['door', 7, 11, { to: 'crystal:0_0', at: [7, 1.5], face: 'up' }],
      ['crystal-mote', 4, 3],
      ['crystal-mote', 11, 5],
      ['crystal-mote', 7, 6],
      ['crystal-mote', 3, 8],
      ['crystal-mote', 12, 9],
      ['sign', 8, 7, { text: 'A still chamber, its floor swept clean. Whoever the mist brings here will find a quiet place, and crystals singing in the hall above.' }],
    ],
  })
})()
