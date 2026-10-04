// The Endless Quest: the Ashy Landing, the hall under the volcano's throat.
// Three iron lids hold back the lava; heave each of them up and the Slag Gate
// at the head of the hall grinds open.
(() => {
  Q.room('volcano:0_0', {
    name: 'The Ashy Landing',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XXXXXXX_XXXXXXXX',
      'X_______________',
      'X_X__L__L___X___',
      'X___L____L___X_X',
      'X_X__L__L___X___',
      'X_____________X_',
      'X__L_____L___X_X',
      'X_X__L__L___X___',
      'X_____________X_',
      'X__L______X_____',
      'XXXXXXX_XXXXXXXX',
    ],
    things: [
      ['door', 7, 11, { to: '2_0', at: [7, 4.5], face: 'down' }],
      ['door', 7, 1, { to: 'volcano:0_-1', at: [7, 10.5], face: 'down' }],
      ['slag-gate', 7, 1],
      ['vent-lid', 3, 3, { number: 1 }],
      ['vent-lid', 10, 4, { number: 2 }],
      ['vent-lid', 6, 7, { number: 3 }],
      ['cinder-mote', 11, 3, { speed: 20 }],
      ['cinder-mote', 4, 6, { speed: 16 }],
      ['cinder-mote', 10, 9, { speed: 24 }],
      ['cinder-mote', 7, 5, { speed: 18 }],
      ['sign', 5, 10, { text: 'A note burned into the basalt long ago: "Three lids, three heaves each. Mind the embers on the air."' }],
    ],
  })
})()