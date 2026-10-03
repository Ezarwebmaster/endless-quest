(() => {
  Q.room('clockwork:0_0', {
    name: 'The Gearworks',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XXGGXXXX^^XXXXGG',
      'XX______^^____XX',
      'XX____________XX',
      'XX____*____*__XX',
      'XX____________XX',
      'XX____________XX',
      'XX______**____XX',
      'XX____________XX',
      'XX____________XX',
      'XXXXXXX^^XXXXXXX',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['door', 7, 2, { to: 'clockwork:0_-1', at: [7.5, 8.5], face: 'up' }],
      ['door', 8, 2, { to: 'clockwork:0_-1', at: [7.5, 8.5], face: 'up' }],
      ['clockwork-gate', 7, 2],
      ['clockwork-gate', 8, 2],
      ['clockwork-lever', 3, 5, { number: 1 }],
      ['clockwork-lever', 12, 5, { number: 2 }],
      ['clockwork-lever', 7, 6, { number: 3 }],
      ['sign', 4, 8, { text: 'Vault Instructions: The stair gate is pressurized. Turn the three brass regulator levers to release the locking bars.' }],
      ['door', 7, 10, { to: '0_-1', at: [11, 5.5], face: 'down' }],
      ['door', 8, 10, { to: '0_-1', at: [11, 5.5], face: 'down' }],
    ],
  })
})()
