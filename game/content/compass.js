// The Endless Quest: the brass compass, given by Luke Howard when you name
// the three clouds of the Orrery Chamber. Press K to take it in your hand:
// its needle settles toward the nearest figure from history you have not yet
// met, by the way in to that figure's dungeon. It is drawn small in the
// corner of the screen whenever you carry it.
(() => {
  const NEEDLES = 8
  const ways = {}      // dungeon id -> the world room whose door leads into it

  Q.on('boot', () => {
    for (const [key, room] of Object.entries(Q.rooms)) {
      const here = Q.parseKey(key)
      if (here.grid) continue                       // only world rooms are doors in
      for (const [type, , , props] of room.things || []) {
        if (type !== 'door' || typeof props?.to !== 'string') continue
        const there = Q.parseKey(props.to)
        if (there && there.grid && !ways[there.grid]) ways[there.grid] = here
      }
    }
  })

  // Where the needle points from here, and how far that is.
  const bearing = () => {
    const here = Q.here
    const lost = Q.figures.filter(f => !Q.met(f)).map(f => Q.dungeonOf(f)?.name).join(', ')
    const pool = Q.figures.filter(f => !Q.met(f))
    if (!pool.length) return { note: 'Every figure from history is in the Chronicle. The needle is idle.' }
    // Nearest by straight line, in room coordinates, within the same grid.
    let best = null
    for (const f of pool) {
      const there = Q.parseKey(f.room)
      let dx, dy, where = f.room
      if (there.grid === here.grid) {
        dx = there.x - here.x; dy = there.y - here.y
      } else if (!here.grid && ways[there.grid]) {
        const w = ways[there.grid]
        dx = w.x - here.x; dy = w.y - here.y; where = `${w.key} (the way to ${Q.dungeonOf(f)?.name})`
      } else if (here.grid && ways[here.grid]) {
        // Inside a dungeon: the needle first points out of it, toward the road.
        const w = ways[here.grid]
        return { dx: w.x, dy: w.y, note: `Back to the road, through ${w.key}, and then to ${lost}.` }
      } else continue
      const d = Math.hypot(dx, dy)
      if (!best || d < best.d) best = { dx, dy, d, f, where }
    }
    if (!best) return { note: 'The needle wanders: the mist hides that one well.' }
    const rooms = Math.max(1, Math.round(best.d))
    return {
      dx: best.dx, dy: best.dy,
      note: `${Q.dungeonOf(best.f)?.name}: ${rooms} room${rooms > 1 ? 's' : ''} of walking, near ${best.where}.`,
    }
  }

  const angle = b => Math.atan2(b.dy, b.dx) - Math.PI / 2   // 0 is up, as the screen is

  // A small brass compass face, drawn with the needle at `ang` radians.
  const face = size => Q.paint(size, size, p => {
    const c = (size - 1) / 2, r = c - 1
    p.circle(c, c, r, 'u')
    p.circle(c, c, r - 1, 'y')
    p.circle(c, c, r - 3, 'w')
    for (let i = 0; i < NEEDLES; i++) p.dot(c + Math.round(Math.cos(i / NEEDLES * Math.PI * 2 - Math.PI / 2) * (r - 5)), c + Math.round(Math.sin(i / NEEDLES * Math.PI * 2 - Math.PI / 2) * (r - 5)), 'D')
    p.outline('k')
  })
  const NEEDLE = size => Q.paint(size, size, p => {
    const c = (size - 1) / 2
    p.poly([[c, 3], [c + 3, c], [c, c - 2], [c - 3, c]], 'r')
    p.poly([[c, 3], [c + 3, c], [c, c], ], 'k', ['r'])
    p.circle(c, c, 2, 'k'); p.circle(c, c, 1, 'y')
  })

  const HUD = 26
  let shown = 0

  Q.on('hud', () => {
    if (!Q.has('compass')) { shown = 0; return }
    shown = Math.min(1, shown + 0.08)
    const b = bearing()
    const ang = b.dx === undefined ? 0 : angle(b)
    const sway = b.dx === undefined ? 0 : Math.sin(Q.time * 2.4) * 0.05
    const x = Q.W - HUD - 6, y = Q.H - HUD - 6
    Q.draw(face(HUD), x, y)
    Q.ctx.save()
    Q.ctx.translate(x + HUD / 2, y + HUD / 2)
    Q.ctx.rotate(ang + sway)
    Q.draw(NEEDLE(HUD), -HUD / 2, -HUD / 2)
    Q.ctx.restore()
    Q.text('K', x + HUD / 2 - Q.textWidth('K', 1) / 2, y + HUD + 2, Q.palette.D, 1)
  })

  Q.sfx('compass', [{ wave: 'triangle', freq: 740, to: 990, dur: 0.12, vol: 0.06 }])
  Q.on('alt', () => {
    if (!Q.has('compass')) return
    Q.play('compass')
    const b = bearing()
    Q.say([
      'You take out the little brass compass. The needle swings, settles, and swings a little again, the way a needle does when it means what it says.',
      b.note,
      b.dx === undefined ? '' : `Heads ${['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round((angle(b) / (Math.PI * 2) + 1) * 8) % 8]} from here.`,
    ].filter(Boolean))
  })
})()
