// The Endless Quest: Luke Howard (1772-1864), lost in the Orrery Chamber at
// the top of The Cloudspire. The London Quaker who was a chemist by trade
// and gave the sky its names: cirrus, cumulus, stratus and nimbus, in 1802.
// He is standing under the turning brass rings with a weather chart in his
// hands, waiting for someone to read the sky with him.
// Howard: an early 19th-century Englishman in a plain grey-brown coat and
// white cravat, long grey hair, holding a folded chart of cloud forms.
(() => {
  const HOWARD = Q.paint(32, 42, p => {
    // A Quaker's plain coat: unbuttoned wool, no trim but a wide collar.
    p.poly([[9, 23], [23, 23], [27, 40], [5, 40]], 'd')
    p.poly([[17, 23], [23, 23], [27, 40], [20, 40]], 'D', 'd')
    p.poly([[11, 23], [21, 23], [22, 30], [16, 33], [10, 30]], 'w')
    p.poly([[16, 24], [21, 23], [22, 30], [16, 33]], 's', 'w')
    p.line(16, 24, 16, 32, 'k', ['w', 's'])
    p.rect(10, 22, 12, 2, 'D')
    p.line(9, 27, 7, 36, 'k', 'd'); p.line(23, 27, 25, 36, 'k', 'D')
    // Cuffs and hands, the right one raised with the chart.
    p.rect(4, 34, 6, 3, 'w'); p.rect(22, 34, 6, 3, 'w')
    p.rect(5, 28, 4, 4, 'e'); p.rect(20, 27, 5, 5, 'e')
    // The chart: a folded sheet, ruled with little drawn clouds.
    p.poly([[21, 16], [30, 18], [28, 26], [20, 24]], 'w')
    p.poly([[21, 16], [30, 18], [30, 20], [21, 18]], 's')
    p.ellipse(24, 21, 2, 1, 's')
    p.ellipse(26, 22, 2, 1, 's')
    p.line(21, 24, 28, 26, 's')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Long grey hair, brushed back, falling past the collar.
    p.ellipse(16, 7, 10, 6, 's')
    p.rect(5, 8, 4, 12, 's'); p.rect(23, 8, 4, 12, 's')
    p.rect(5, 18, 3, 5, 'd'); p.rect(24, 18, 3, 5, 'd')
    p.poly([[16, 4], [22, 10], [10, 10]], 'e', 's')
    p.ellipse(16, 8.5, 6, 3, 'e', 's')
    p.line(7, 5, 12, 3, 'w', 's'); p.line(20, 3, 25, 5, 'w', 's')
    p.line(6, 12, 6, 16, 'd', 's'); p.line(26, 12, 26, 16, 'd', 's')
    // Face: bright, kindly eyes; the look of a man naming things.
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'n'); p.dot(18, 12, 'n')
    p.line(11, 10, 13, 10, 's', 'e'); p.line(19, 10, 21, 10, 's', 'e')
    p.rect(15, 13, 2, 3, 'E')
    p.line(10, 16, 13, 16, 'E', 'e'); p.line(19, 16, 22, 16, 'E', 'e')
    p.dot(12, 18, 'P'); p.dot(20, 18, 'P')
    p.line(13, 20, 19, 20, 'E', 'e')
    p.outline('k')
  })

  Q.figure({
    name: 'Luke Howard',
    born: 1772,
    died: 1864,
    room: 'spire:0_-1',
    at: [7, 4],
    sprite: HOWARD,
    hello: 'Luke Howard, of London, chemist by trade. The mist set me on the top of this tower of clouds, and the rings above me turn about a sun that is not there. I have three clouds drifting in this hall, and no one to name them for.',
    era: 'I was born in London in November 1772 and died there in December 1864, in the age of sailing ships and early ballooning. I kept a pharmacy in Cheapside for forty years, and I made globes of papier-mache in my spare hours.',
    deed: 'In 1802 I read a paper to the Askesian Society, "A New Modification of Descartes\' system of clouds", and gave the sky four names: cirrus, cumulus, stratus and nimbus. I added many more, and the word meteorological itself is mine.',
  })

  // --- his cloud chart: name the three clouds of the Orrery Chamber. ---
  // Each cloud drifts in the hall; face it and press Space or J to give it
  // the name Howard gave it. Name all three and you gain a heart, and his
  // brass compass for the road.
  const NAMES = ['Cirrus', 'Cumulus', 'Stratus', 'Nimbus']
  const KINDS = ['cirrus', 'cumulus', 'stratus']

  Q.sfx('cloud-right', [{ wave: 'triangle', freq: 660, to: 1320, dur: 0.2, vol: 0.08 }, { wave: 'sine', freq: 1980, dur: 0.24, vol: 0.04, delay: 0.1 }])
  Q.sfx('cloud-wrong', [{ wave: 'square', freq: 220, to: 140, dur: 0.18, vol: 0.05 }])

  const clouds = {
    // Cirrus: thin feathered streaks, high and cold.
    cirrus: Q.paint(40, 18, p => {
      p.line(2, 12, 36, 6, 'w'); p.line(2, 15, 34, 10, 's'); p.line(6, 16, 26, 13, 'w')
      p.line(10, 9, 22, 4, 's'); p.line(20, 12, 38, 9, 'w')
    }),
    // Cumulus: heaped fair-weather towers of cotton.
    cumulus: Q.paint(40, 24, p => {
      p.ellipse(13, 15, 9, 7, 'w'); p.ellipse(24, 12, 8, 8, 'w'); p.ellipse(31, 16, 7, 5, 'w')
      p.ellipse(19, 19, 12, 5, 's'); p.ellipse(13, 13, 5, 3, 's'); p.ellipse(25, 10, 4, 3, 's')
    }),
    // Stratus: a flat sheet of cloud, spread evenly over the sky.
    stratus: Q.paint(44, 18, p => {
      p.rect(2, 5, 40, 6, 's'); p.rect(4, 4, 36, 2, 'w'); p.rect(0, 11, 44, 5, 's')
      p.rect(2, 10, 40, 1, 'w'); p.rect(6, 16, 30, 2, 'd')
    }),
  }

  const named = kind => !!Q.flag('howard:' + kind)
  const namedCount = () => KINDS.filter(named).length

  Q.entity('howard-cloud', {
    w: 40, h: 20,
    init(e) { e.dir = e.dx || 1; e.t = Q.time },
    update(e, dt) {
      if (named(e.kind)) { e.y = e.y0 + Math.sin(Q.time * 0.9 + e.t) * 2; return }
      const nx = e.x + e.dir * 7 * dt
      if (nx < 8 || nx > Q.W - e.w - 8) e.dir = -e.dir
      else e.x = nx
      e.y = e.y0 + Math.sin(Q.time * 0.7 + e.t) * 4
    },
    interact(e) {
      const howard = Q.figures.find(f => f.name === 'Luke Howard')
      if (!howard || !Q.met(howard)) {
        Q.say([
          `A ${e.kind} drifts through the hall, unhurried, quite alone in the quiet.`,
          'It is the kind of cloud a man could give a name to, if he were here to give it.',
        ])
        return
      }
      if (named(e.kind)) {
        Q.say(`The ${e.kind} Howard named once, on this very floor of cloud. His name still sits on it, true as a rule.`)
        return
      }
      const at = NAMES.indexOf(kind[0].toUpperCase() + kind.slice(1))
      const turn = e.number % NAMES.length
      const choices = NAMES.map((_, i) => NAMES[(i + turn) % NAMES.length])
      Q.ask(`Howard holds his chart up beside it. "Now then. What shall this ${e.kind} be called?"`, choices, (i, label) => {
        if (label === NAMES[at]) {
          Q.flag('howard:' + e.kind, true)
          Q.play('cloud-right')
          if (namedCount() >= KINDS.length) reward()
          else Q.say([
            `"${label}!" Howard writes it on the chart, pleased. ${praise(e.kind)}`,
            `He looks up at the next cloud coming over the brass rings. "${KINDS.length - namedCount()} still to name."`,
          ])
        } else {
          Q.play('cloud-wrong')
          Q.say([
            `"${label}?" Howard shakes his head kindly. "No, no. Look again at its shape, and I will tell you what gives it away."`,
            hint(e.kind),
          ])
        }
      })
    },
    draw(e) {
      const s = clouds[e.kind]
      const x = Math.round(e.x + (e.w - s.w) / 2), y = Math.round(e.y)
      Q.glow(e.x + e.w / 2, e.y + 8, named(e.kind) ? 34 : 22, Q.palette.a, named(e.kind) ? 0.34 : 0.12)
      Q.draw(s, x, y)
      if (named(e.kind)) {
        const label = e.kind[0].toUpperCase() + e.kind.slice(1)
        Q.text(label.toUpperCase(), Math.round(x + (s.w - Q.textWidth(label.toUpperCase(), 1)) / 2), y - 12, Q.palette.a, 1, Q.palette.k)
      }
    },
  })

  const praise = kind => [
    '"Cirrus! Thin and feathery, far above the rest, made of ice and not of water. The very word means a curl of hair."',
    '"Cumulus! Heaped and heaped again, a fair-weather cotton, tall enough to pile in a summer afternoon."',
    '"Stratus! Spread out flat, a sheet drawn level across the whole sky. The word means a spread or a covering."',
  ][KINDS.indexOf(kind)]
  const hint = kind => [
    'The streaks are thin and combed by the wind, high up where it is cold: no heap in them at all.',
    'It heaps itself in round towers, fat in the middle and flat beneath.',
    'It lies in long flat bars, one layer laid over another, without a single heap.',
  ][KINDS.indexOf(kind)]

  const reward = () => {
    Q.state.maxHp += 2
    Q.heal(Q.state.maxHp)
    Q.give('compass')
    Q.play('found')
    Q.say([
      '"Cirrus, cumulus, stratus and nimbus," Howard says, "and every one of them Latin, and every one of them a real shape I saw over London. The sky is not a mood. It is a set of things, and now a traveller can learn their names."',
      'A warmth runs through you, as it did for the spar and the sea clock. You have gained a heart.',
      'He puts a small brass compass in your hand. "Take it. I have the chart; you have the roads. It knows which way the next lost one lies."',
    ])
  }

  // The three clouds of the Orrery Chamber, drifting under the brass rings.
  const spots = [[2, 3, 1], [9, 2, -1], [5, 8, 1]]
  Q.on('enter', room => {
    if (room.key !== 'spire:0_-1') return
    KINDS.forEach((kind, i) => {
      const [tx, ty, dx] = spots[i]
      const e = Q.spawn('howard-cloud', tx * Q.TILE, ty * Q.TILE + 6, { kind, number: i + 1, dx })
      if (e) e.y0 = e.y
    })
  })
})()
