// The clear floor at [7, 4] is a suggested home for the next figure.
(() => {
  Q.room('clockwork:0_-1', {
    name: 'The Master Atelier',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XXGGXXXXXXXXGGXX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____________XX',
      'XX____*__*____XX',
      'XX____________XX',
      'XX____________XX',
      'XXXXXXX^^XXXXXXX',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['clockwork-bench', 9, 3],
      ['clockwork-chair', 5, 3],
      ['clockwork-owl', 12, 4],
      ['sign', 4, 7, { text: 'The Master Atelier lies quiet under the ticking of the Great Chronometer. A drafting desk and open floor wait for an inventor lost in the mist.' }],
      ['door', 7, 10, { to: 'clockwork:0_0', at: [7.5, 3.5], face: 'down' }],
      ['door', 8, 10, { to: 'clockwork:0_0', at: [7.5, 3.5], face: 'down' }],
    ],
  })
})()
