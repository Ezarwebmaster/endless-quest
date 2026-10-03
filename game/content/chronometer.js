// The Endless Quest: Harrison's sea clock, his brass chronometer left on
// the altar of the Shrine of the Tide. Once John Harrison has been found, set
// the hands to the tide hour written in his tide table and the clock will
// keep it: earn an extra heart for every tide hour you find right.
(() => {
  const W = 512, H = 448
  const R = 92
  const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

  Q.sfx('tick-clock', [{ wave: 'square', freq: 1400, dur: 0.02, vol: 0.03 }, { wave: 'square', freq: 900, dur: 0.02, vol: 0.03, delay: 0.09 }])
  Q.sfx('clock-set', [{ wave: 'triangle', freq: 523, to: 1046, dur: 0.24, vol: 0.09 }, { wave: 'sine', freq: 1568, dur: 0.3, vol: 0.06, delay: 0.18 }])
  Q.sfx('clock-wrong', [{ wave: 'square', freq: 200, to: 140, dur: 0.16, vol: 0.05 }])

  const BOX = Q.paint(40, 34, p => {
    p.rect(1, 8, 38, 25, 'U')
    p.rect(3, 10, 34, 21, 'h')
    p.line(3, 10, 36, 10, 'y'); p.line(3, 30, 36, 30, 'u')
    p.rect(15, 2, 10, 8, 'u'); p.rect(16, 3, 8, 6, 'h'); p.dot(20, 6, 'y')
    p.circle(20, 20, 12, 'u'); p.circle(20, 20, 11, 'w'); p.circle(20, 20, 10, 'w')
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      p.dot(20 + Math.cos(a) * 9, 20 + Math.sin(a) * 9, 'k')
    }
    p.rect(19, 16, 2, 5, 'k'); p.dot(20, 20, 'k')
    p.outline('k')
  })

  Q.entity('sea-clock', {
    w: 30, h: 14, solid: true,
    interact() {
      const harrison = Q.figures.find(f => f.name === 'John Harrison')
      if (!harrison || !Q.met(harrison)) {
        Q.say([
          'A small brass box, the size of a pocket watch, rests on the altar beside the tide bowl.',
          'The lid is shut, and a scratched plate on the side reads: "J. Harrison, Foulby & London."',
          'It is a sea clock. Whoever left it here must be close.',
        ])
        return
      }
      const first = !Q.flag('clock:reward')
      Q.ask(first
        ? 'Harrison\'s chronometer. Set it to the tide hour and it will keep the time, as it kept it across the Atlantic.'
        : 'Harrison\'s chronometer waits, still keeping time for the sea.',
      ['Set the hands', 'Leave it be'], i => { if (i === 0) startClock() })
    },
    draw(e) {
      Q.shadow(e, 32)
      Q.drawOn(e, BOX)
      Q.glow(e.x + e.w / 2, e.y - 6, 34, Q.palette.y, 0.12 + Math.sin(Q.time * 2) * 0.02)
    },
  })

  // The clock itself, on the altar of the shrine.
  Q.on('enter', room => {
    if (room.key !== 'brine:0_-1') return
    Q.spawn('sea-clock', 8 * Q.TILE + (Q.TILE - 30) / 2, 5 * Q.TILE + (Q.TILE - 14) / 2)
  })

  let clock = null
  const tideHour = () => 1 + Math.floor(Math.random() * 12)
  const startClock = () => {
    clock = { hour: 1 + Math.floor(Math.random() * 12), want: tideHour(), tries: 0, note: 'Turn the hand to the tide hour.' }
    Q.overlay({ update: clockUpdate, draw: clockDraw })
  }
  const finish = () => {
    clock = null
    if (!Q.flag('clock:reward')) {
      Q.flag('clock:reward', true)
      Q.state.maxHp += 2
      Q.heal(Q.state.maxHp)
      Q.play('found')
      Q.say([
        'The hand sits on the tide hour, and the box keeps it without a fault, through the roll of the water and the damp of the stone.',
        'A warmth runs through you, and the sea in your blood is quiet at last. You have gained a heart!',
        '"Nine pounds, two ounces, fourteen grains," Harrison\'s voice comes from somewhere behind you. "Every sea clock is a small machine for not being lost."',
      ])
    } else {
      Q.flag('clock:tides', (Q.flag('clock:tides') || 0) + 1)
      Q.say(['The chronometer keeps the tide hour. Somewhere out in the dark, a ship finds its longitude again.'])
    }
  }
  function clockUpdate(dt) {
    if (Q.pressed('alt')) { clock = null; Q.toast('You close the lid of the sea clock.'); return false }
    const turn = (Q.pressed('right') ? 1 : 0) - (Q.pressed('left') ? 1 : 0)
    if (turn) {
      clock.hour = ((clock.hour - 1 + turn) % 12) + 1
      Q.play('tick-clock')
    }
    if (Q.pressed('act')) {
      clock.tries++
      if (clock.hour === clock.want) { finish(); return false }
      Q.play('clock-wrong')
      clock.note = 'The tide does not turn at ' + ROMAN[clock.hour - 1] + '. Look again at the table.'
    }
    return true
  }
  function clockDraw() {
    const g = Q.ctx, c = clock
    g.fillStyle = Q.palette.k; g.globalAlpha = 0.9; g.fillRect(0, 0, W, H); g.globalAlpha = 1
    const cx = 150, cy = 250
    // The brass dial, with its twelve hours.
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2
      g.fillStyle = i % 4 ? Q.palette.U : Q.palette.h
      g.fillRect(Math.round(cx + Math.cos(a) * (R + 8)) - 2, Math.round(cy + Math.sin(a) * (R + 8)) - 2, 4, 4)
    }
    g.beginPath(); g.arc(cx, cy, R + 4, 0, Math.PI * 2); g.fillStyle = Q.palette.u; g.fill()
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = Q.palette.w; g.fill()
    g.beginPath(); g.arc(cx, cy, R - 4, 0, Math.PI * 2); g.fillStyle = Q.palette.w; g.fill()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      const label = ROMAN[i]
      const lx = Math.round(cx + Math.cos(a) * (R - 20) - Q.textWidth(label, 1) / 2)
      const ly = Math.round(cy + Math.sin(a) * (R - 20))
      Q.text(label, lx, ly, Q.palette.k, 1)
      Q.text(label, lx + 1, ly + 1, Q.palette.w, 1)
    }
    // The hour hand, and the second hand that runs with it.
    const a = (c.hour / 12) * Math.PI * 2 - Math.PI / 2
    const sec = (Q.time * 2) % (Math.PI * 2)
    g.strokeStyle = Q.palette.r
    g.beginPath(); g.moveTo(cx + Math.cos(sec) * (R - 34), cy + Math.sin(sec) * (R - 34))
    g.lineTo(cx - Math.cos(sec) * 12, cy - Math.sin(sec) * 12); g.stroke()
    g.strokeStyle = Q.palette.k; g.lineWidth = 5
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 34), cy + Math.sin(a) * (R - 34)); g.stroke()
    g.lineWidth = 1; g.fillStyle = Q.palette.k
    g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.fill()
    Q.glow(cx, cy, 120, Q.palette.a, 0.08)
    // His tide table, pinned beside the dial.
    Q.text('HARRISON\'S TIDE TABLE', 24, 40, Q.palette.y, 2, Q.palette.k)
    const lines = [
      'The sea clock is open in your hands.',
      'The tide turns at ' + ROMAN[c.want - 1] + ' of the dial.',
      '',
      'Turn the hour hand with the arrows or WASD.',
      'Press Space or J to set it.',
      'Press K to close the lid.',
    ]
    lines.forEach((line, i) => Q.text(line, 24, 76 + i * 22, i === 1 ? Q.palette.a : Q.palette.w, 1, Q.palette.k))
    Q.text(c.note, 24, H - 34, Q.palette.s, 1, Q.palette.k)
  }
})()
