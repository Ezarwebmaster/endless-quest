// The Endless Quest: the hero. A young traveller with a red scarf and no
// weapon yet. Walks in four directions; everything else is up to the others.
(() => {
  // One drawing per direction and step (0 standing, 1 mid-stride).
  const front = (p, step, back) => {
    const lift = step ? 1 : 0
    p.rect(11, 25, 4, 4, 'n'); p.rect(17, 25, 4, 4, 'n')
    p.rect(10, 28 - lift, 5, 3, 'U'); p.rect(17, 28, 5, 3, 'U')
    p.rect(6, 18 + lift, 3, 6, 'b'); p.rect(23, 18 - lift, 3, 6, 'b')
    p.rect(6, 24 + lift, 3, 2, 'e'); p.rect(23, 24 - lift, 3, 2, 'e')
    p.ellipse(16, 21.5, 7.5, 5.5, 'b'); p.rect(9, 17, 14, 9, 'b')
    p.rect(19, 18, 4, 8, 'n', 'b'); p.rect(10, 18, 2, 5, 'c', 'b')
    p.rect(9, 23, 14, 2, 'u'); p.rect(15, 23, 2, 2, 'y')
    p.rect(10, 16, 12, 3, 'r'); p.rect(10, 18, 12, 1, 'p', 'r')
    if (back) p.rect(14, 18, 4, 5, 'r'); else p.rect(18, 18, 3, 4, 'r')
    // The head: big, as in most cosy pixel games.
    p.ellipse(16, 10, 9, 8.5, 'e')
    p.ellipse(16, 7.5, 10, 7, 'u')
    p.rect(6, 7, 3, 7, 'u'); p.rect(23, 7, 3, 7, 'u')
    if (back) {
      p.ellipse(16, 10, 9.5, 8, 'u')
      p.ellipse(16, 13, 8, 3, 'U', 'u')
    } else {
      p.ellipse(16, 12.5, 7, 5.5, 'e')
      p.poly([[9, 8], [23, 8], [22, 10], [19, 9], [16, 11], [13, 9], [10, 10]], 'u')
      p.rect(12, 11, 2, 3, 'k'); p.rect(18, 11, 2, 3, 'k')
      p.dot(12, 11, 'w'); p.dot(18, 11, 'w')
      p.dot(11, 14, 'P'); p.dot(20, 14, 'P')
      p.rect(15, 15, 2, 1, 'E')
    }
    p.line(11, 3, 15, 2, 'h'); p.dot(10, 4, 'h')
    p.rect(6, 12, 3, 2, 'U', 'u'); p.rect(23, 12, 3, 2, 'U', 'u')
    p.outline('k')
  }
  const side = (p, step) => {
    if (step) {
      p.rect(10, 25, 4, 3, 'n'); p.rect(18, 25, 4, 3, 'n')
      p.rect(8, 27, 5, 3, 'U'); p.rect(19, 27, 6, 3, 'U')
    } else {
      p.rect(12, 25, 4, 4, 'n'); p.rect(16, 25, 4, 4, 'n')
      p.rect(11, 28, 5, 3, 'U'); p.rect(16, 28, 6, 3, 'U')
    }
    p.rect(8, 16, 4, 4, 'r'); p.rect(6, 19, 3, 3, 'r')
    p.ellipse(16, 21.5, 6, 5.5, 'b'); p.rect(11, 17, 11, 9, 'b')
    p.rect(11, 18, 3, 7, 'n', 'b')
    p.rect(11, 23, 11, 2, 'u'); p.rect(19, 23, 2, 2, 'y')
    p.rect(11, 16, 11, 3, 'r'); p.rect(11, 18, 11, 1, 'p', 'r')
    p.rect(15 + step, 18, 3, 6, 'b'); p.rect(15 + step, 24, 3, 2, 'e')
    p.ellipse(17, 10, 8.5, 8.5, 'e')
    p.ellipse(15, 7.5, 9, 7, 'u')
    p.rect(7, 8, 5, 7, 'u')
    p.ellipse(19.5, 12.5, 5, 5, 'e')
    p.poly([[13, 7], [25, 7], [24, 10], [20, 8], [17, 10]], 'u')
    p.rect(21, 11, 2, 3, 'k'); p.dot(21, 11, 'w')
    p.dot(22, 14, 'P'); p.dot(25, 12, 'E')
    p.line(10, 3, 14, 2, 'h')
    p.rect(7, 13, 4, 2, 'U', 'u')
    p.outline('k')
  }
  const S = {
    down: [0, 1].map(s => Q.paint(32, 32, p => front(p, s, false))),
    up: [0, 1].map(s => Q.paint(32, 32, p => front(p, s, true))),
    side: [0, 1].map(s => Q.paint(32, 32, p => side(p, s))),
  }

  Q.entity('hero', {
    w: 16,
    h: 10,   // the box is the feet: the head may overlap what stands behind
    init(e) { e.speed = 140; e.walk = 0 },
    update(e, dt) {
      let dx = (Q.down('right') ? 1 : 0) - (Q.down('left') ? 1 : 0)
      let dy = (Q.down('down') ? 1 : 0) - (Q.down('up') ? 1 : 0)
      e.moving = dx !== 0 || dy !== 0
      if (!e.moving) return
      // Face the way you walk; walking diagonally keeps the facing you had.
      const want = dy > 0 ? 'down' : dy < 0 ? 'up' : null
      const across = dx > 0 ? 'right' : dx < 0 ? 'left' : null
      if (!(e.dir === want || e.dir === across)) e.dir = across && !want ? across : want || across
      if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2 }
      Q.move(e, dx * e.speed * dt, dy * e.speed * dt)
      e.walk += dt
    },
    draw(e) {
      const step = e.moving && Math.floor(e.walk * 8) % 2 ? 1 : 0
      const set = e.dir === 'up' ? S.up : e.dir === 'down' ? S.down : S.side
      Q.shadow(e, 22)
      Q.drawOn(e, set[step], e.dir === 'left')
    },
  })
})()
