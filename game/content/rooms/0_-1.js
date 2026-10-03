(() => {
  Q.room('0_-1', {
    name: 'Copper Ridge',
    map: [
      'TTTTTTTTTTTTTTTT',
      'TT,...,.......TT',
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
      ['sign', 5, 8, { text: 'Copper Ridge. The mountain road climbs into the misty peaks. East stands the bronze gate of the Clockwork Vault.' }],
      ['door', 11, 4, { to: 'clockwork:0_0', at: [7.5, 9.5], face: 'up' }],
    ],
  })
})()
