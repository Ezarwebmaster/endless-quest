// The Endless Quest: the Chamber of the Warm Spring, the deep heart of The
// Glacier's Heart. A warm spring breaks the endless cold; the floor has been
// left clear for the next figure from history.
(() => {
  Q.room('icecave:0_-1', {
    name: 'The Chamber of the Warm Spring',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XPPWPPPPPPWPPPPX',
      'XPIIIIIIIIIIIIPX',
      'XPIIIIIIIIIIIIPX',
      'XPIIIIIIIIIIIIPX',
      'XPPPPPPPPPPPPPPX',
      'XPPWWWWWWWWPPPPX',
      'XPPWWWIIIIWWWPPX',
      'XPPWWIIIIIIWWPPX',
      'XPPWWWIIIIWWWPPX',
      'XPPIIIIIIIIIIPPX',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['door', 8, 10, { to: 'icecave:0_0', at: [8.5, 3.5], face: 'down' }],
      ['sign', 8, 7, { text: 'A warm spring breaks the endless cold. The astronomer who measured the cold of Uppsala has made his home beside it.' }],
      ['frost-mote', 8, 8],
      ['frost-mote', 6, 8],
      ['frost-mote', 10, 7],
      ['frost-mote', 5, 9],
      ['frost-mote', 9, 9],
    ],
  })
})()
