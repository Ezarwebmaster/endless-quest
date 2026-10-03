// The Endless Quest: Copper Ridge, the mountain road climbing north toward
// the ancient Clockwork Vault. The road further north leads into a glacier.
(() => {
  Q.room('0_-1', {
    name: 'Copper Ridge',
    map: [
      'TTTTTTTTTTTTTTTT',
      'TT,...==......TT',
      'T.........VVV..T',
      'T..#......VVV..T',
      'T.........VEV,.T',
      'T.........==...T',
      'T......=====...T',
      'T......==......T',
      'T......==..#...T',
      'T.,....==......T',
      'TT.....==....,TT',
      'TTTTTTT==TTTTTTT',
    ],
    things: [
      ['sign', 4, 3, { text: 'The road north climbs past the bronze gate into the glacier. Frost hums in the frozen rock; a warm heart beats beneath the ice.' }],
      ['sign', 5, 8, { text: 'Copper Ridge. The mountain road climbs into the misty peaks. East stands the bronze gate of the Clockwork Vault.' }],
      ['door', 8, 1, { to: 'icecave:0_0', at: [8, 10.5], face: 'up' }],
      ['door', 11, 4, { to: 'clockwork:0_0', at: [7.5, 9.5], face: 'up' }],
    ],
  })
})()
