(() => {
  Q.room('starglass:0_0', {
    name: 'The Lantern Hall',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XXX*XXX*XXX*XXXX',
      'XX_____^______XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XXXXXXX^XXXXXXXX',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['door', 7, 2, { to: 'starglass:0_-1', at: [7, 8.5], face: 'up' }],
      ['star-gate', 7, 2],
      ['star-lantern', 4, 6, { number: 1 }],
      ['star-lantern', 8, 6, { number: 2 }],
      ['star-lantern', 11, 6, { number: 3 }],
      ['sign', 4, 8, { text: 'A note from the keeper: Light lanterns ONE, TWO, THREE, in that order. Face each lantern and press Space or J. The lights will remember, even if you leave.' }],
      ['door', 7, 10, { to: '1_0', at: [11, 5.5], face: 'down' }],
    ],
  })
})()
