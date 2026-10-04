// The Endless Quest: the Crystal Hall, the first chamber of the Crystal
// Caverns. Three pedestals hold dark crystals, and a crystal door at the
// foot of the stairs blocks the way to the inner chamber. Light all three
// pedestals and the door slides open.
(() => {
  Q.room('crystal:0_0', {
    name: 'The Crystal Hall',
    map: [
      'XXXXXXXXXXXXXXXX',
      'X______________X',
      'X_C__________C_X',
      'X______________X',
      'X____C_________X',
      'X______________X',
      'X_________C____X',
      'X______________X',
      'X_____C________X',
      'X_C__________C_X',
      'X______________X',
      'XXXXXXX_XXXXXXXX',
    ],
    things: [
      ['door', 7, 11, { to: '0_1', at: [7.5, 2.5], face: 'up' }],
      ['door', 7, 1, { to: 'crystal:0_-1', at: [7, 10.5], face: 'down' }],
      ['crystal-pedestal', 3, 4, { number: 1 }],
      ['crystal-pedestal', 10, 6, { number: 2 }],
      ['crystal-pedestal', 5, 8, { number: 3 }],
      ['crystal-door', 7, 1],
      ['crystal-mote', 4, 5],
      ['crystal-mote', 11, 8],
      ['crystal-mote', 8, 7],
      ['crystal-mote', 2, 10],
      ['crystal-mote', 13, 4],
      ['sign', 9, 10, { text: 'A note in the dust, in a careful hand: "Three crystals hold the door. Wake them with a touch, and the way opens."' }],
    ],
  })
})()
