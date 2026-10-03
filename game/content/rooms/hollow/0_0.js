// The Endless Quest: the Willow Hollow (room hollow:0_0), under the old
// willow of Willow Meadow. The steps at the bottom lead back up.
Q.room('hollow:0_0', {
  name: 'The Willow Hollow',
  map: [
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXX__,_____m_XXX',
    'XX_m_______,__XX',
    'XX____________XX',
    'XX_,__________XX',
    'XX__________m_XX',
    'XXX_,_____,__XXX',
    'XXXX___,_____XXX',
    'XXXXXX____XXXXXX',
    'XXXXXXX^^XXXXXXX',
    'XXXXXXXXXXXXXXXX',
  ],
  things: [
    ['desk', 10, 3],
    ['door', 7, 10, { to: '0_0', at: [3, 9], face: 'down' }],
    ['door', 8, 10, { to: '0_0', at: [3, 9], face: 'down' }],
  ],
})
