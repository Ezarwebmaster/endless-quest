// The Endless Quest: Charles Goodyear (1800-1860), lost in the Ember Furnace
// at the heart of The Emberdeep. The American who made rubber useful: he
// dropped a pot of rubber and turpentine on a hot stove in 1839, smelled the
// charred gum, and had found vulcanised rubber. He is at the great forge
// with his pot of black pitch still on the coals, waiting for someone to
// stir it for him.
// Goodyear: a plain American in a dark frock coat, high white collar, dark
// hair brushed back, holding a black ball of cured rubber.
(() => {
  const GOODYEAR = Q.paint(32, 42, p => {
    // A dark frock coat, cut high and plain, buttoned to the throat.
    p.poly([[9, 23], [23, 23], [27, 40], [5, 40]], 'D')
    p.poly([[17, 23], [23, 23], [27, 40], [19, 40]], 'k', 'D')
    p.rect(10, 24, 12, 10, 'd')
    p.rect(10, 34, 12, 6, 'd')
    p.rect(15, 26, 2, 14, 'k')
    p.dot(16, 29, 'y'); p.dot(16, 34, 'y')
    // A high white collar and a stock at the throat.
    p.poly([[11, 23], [21, 23], [22, 30], [16, 34], [10, 30]], 'w')
    p.poly([[16, 24], [21, 23], [22, 30], [16, 34]], 's', 'w')
    p.line(16, 24, 16, 32, 'k', ['w', 's'])
    p.rect(10, 22, 12, 2, 'k')
    p.line(9, 28, 7, 36, 'k', 'd'); p.line(23, 28, 25, 36, 'k', 'D')
    p.rect(4, 34, 6, 3, 'w'); p.rect(22, 34, 6, 3, 'w')
    p.rect(5, 28, 4, 4, 'e'); p.rect(20, 27, 5, 5, 'e')
    // The cured rubber in his raised hand: a black ball, glossy at the top.
    p.ellipse(22, 20, 5, 4.5, 'k')
    p.ellipse(21, 19, 2, 1.5, 'd')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Dark hair, brushed back off the forehead.
    p.ellipse(16, 6, 10, 6, 'D')
    p.poly([[16, 4], [23, 11], [9, 11]], 'e', 'D')
    p.rect(6, 8, 3, 5, 'D'); p.rect(23, 8, 3, 5, 'D')
    p.line(8, 4, 13, 2, 'd', 'D'); p.line(19, 2, 24, 4, 'd', 'D')
    // Face: bright eyes, a patient, tired look.
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'n'); p.dot(18, 12, 'n')
    p.line(11, 10, 13, 10, 's', 'e'); p.line(19, 10, 21, 10, 's', 'e')
    p.rect(15, 13, 2, 3, 'E')
    p.line(10, 16, 13, 16, 'E', 'e'); p.line(19, 16, 22, 16, 'E', 'e')
    p.line(13, 20, 19, 20, 'E', 'e')
    p.outline('k')
  })

  Q.figure({
    name: 'Charles Goodyear',
    born: 1800,
    died: 1860,
    room: 'volcano:0_-1',
    at: [7, 4],
    sprite: GOODYEAR,
    hello: 'Charles Goodyear, of New Haven and New York. The mist put me beside a forge that never goes out, with my pot of pitch still on the coals. It is the one thing I never got right twice.',
    era: 'I was born in New Haven on the last day of December 1800 and died in New York on the first of July 1860, in the age of steam and rubber and the first railways. I sold what I made on the road from town to town, and my family paid for most of it.',
    deed: 'In 1839 I spilled a mixture of rubber and turpentine on the hot stove of my brother\'s kitchen in Wethersfield. It charred into a hard black mass. I smelled the burning rubber and knew what had happened. In 1844 I was granted the American patent for curing rubber with sulphur and heat.',
  })

  // --- his pot: stir the right thing into the pitch, then cook it. ---
  // The cure was sulphur and heat. Stir one of the four jars into the black
  // pitch, then work the bellows at the pot three times.
  Q.sfx('pitch-stir', [{ wave: 'triangle', freq: 260, to: 180, dur: 0.25, vol: 0.06 }])
  Q.sfx('vulcanised', [
    { wave: 'sawtooth', freq: 140, to: 320, dur: 0.5, vol: 0.06 },
    { wave: 'sine', freq: 660, dur: 0.3, vol: 0.05, delay: 0.3 },
  ])

  const stirred = () => Q.flag('goodyear:stirred')
  const cooked = () => Q.flag('goodyear:heat') || 0
  const cured = () => Q.flag('goodyear:cured')

  const JARS = [
    { key: 'brimstone', name: 'A jar of brimstone' },
    { key: 'resin', name: 'A cake of resin' },
    { key: 'turpentine', name: 'A jug of turpentine' },
    { key: 'salt', name: 'A crock of salt' },
  ]

  const pot = Q.paint(44, 34, p => {
    // An iron pot on three legs, black pitch heaped in it.
    p.rect(4, 10, 36, 18, 'k')
    p.rect(5, 11, 34, 16, 'D')
    p.rect(5, 11, 34, 3, 'd')
    p.rect(8, 16, 28, 9, 'k')
    p.ellipse(22, 15, 13, 4, 'k')
    p.ellipse(21, 14, 10, 2, 'D')
    p.rect(3, 8, 38, 3, 'd')
    p.rect(2, 4, 40, 4, 'D')
    p.rect(3, 5, 38, 1, 's')
    p.rect(8, 28, 4, 4, 'k'); p.rect(20, 28, 4, 4, 'k'); p.rect(32, 28, 4, 4, 'k')
    p.outline('k')
  })

  Q.entity('pitch-pot', {
    w: 44, h: 34, solid: true,
    init(e) { e.heat = cooked() },
    interact(e) {
      const gy = Q.figures.find(f => f.name === 'Charles Goodyear')
      if (!gy || !Q.met(gy)) {
        Q.say([
          'An iron pot sits on the coals at the great forge, its pitch half gone to a black crust.',
          'Someone has been working here, and left a note pegged to the rim: "Not salt. Not resin. I have tried them all."',
        ])
        return
      }
      if (cured()) {
        Q.say('The pitch has gone to a tough black rubber that rings when you knock it. Goodyear watches the pot the way other men watch a clock.')
        return
      }
      if (!stirred()) {
        const turn = (e.number || 1) % 4
        const choices = JARS.map((_, i) => JARS[(i + turn) % 4].name)
        Q.ask('Goodyear taps the rim of the pot with his pipe. "Pitch, gum, turpentine and heat, and still it fails. What shall I stir in, to make it stand the summer and the winter both?"', choices, (i, label) => {
          if (label === JARS[0].name) {
            Q.flag('goodyear:stirred', true)
            Q.play('pitch-stir')
            Q.say([
              '"Brimstone. Sulphur." He nods as if he had said it to himself a thousand times. "A little sulphur in the gum, and then the heat of the forge does the rest. Now stir it, and cook it: three good pulls of the bellows will do it."',
              'He gives you the bellows. The pitch blackens and begins to smoke.',
            ])
          } else {
            Q.play('cloud-wrong')
            Q.say([
              `"${label}?" He shakes his head. "No, no. That is what the Indians do with it, or what the tanners do, and neither one makes it stand the frost."`,
              '"Think of what makes the very stones of this mountain run in bright veins. That is the sulphur. Stir a little of that in."',
            ])
          }
        })
        return
      }
      if (e.heat < 3) {
        e.heat++
        Q.flag('goodyear:heat', e.heat)
        Q.play('pitch-stir')
        Q.say([
          ['You work the bellows. The pot roars and the pitch slumps and swells, throwing off a black smoke.', 'The smell that comes off it is sharp and strange, and Goodyear laughs out loud.'],
          ['Another pull. The gum gives up the last of the turpentine and goes dark and glossy.', '"There! Do you smell that? That is sulphur burning."'],
          ['The third pull. The pitch hisses, and when it settles it is not a soft black tar at all.', 'It is a hard, elastic ball. Goodyear takes it out of the fire and squeezes it in his fist, and it springs back.'],
        ][e.heat - 1])
        return
      }
      cure()
    },
    draw(e) {
      Q.shadow(e, 30)
      Q.drawOn(e, pot)
      if (stirred() && !cured()) {
        Q.glow(e.x + 22, e.y + 10, 30, Q.palette.o, 0.12 + Math.sin(Q.time * 4) * 0.03 + e.heat * 0.05)
        {
          const p = Q.ctx
          p.fillStyle = Q.palette.s
          for (let i = 0; i < 5; i++) {
            const t = (Q.time * 0.5 + i / 5) % 1
            p.globalAlpha = 0.4 * (1 - t)
            p.fillRect(Math.round(e.x + 16 + Math.sin(t * 6 + i) * 8), Math.round(e.y + 8 - t * 22), 3, 3)
          }
          p.globalAlpha = 1
        }
      }
      if (cured()) Q.draw(Q.sprite([
        '..kkkk..',
        '.kDDDk..',
        'kDDDDDDk',
        'kDddDDDk',
        'kDDDDDDk',
        '.kDDDDk.',
        '..kkkk..',
      ]), Math.round(e.x + 30), Math.round(e.y - 4))
    },
  })

  const cure = () => {
    Q.flag('goodyear:cured', true)
    Q.play('vulcanised')
    Q.state.maxHp += 2
    Q.heal(Q.state.maxHp)
    Q.give('rubber-soled-shoes')
    Q.say([
      'Goodyear holds out the black ball, and it is warm, and it gives under your thumb and comes back. "Eleven years of failing," he says, "and twenty minutes of knowing. In 1844 the United States gave me the patent, and in all the years since, nobody has found a better way."',
      'A warmth runs through you, as it did for the spar, the sea clock and the clouds. You have gained a heart.',
      'He drops a pair of shoes at your feet, soles of the new black rubber. "Travel long. Nothing wears a road out like these."',
    ])
  }

  // --- the forge bellows: the extra thing, and the pot's own tool. ---
  // Ash sprites puff up out of the floor of the Furnace and smother the
  // firelight. Press K at the bellows (or face them with it) and the gust
  // blows every sprite in the room apart.
  Q.sfx('bellows-gust', [{ wave: 'triangle', freq: 260, to: 90, dur: 0.5, vol: 0.05 }])

  const bellows = Q.paint(30, 24, p => {
    p.rect(2, 8, 20, 12, 'u')
    p.rect(3, 9, 18, 4, 'h')
    p.rect(2, 16, 20, 2, 'U')
    p.poly([[22, 6], [29, 12], [29, 16], [22, 22]], 'D')
    p.rect(4, 4, 3, 6, 'D'); p.rect(10, 3, 3, 7, 'D')
    p.outline('k')
  })

  Q.entity('forge-bellows', {
    w: 30, h: 24, solid: true,
    interact() {
      const n = Q.all('ash-sprite').length
      if (!n) {
        Q.say('A leather bellows hangs by the forge. You give it a pull and the coals flare up and settle again.')
        Q.play('bellows-gust')
        return
      }
      blow()
    },
    draw(e) {
      Q.shadow(e, 22)
      Q.drawOn(e, bellows)
    },
  })

  const blow = () => {
    for (const s of Q.all('ash-sprite')) {
      Q.strike({ x: s.x - 8, y: s.y - 8, w: s.w + 16, h: s.h + 16 }, 1, Q.hero)
      Q.remove(s)
    }
    Q.play('bellows-gust')
    Q.toast('A gust of air rolls out of the bellows and scatters every ash sprite.', 3)
  }

  // The sprites themselves: soft grey puffs that crawl about and dim the
  // hall (they slow the traveller down while they sit over them).
  const PUFF = [0, 1, 2].map(i => Q.paint(18, 14, p => {
    p.ellipse(9, 8, 7, 5, 's')
    p.ellipse(6, 7, 4, 3, 'w')
    p.ellipse(12, 6 - (i % 2), 4, 3, 'w')
    p.ellipse(9, 10, 5, 3, 'd')
    p.dot(6, 11 + i % 2, 'D'); p.dot(12, 11 - i % 2, 'D')
  }))
  Q.entity('ash-sprite', {
    w: 18, h: 14,
    init(e) { e.t = Q.time + (e.number || 0); e.dx = (e.speed || 10) * (e.number % 2 ? 1 : -1) },
    update(e, dt) {
      e.t += dt
      const nx = e.x + e.dx * dt
      if (!Q.blocked(nx, e.y, e.w, e.h, e)) e.x = nx
      else e.dx = -e.dx
      const ny = e.y + Math.sin(e.t * 0.9 + e.number) * 8 * dt
      if (!Q.blocked(e.x, ny, e.w, e.h, e)) e.y = ny
    },
    hit(e) { Q.remove(e); Q.play('pitch-stir') },
    draw(e) {
      const x = Math.round(e.x), y = Math.round(e.y)
      Q.ctx.fillStyle = Q.palette.s
      Q.ctx.globalAlpha = 0.16
      Q.ctx.beginPath(); Q.ctx.arc(x + 9, y + 7, 18, 0, 6.3); Q.ctx.fill()
      Q.ctx.globalAlpha = 1
      Q.draw(PUFF[Math.floor(Q.time * 3 + e.number) % 3], x, y)
    },
  })

  // K at the bellows gives the same gust, wherever the hero stands in the
  // Furnace, so the sprites can be cleared without hunting for the handle.
  Q.on('alt', () => {
    if (Q.here.key !== 'volcano:0_-1') return false
    if (!Q.all('forge-bellows').length || !Q.all('ash-sprite').length) return false
    blow()
    return true
  })

  // The pot, the bellows and a few ash sprites in the Ember Furnace.
  Q.on('enter', room => {
    if (room.key !== 'volcano:0_-1') return
    Q.spawn('pitch-pot', 3 * Q.TILE, 2 * Q.TILE, { number: 3 })
    Q.spawn('forge-bellows', 12 * Q.TILE, 2 * Q.TILE)
    ;[[2, 6, 12], [11, 6, 16], [6, 8, 9], [12, 9, 13]].forEach(([tx, ty, sp], i) =>
      Q.spawn('ash-sprite', tx * Q.TILE + 6, ty * Q.TILE + 8, { number: i + 1, speed: sp }))
  })
})()