// The Endless Quest: Caroline Herschel (1750-1848), lost in Starglass Tower.
// Silver hair under a white frilled cap, a navy dress with a grey shawl, and
// the small brass telescope she used to sweep the sky for comets.
(() => {
  const CAROLINE = Q.paint(32, 40, p => {
    // The dress, narrow and plain, with a grey shawl over the shoulders.
    p.poly([[10, 22], [22, 22], [27, 38], [5, 38]], 'n')
    p.poly([[18, 22], [22, 22], [27, 38], [19, 38]], 'D', 'n')
    p.line(10, 26, 8, 36, 'b', 'n'); p.line(12, 28, 11, 35, 'b', 'n')
    p.line(5, 37, 27, 37, 'D', ['n', 'b'])
    p.poly([[8, 21], [24, 21], [26, 29], [16, 33], [6, 29]], 'd')
    p.poly([[16, 24], [24, 21], [26, 29], [16, 33]], 'D', 'd')
    p.line(9, 22, 5, 28, 's', 'd'); p.line(10, 22, 15, 24, 's', 'd')
    p.rect(14, 21, 4, 3, 'w')
    // Her hands hold a small brass telescope across her chest.
    p.poly([[5, 33], [8, 30], [27, 24], [28, 27], [9, 35]], 'h')
    p.poly([[6, 34], [9, 32], [28, 27], [28, 28], [9, 35]], 'u')
    p.line(8, 31, 26, 25, 'y')
    p.poly([[24, 22], [28, 21], [30, 26], [26, 27]], 'U')
    p.dot(28, 23, 'a')
    p.rect(11, 30, 3, 3, 'e'); p.rect(19, 27, 3, 3, 'e')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Silver hair curling by the cheeks, under a white frilled cap.
    p.ellipse(16, 8, 10, 6.5, 's')
    p.rect(6, 8, 4, 8, 's'); p.rect(22, 8, 4, 8, 's')
    p.circle(7, 17, 2, 's'); p.circle(25, 17, 2, 's')
    p.dot(6, 16, 'w'); p.dot(24, 16, 'w')
    p.poly([[16, 7], [23, 12], [9, 12]], 'e', 's')
    p.ellipse(16, 4.5, 9, 4.5, 'w')
    p.rect(7, 5, 18, 3, 'w')
    for (const x of [8, 11, 14, 17, 20, 23]) p.dot(x, 8, 's', 'w')
    p.line(11, 2, 15, 1, 'w'); p.line(8, 5, 8, 8, 's', 'w')
    p.line(24, 5, 24, 8, 's', 'w')
    p.dot(16, 9, 'd', 's')
    // Face: bright, attentive eyes.
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'w'); p.dot(18, 12, 'w')
    p.dot(11, 16, 'P'); p.dot(20, 16, 'P')
    p.rect(15, 17, 2, 1, 'r')
    p.outline('k')
  })

  Q.figure({
    name: 'Caroline Herschel',
    born: 1750,
    died: 1848,
    room: 'starglass:0_-1',
    at: [5, 4],
    sprite: CAROLINE,
    hello: 'Oh! A visitor! I am Caroline Herschel. The mist took me from my telescope and left me in this tower of stars. That brass telescope is a fine one: do sweep the sky with it. There are always comets to find!',
    era: 'I was born in Hanover in 1750 and died there in 1848, at the age of 97. In between I lived in England, from 1772 until 1822, working beside my brother William.',
    deed: 'I was an astronomer. William discovered the planet Uranus in 1781, and I helped him at the telescope. Between 1786 and 1797 I found eight comets of my own. In 1828 the Royal Astronomical Society gave me its Gold Medal.',
  })
})()
