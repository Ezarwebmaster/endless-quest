(() => {
  Q.room('1_0', {
    name: 'Starglass Glade',
    map: [
      'TTTTTTTTTTTTTTTT',
      'TT,...,.......TT',
      'T.........BBB..T',
      'T..,......BBB..T',
      'T.........BAB,.T',
      '============...T',
      '============...T',
      'T.,...........,T',
      'T.....,..~~....T',
      'T.......~~~~...T',
      'TT.,.....~~.,.TT',
      'TTTTTTTTTTTTTTTT',
    ],
    things: [
      ['sign', 5, 4, { text: 'Starglass Tower, east along the road. Its keeper vanished into the mist. Three numbered lanterns still guard the observatory.' }],
      ['door', 11, 4, { to: 'starglass:0_0', at: [7, 8.5], face: 'up' }],
    ],
  })
})()
