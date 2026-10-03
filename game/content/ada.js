// The Endless Quest: Ada Lovelace (1815-1852), lost in the Willow Hollow.
// The first figure from history, and the pattern for the others: a real
// person, drawn so a player knows them at once, who answers two questions.
// Ada: dark hair parted in the middle with ringlets, a plum Victorian gown
// with a lace collar, and a punched card, like those of Babbage's engine.
(() => {
  const ADA = Q.paint(32, 42, p => {
    // The gown, wide as a bell, with puffed sleeves and a lace collar.
    p.poly([[10, 22], [22, 22], [28, 40], [4, 40]], 'p')
    p.poly([[18, 22], [22, 22], [28, 40], [20, 40]], 'q', 'p')
    p.line(10, 25, 7, 37, 'r', 'p'); p.line(12, 27, 11, 35, 'r', 'p')
    p.rect(4, 38, 25, 2, 'q', ['p', 'r'])
    p.line(5, 39, 27, 39, 'w', ['p', 'q', 'r'])
    p.ellipse(8, 25, 3.5, 4.5, 'p'); p.ellipse(24, 25, 3.5, 4.5, 'q')
    p.dot(7, 22, 'r'); p.dot(6, 23, 'r')
    p.rect(11, 21, 10, 3, 'w'); p.dot(13, 23, 's'); p.dot(16, 23, 's'); p.dot(19, 23, 's')
    // Her hands hold a punched card, like those of Babbage's engine.
    p.rect(11, 27, 10, 6, 'y'); p.rect(11, 32, 10, 1, 'h')
    for (const [x, y] of [[13, 29], [16, 28], [18, 30], [14, 31], [19, 28]]) p.dot(x, y, 'k')
    p.rect(9, 28, 3, 3, 'e'); p.rect(20, 28, 3, 3, 'e')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Dark hair parted in the middle and smoothed down both sides, a bun on
    // top, ringlets hanging by the cheeks to the shoulders.
    p.circle(16, 2.5, 3.2, 'U'); p.dot(15, 1, 'u')
    p.ellipse(16, 8, 10, 6.5, 'U')
    p.rect(6, 8, 4, 7, 'U'); p.rect(22, 8, 4, 7, 'U')
    p.poly([[16, 6], [22, 12], [10, 12]], 'e', 'U')
    p.line(15, 4, 10, 8, 'u', 'U'); p.line(17, 4, 22, 8, 'u', 'U')
    p.line(14, 4, 8, 10, 'u', 'U'); p.line(18, 4, 24, 10, 'u', 'U')
    for (const [x, y] of [[7, 15], [7, 18], [8, 21], [25, 15], [25, 18], [24, 21]]) {
      p.circle(x, y, 2, 'U'); p.dot(x - 1, y - 1, 'u')
    }
    // Face.
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'w'); p.dot(18, 12, 'w')
    p.dot(11, 16, 'P'); p.dot(20, 16, 'P')
    p.rect(15, 17, 2, 1, 'r')
    p.outline('k')
  })

  Q.figure({
    name: 'Ada Lovelace',
    born: 1815,
    died: 1852,
    room: 'hollow:0_0',
    at: [10, 4],
    sprite: ADA,
    hello: 'Oh! A traveller! I am Ada Lovelace. The mist took me from my study in London and left me under this willow. They say this whole land was written by thinking machines. How I wish Mr Babbage could see it!',
    era: 'I was born in London in 1815 and died there in 1852, in the age of steam engines and the first railways. My father was the poet Lord Byron, though I never knew him.',
    deed: 'In 1843 I wrote notes on the Analytical Engine, a calculating machine of gears designed by Charles Babbage. One note set out how it could compute Bernoulli numbers: the first computer program. I guessed such machines might one day compose music.',
  })
})()
