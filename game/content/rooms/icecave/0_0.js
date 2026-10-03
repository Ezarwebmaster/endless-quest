// The Endless Quest: the Frozen Vestibule of The Glacier's Heart. Ice walls
// and a frozen waterfall line the entrance hall; north leads down to the
// warm spring of the inner chamber.
(() => {
  Q.room('icecave:0_0', {
    name: 'The Frozen Vestibule',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XPPPPPPPIPPPPPPX',
      'XPPPPPPPPPPPPPPX',
      'XPPWPPPPPPPPPPPX',
      'XPPWPPPPPPPPPPPX',
      'XPPWPPPPPPPPPPPX',
      'XPPWPPPPPPPPPPPX',
      'XPPWPPPPPPPPPPPX',
      'XPPPPPPPPPPPPPPX',
      'XPPPPPPPPPPPPPPX',
      'XPPPPPPPIPPPPPPX',
      'XPPPPPPPIPPPPPPX',
    ],
    things: [
      ['door', 8, 11, { to: '0_-1', at: [8, 4.5], face: 'down' }],
      ['door', 8, 1, { to: 'icecave:0_-1', at: [8, 10.5], face: 'up' }],
      ['sign', 9, 5, { text: 'The Glacier\'s Heart. Deeper down a warm spring never freezes. Keep north.' }],
    ],
  })
})()
