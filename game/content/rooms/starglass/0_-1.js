// The clear floor at [5, 4] is a suggested home for the next figure.
(() => {
  Q.room('starglass:0_-1', {
    name: 'The Waiting Observatory',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XX************XX',
      'XX____________XX',
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
      ['star-telescope', 10, 3],
      ['star-chair', 5, 3],
      ['sign', 4, 7, { text: 'The observatory is quiet. An empty place waits for someone lost in the mist. Until then, the stars keep watch.' }],
      ['door', 7, 10, { to: 'starglass:0_0', at: [7, 3.5], face: 'down' }],
    ],
  })
})()
