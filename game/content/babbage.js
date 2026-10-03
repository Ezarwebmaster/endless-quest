// The Endless Quest: Charles Babbage (1791-1871), lost in the Clockwork
// Vault. The mathematician and inventor who designed the Difference Engine
// and the Analytical Engine, the first computers in design. Ada Lovelace
// wrote her famous notes on his machine; here, at last, the two can meet.
// Babbage: a bald crown, grey hair and heavy side-whiskers, a dark coat with
// a white cravat, turning a small brass gear between his hands.
(() => {
  const BABBAGE = Q.paint(32, 42, p => {
    // The coat: dark, high-shouldered, with a white cravat at the throat.
    p.poly([[8, 22], [24, 22], [28, 40], [4, 40]], 'D')
    p.poly([[18, 22], [24, 22], [28, 40], [20, 40]], 'd', 'D')
    p.line(9, 25, 6, 38, 'k', 'D'); p.line(11, 27, 10, 36, 'k', 'D')
    p.line(23, 25, 26, 38, 'k', 'd')
    p.poly([[13, 22], [19, 22], [20, 26], [16, 31], [12, 26]], 'w')
    p.line(12, 24, 16, 30, 's', 'w'); p.line(20, 24, 16, 30, 's', 'w')
    p.dot(16, 25, 's', 'w')
    p.rect(11, 21, 10, 2, 'w')
    // Arms, with a small brass gear held between the hands.
    p.rect(4, 27, 4, 9, 'd'); p.rect(24, 27, 4, 9, 'D')
    p.circle(16, 34, 5, 'U'); p.circle(16, 34, 4, 'h'); p.circle(16, 34, 2, 'y')
    for (const [dx, dy] of [[0, -6], [0, 6], [-6, 0], [6, 0], [-4, -4], [4, -4], [-4, 4], [4, 4]]) p.rect(15 + dx, 33 + dy, 2, 2, 'h')
    p.dot(16, 34, 'd')
    p.rect(8, 33, 4, 4, 'e'); p.rect(20, 33, 4, 4, 'e')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Grey hair on top, a bald crown, and the great side-whiskers.
    p.ellipse(16, 8, 10, 6.5, 's')
    p.rect(6, 8, 4, 8, 's'); p.rect(22, 8, 4, 8, 's')
    p.line(7, 15, 7, 19, 's'); p.line(25, 15, 25, 19, 's')
    p.ellipse(16, 8.5, 6.5, 4, 'e', 's')
    p.poly([[16, 4], [21, 8], [11, 8]], 'e', ['s'])
    p.poly([[11, 11], [13, 11], [13, 16], [10, 22], [8, 18], [8, 13]], 's')
    p.poly([[21, 11], [19, 11], [19, 16], [22, 22], [24, 18], [24, 13]], 's')
    p.line(9, 13, 9, 21, 'd', 's'); p.line(23, 13, 23, 21, 'd', 's')
    // Face: keen eyes, grey brows, a strong nose.
    p.line(11, 10, 13, 10, 'd'); p.line(19, 10, 21, 10, 'd')
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'w'); p.dot(18, 12, 'w')
    p.rect(15, 13, 2, 3, 'E')
    p.dot(11, 16, 'P'); p.dot(20, 16, 'P')
    p.rect(14, 18, 4, 1, 'r')
    p.outline('k')
  })

  Q.figure({
    name: 'Charles Babbage',
    born: 1791,
    died: 1871,
    room: 'clockwork:0_-1',
    at: [7, 4],
    sprite: BABBAGE,
    hello: 'Good heavens, a visitor! Charles Babbage, at your service. The mist plucked me from my workshop and set me down among these ticking walls. An atelier of brass and escapements, and no engine to compute with! Ada would have loved this place.',
    era: 'I was born in London in 1791 and died there in 1871, in the age of steam and the first railways. For eleven years I held the Lucasian Chair of Mathematics at Cambridge, the seat Isaac Newton once held.',
    deed: 'I designed two calculating engines. The Difference Engine, begun in 1822, was to print faultless mathematical tables by turning a crank. The Analytical Engine, drawn from 1837, was to be a general machine, fed on punched cards, with a mill and a store: the first computer ever designed.',
  })
})()
