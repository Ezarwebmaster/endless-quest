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
      'TTTTTTT==TTTTTTT',
    ],
    things: [
      ['sign', 5, 4, { text: 'Starglass Tower, east along the road. Its keeper vanished into the mist. Three numbered lanterns still guard the observatory.' }],
      ['sign', 8, 10, { text: 'A track leaves the glade to the south, up the windy rise. At the top, a pale stair climbs into the clouds, into The Cloudspire.' }],
      ['door', 11, 4, { to: 'starglass:0_0', at: [7, 8.5], face: 'up' }],
    ],
  })
})()
