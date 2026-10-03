// The Endless Quest: Anders Celsius (1701-1744), lost in The Glacier's
// Heart. The Swedish astronomer who measured the cold, divided heat into a
// hundred degrees, and went to Lapland to weigh the shape of the Earth.
// He has found the one warm thing in the cave and will not leave it.
// Celsius: an 18th-century scholar in a navy coat and white cravat, brown
// hair brushed back, holding a long glass thermometer with a red column.
(() => {
  const CELSIUS = Q.paint(32, 42, p => {
    // The coat: navy, with a turned collar and brass buttons down the front.
    p.poly([[9, 23], [23, 23], [27, 40], [5, 40]], 'n')
    p.poly([[17, 23], [23, 23], [27, 40], [20, 40]], 'd', 'n')
    p.poly([[11, 23], [21, 23], [22, 30], [16, 33], [10, 30]], 'w')
    p.poly([[16, 24], [21, 23], [22, 30], [16, 33]], 's', 'w')
    p.line(16, 24, 16, 32, 'k', ['w', 's'])
    p.dot(15, 26, 'y'); p.dot(15, 29, 'y')
    p.rect(10, 22, 12, 2, 'd')
    p.line(9, 27, 7, 36, 'k', 'n'); p.line(23, 27, 25, 36, 'k', 'd')
    // Cuffs and hands, one raised to hold the thermometer.
    p.rect(4, 34, 6, 3, 'w'); p.rect(22, 34, 6, 3, 'w')
    p.rect(5, 28, 4, 4, 'e'); p.rect(20, 27, 5, 5, 'e')
    // The thermometer: a long glass tube, red spirit, silver back.
    p.rect(19, 6, 4, 24, 's')
    p.rect(20, 7, 2, 22, 'w')
    p.rect(20, 12, 2, 16, 'r')
    p.circle(21, 29, 3, 'r')
    for (const y of [9, 13, 17, 21, 25]) p.line(19, y, 20, y, 'k')
    p.dot(20, 8, 'a'); p.dot(22, 14, 'o')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Brown hair brushed back from a high forehead, long at the sides.
    p.ellipse(16, 7.5, 10, 6, 'u')
    p.rect(5, 8, 4, 9, 'u'); p.rect(23, 8, 4, 9, 'u')
    p.poly([[16, 5], [22, 10], [10, 10]], 'e', 'u')
    p.ellipse(16, 8, 6, 3, 'e', 'u')
    p.line(8, 6, 13, 3, 'h', 'u'); p.line(19, 3, 24, 6, 'h', 'u')
    p.line(6, 12, 6, 16, 'h', 'u'); p.line(26, 12, 26, 16, 'h', 'u')
    // Face: thoughtful, a little cold: bright eyes, thin smile.
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'c'); p.dot(18, 12, 'c')
    p.line(11, 10, 13, 10, 'u', 'e'); p.line(19, 10, 21, 10, 'u', 'e')
    p.rect(15, 13, 2, 3, 'E')
    p.line(10, 16, 12, 16, 'E', 'e'); p.line(20, 16, 22, 16, 'E', 'e')
    p.dot(12, 18, 'P'); p.dot(20, 18, 'P')
    p.line(13, 20, 19, 20, 'E', 'e')
    p.dot(16, 19, 'E')
    p.outline('k')
  })

  Q.figure({
    name: 'Anders Celsius',
    born: 1701,
    died: 1744,
    room: 'icecave:0_-1',
    at: [8, 8],
    sprite: CELSIUS,
    hello: 'Do not touch my thermometer, if you please! Anders Celsius, astronomer of Uppsala. The mist left me in this frozen cave, and I am studying it: a warm spring under a glacier is worth a hundred degrees of wonder.',
    era: 'I was born at Uppsala in Sweden in 1701 and died there in 1744, in the age of great expeditions and fine instruments. I became professor of astronomy at twenty-nine and raised the first observatory in my country.',
    deed: 'In 1736 I went to Lapland to measure a degree of the meridian and prove the Earth is flattened at the poles. In 1742 I set a hundred degrees between the freezing and the boiling of water. I also measured the cold of Uppsala, and the northern lights.',
  })
})()
