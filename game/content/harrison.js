// The Endless Quest: John Harrison (1693-1776), lost in the Shrine of the
// Tide. The Yorkshire carpenter and clockmaker whose sea clocks kept the
// longitude, so that a ship's master could know where he was in the middle
// of the ocean. Lost on a coast he once helped to chart, with the brass box
// of his chronometer still in his hands.
// Harrison: a weathered old man under long white hair, a brown working
// waistcoat and rolled sleeves, holding a small brass box with a dial.
(() => {
  const HARRISON = Q.paint(32, 42, p => {
    // A worn waistcoat over a loose shirt, sleeves rolled for the bench.
    p.poly([[9, 23], [23, 23], [28, 40], [4, 40]], 'u')
    p.poly([[17, 23], [23, 23], [28, 40], [19, 40]], 'U', 'u')
    p.poly([[12, 23], [20, 23], [21, 31], [16, 34], [11, 31]], 'w')
    p.poly([[16, 24], [20, 23], [21, 31], [16, 34]], 's', 'w')
    p.line(16, 24, 16, 33, 'k', ['w', 's'])
    p.poly([[13, 23], [19, 23], [20, 27], [16, 31], [12, 27]], 'w')
    p.dot(16, 25, 'U'); p.dot(16, 29, 'U')
    p.rect(11, 22, 10, 2, 's')
    p.line(9, 27, 7, 37, 'k', 'u'); p.line(23, 27, 25, 37, 'k', 'U')
    p.rect(6, 36, 20, 3, 'U', 'u'); p.rect(8, 36, 3, 2, 'h'); p.rect(21, 36, 3, 2, 'h')
    // Rolled sleeves, and the hands holding the brass sea clock.
    p.rect(3, 27, 4, 8, 'w'); p.rect(25, 27, 4, 8, 'w')
    p.rect(3, 33, 4, 2, 's'); p.rect(25, 33, 4, 2, 's')
    p.rect(7, 32, 5, 5, 'e'); p.rect(20, 32, 5, 5, 'e')
    p.rect(10, 30, 12, 9, 'U')
    p.rect(11, 31, 10, 7, 'h')
    p.line(11, 31, 20, 31, 'y')
    p.circle(16, 34, 4, 'u'); p.circle(16, 34, 3, 'y'); p.circle(16, 34, 2, 'w')
    p.line(16, 34, 18, 32, 'k')
    p.dot(20, 33, 'h'); p.dot(12, 36, 'h')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Long white hair, thin and falling past the shoulders.
    p.ellipse(16, 8, 10, 6.5, 'w')
    p.rect(5, 8, 4, 11, 'w'); p.rect(23, 8, 4, 11, 'w')
    p.line(5, 19, 5, 23, 's'); p.line(26, 19, 26, 23, 's')
    p.circle(6, 24, 2, 'w'); p.circle(25, 24, 2, 'w')
    p.poly([[16, 6], [22, 12], [10, 12]], 'e', 'w')
    p.ellipse(16, 8.5, 6, 3.5, 'e', 'w')
    p.poly([[16, 2], [22, 7], [10, 7]], 'w', ['w', 's'])
    p.line(11, 4, 14, 2, 's', 'w'); p.line(20, 5, 23, 8, 's', 'w')
    p.dot(16, 9, 'd', 'e')
    // Face: kind, weathered, with deep lines and bright old eyes.
    p.line(11, 10, 13, 10, 'w'); p.line(19, 10, 21, 10, 'w')
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'a'); p.dot(18, 12, 'a')
    p.rect(15, 13, 2, 3, 'E')
    p.line(10, 16, 12, 16, 'E', 'e'); p.line(20, 16, 22, 16, 'E', 'e')
    p.dot(11, 18, 'P'); p.dot(21, 18, 'P')
    p.rect(14, 18, 4, 1, 'r')
    p.line(13, 20, 19, 20, 'E', 'e')
    p.outline('k')
  })

  Q.figure({
    name: 'John Harrison',
    born: 1693,
    died: 1776,
    room: 'brine:0_-1',
    at: [9, 6],
    sprite: HARRISON,
    hello: 'Why, a traveller out of the water! John Harrison, at your service. Fifty years I kept ships on their true course with a clock no bigger than this box, and here the sea has taken me instead. Set my chronometer on the tide hour and I will tell you how I did it.',
    era: 'I was born at Foulby in Yorkshire in 1693, the son of a carpenter, and I died in London in 1776. My whole working life fell in the eighteenth century, the age of sail and long voyages.',
    deed: 'I made clocks that kept true time at sea despite heat, damp and rolling. In 1761 my fourth sea clock, no bigger than a pocket watch, carried a ship to Jamaica and gave the longitude to within a mile or so.',
  })
})()
