// The Endless Quest: a door, a stair, a hole in the ground. The hero touches
// it and goes to another room at once (Q.goto). It is invisible: draw the
// opening with a tile, and put the door on it.
// things: [['door', tileX, tileY, { to: 'hollow:0_0', at: [7.5, 8], face: 'up' }]]
//   to: the room it leads to; at: the tile the hero arrives on (halves are
//   fine), clear of the door back; face: the way the hero looks on arrival.
(() => {
  Q.sfx('door', [{ wave: 'triangle', freq: 330, to: 160, dur: 0.16, vol: 0.1 }, { wave: 'triangle', freq: 220, to: 90, dur: 0.2, vol: 0.08, delay: 0.1 }])
  Q.entity('door', {
    w: 16,
    h: 16,
    touch(e) {
      const hero = Q.hero, [tx, ty] = e.at || [7.5, 6]
      Q.play('door')
      Q.goto(e.to, tx * Q.TILE + (Q.TILE - hero.w) / 2, ty * Q.TILE + (Q.TILE - hero.h) / 2)
      if (e.face) hero.dir = e.face
    },
  })
  // A door must lead somewhere.
  Q.on('boot', () => {
    for (const [key, room] of Object.entries(Q.rooms)) {
      for (const [type, , , props] of room.things || []) {
        if (type === 'door' && !Q.rooms[props?.to]) throw new Error(`a door in room ${key} leads to "${props?.to}", which is not a room`)
      }
    }
  })
})()
