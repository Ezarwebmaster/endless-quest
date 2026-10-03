// The Endless Quest: a wooden sign. Face it and press act to read it.
// things: [['sign', tileX, tileY, { text: 'What it says.' }]]
(() => {
  const SIGN = Q.paint(32, 32, p => {
    p.rect(14, 17, 4, 13, 'u'); p.rect(16, 17, 2, 13, 'U')
    p.rect(3, 5, 26, 13, 'h')
    p.rect(3, 9, 26, 1, 'u'); p.rect(3, 13, 26, 1, 'u')
    p.rect(3, 16, 26, 2, 'u')
    p.line(7, 7, 20, 7, 'U'); p.line(7, 11, 24, 11, 'U'); p.line(7, 15, 16, 15, 'U')
    for (const [x, y] of [[5, 6], [26, 6], [5, 15], [26, 15]]) p.dot(x, y, 'D')
    p.dot(4, 5, 'y'); p.dot(5, 5, 'y')
    p.outline('k')
  })
  Q.entity('sign', {
    w: 24,
    h: 12,
    solid: true,
    interact(e) { Q.say(e.text || 'The words have faded.') },
    draw(e) { Q.shadow(e, 20); Q.drawOn(e, SIGN) },
  })
})()
