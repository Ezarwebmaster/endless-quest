// The Endless Quest: the Drowned Antechamber of the Sunken Temple, still
// under water. Light the three sunken braziers to drain the hall and open
// the Tide Gate at the foot of the steps.
(() => {
  Q.room('brine:0_0', {
    name: 'The Drowned Antechamber',
    map: [
      'XXXXXXXXXXXXXXXX',
      'XXXXX_^_XXXXXXXX',
      'X___w____w_____X',
      'X_w~~~~~~~~~~w_X',
      'X_w~~~~~~~~~~w_X',
      'X_w~~~~~~~~~~w_X',
      'X______________X',
      'X_w~~~~~~~~~~w_X',
      'X_w~~~~~~~~~~w_X',
      'X_w~~~~~~~~~~w_X',
      'X____w____w____X',
      'XXXXXXXXXXXXXXXX',
    ],
    things: [
      ['door', 7, 10, { to: '-1_0', at: [7, 10.5], face: 'down' }],
      ['tide-brazier', 3, 2, { number: 1 }],
      ['tide-brazier', 12, 2, { number: 2 }],
      ['tide-brazier', 3, 10, { number: 3 }],
      ['tide-wisp', 6, 5, { number: 1 }],
      ['tide-wisp', 10, 8, { number: 2 }],
      ['tide-wisp', 9, 3, { number: 3 }],
      ['tide-gate', 7, 2],
      ['door', 7, 1, { to: 'brine:0_-1', at: [7.5, 8.5], face: 'up' }],
      ['sign', 8, 6, { text: 'A stele under the water, worn nearly smooth: "Light what lies drowned. What the tide has taken, the fire shall give back."' }],
    ],
  })
})()
