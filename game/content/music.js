// The Endless Quest: the Minstrel's Airs, a small music box for the kingdom.
// Every land plays its own quiet tune, woven from the engine's own beeps:
// the meadow, the Hollow, the tower, the vault, the temple, the glacier, and
// a soft air for the title. Nothing to press: it plays while you wander,
// once the game has heard a key.
(() => {
  const midi = m => 440 * Math.pow(2, (m - 69) / 12)

  // Each air: a beat length, a melody of 16 steps (null is a rest) and a
  // bass note held under every four steps of the melody.
  const AIRS = {
    title: { beat: 0.42, mel: [62, 66, 69, 66, 71, 69, 66, 62, 64, 67, 69, 74, 71, 69, 66, 62], bass: [50, 43, 45, 47] },
    world: { beat: 0.34, mel: [62, 66, 69, 66, 71, 69, 66, 64, 62, 66, 69, 73, 71, 69, 66, 62], bass: [50, 43, 45, 47] },
    hollow: { beat: 0.36, mel: [57, 60, 64, 62, 60, 57, 53, 55, 57, 60, 64, 67, 65, 62, 60, 57], bass: [45, 41, 48, 40] },
    starglass: { beat: 0.3, mel: [65, 69, 72, 77, 76, 72, 69, 65, 67, 70, 72, 77, 76, 72, 70, 67], bass: [41, 46, 48, 45] },
    clockwork: { beat: 0.24, mel: [62, 62, 65, 62, 69, 67, 65, 62, 62, 65, 69, 72, 70, 69, 67, 65], bass: [50, 46, 48, 45] },
    brine: { beat: 0.42, mel: [64, 67, 71, 74, 73, 71, 67, 64, 66, 69, 73, 76, 74, 73, 71, 67], bass: [40, 43, 45, 47] },
    icecave: { beat: 0.4, mel: [81, 84, 88, 84, 86, 84, 81, 79, 81, 84, 88, 91, 89, 88, 84, 81], bass: [45, 48, 52, 48] },
    crystal: { beat: 0.38, mel: [76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 81, 83, 81, 79, 76, 72], bass: [48, 43, 45, 41] },
    volcano: { beat: 0.32, mel: [50, 53, 57, 53, 55, 53, 50, 48, 50, 53, 58, 55, 53, 50, 48, 45], bass: [38, 41, 43, 40] },
  }

  let step = 0, next = 0, key = null

  const air = () => {
    if (Q.mode === 'title' || Q.mode === 'over') return 'title'
    return (Q.here && Q.here.grid) || 'world'
  }

  setInterval(() => {
    const a = Q.audio()
    if (!a) return
    const k = air()
    if (k !== key) { key = k; step = 0 }
    const tune = AIRS[key] || AIRS.world
    const now = a.currentTime
    if (next < now) next = now + 0.05
    let guard = 0
    while (next < now + 0.7 && guard++ < 16) {
      const delay = Math.max(0, next - now)
      const note = tune.mel[step % 16]
      if (note) Q.beep({ wave: 'triangle', freq: midi(note), dur: tune.beat * 0.85, vol: 0.045, delay })
      if (step % 4 === 0) Q.beep({ wave: 'sine', freq: midi(tune.bass[(step / 4) % 4]), dur: tune.beat * 3.4, vol: 0.05, delay })
      if (key === 'clockwork' && step % 4 === 2) Q.beep({ wave: 'square', freq: 2400, to: 1800, dur: 0.02, vol: 0.018, delay })
      step++
      next += tune.beat
    }
  }, 200)
})()
