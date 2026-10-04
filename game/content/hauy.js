// The Endless Quest: Rene Just Hauy (1743-1822), lost in the Chamber of
// Echoes. The French mineralogist who found, by accident, that a crystal is
// built of little molecules stacked in layers, and who is called the father
// of modern crystallography. He has brought a specimen of Iceland spar into
// the singing cave, and he will not have it broken by anyone careless.
// Hauy: an 18th-century French scholar in a dark green frock coat with a
// white cravat, powdered grey hair, holding a pale calcite rhombohedron.
(() => {
  const HAUY = Q.paint(32, 42, p => {
    // The frock coat: dark green, buttoned down the front, with a wide cuff.
    p.poly([[9, 23], [23, 23], [27, 40], [5, 40]], 't')
    p.poly([[17, 23], [23, 23], [27, 40], [20, 40]], 'v', 't')
    p.poly([[11, 23], [21, 23], [22, 30], [16, 33], [10, 30]], 'w')
    p.poly([[16, 24], [21, 23], [22, 30], [16, 33]], 's', 'w')
    p.line(16, 24, 16, 32, 'k', ['w', 's'])
    p.dot(15, 26, 'y'); p.dot(15, 29, 'y')
    p.rect(10, 22, 12, 2, 'G')
    p.line(9, 27, 7, 36, 'k', 't'); p.line(23, 27, 25, 36, 'k', 'v')
    p.rect(3, 34, 7, 3, 'w'); p.rect(22, 34, 7, 3, 'w')
    // Hands: one at his side, one holding the specimen up to the light.
    p.rect(5, 29, 4, 4, 'e'); p.rect(4, 28, 4, 4, 'E')
    p.rect(21, 26, 6, 5, 'e'); p.rect(22, 27, 5, 4, 'E')
    // The specimen: a pale rhombohedron of Iceland spar, edges glinting.
    p.poly([[24, 15], [29, 19], [26, 26], [21, 22]], 's')
    p.poly([[24, 15], [27, 17], [24, 24], [21, 22]], 'w', 's')
    p.poly([[24, 15], [29, 19], [27, 17]], 'a')
    p.line(21, 22, 24, 15, 'k', 's'); p.line(26, 26, 29, 19, 'k', 's')
    // The head: big, like the hero's.
    p.ellipse(16, 12, 9, 8.5, 'e')
    // Powdered grey hair, brushed back and puffed at the sides.
    p.ellipse(16, 7, 10, 6, 's')
    p.rect(5, 8, 4, 8, 's'); p.rect(23, 8, 4, 8, 's')
    p.rect(5, 13, 4, 4, 's'); p.rect(23, 13, 4, 4, 's')
    p.poly([[16, 4], [22, 10], [10, 10]], 'e', 's')
    p.ellipse(16, 8.5, 6, 3, 'e', 's')
    p.line(7, 5, 12, 3, 'w', 's'); p.line(20, 3, 25, 5, 'w', 's')
    p.line(6, 11, 6, 15, 's', 's'); p.line(26, 11, 26, 15, 's', 's')
    // Face: bright, patient eyes; the smile of a man reading a stone.
    p.rect(12, 12, 2, 3, 'k'); p.rect(18, 12, 2, 3, 'k')
    p.dot(12, 12, 'b'); p.dot(18, 12, 'b')
    p.line(11, 10, 13, 10, 'u', 'e'); p.line(19, 10, 21, 10, 'u', 'e')
    p.rect(15, 13, 2, 3, 'E')
    p.line(10, 16, 13, 16, 'E', 'e'); p.line(19, 16, 22, 16, 'E', 'e')
    p.dot(12, 18, 'P'); p.dot(20, 18, 'P')
    p.outline('k')
  })

  Q.figure({
    name: 'Rene Just Hauy',
    born: 1743,
    died: 1822,
    room: 'crystal:0_-1',
    at: [7, 7],
    sprite: HAUY,
    hello: 'Rene Just Hauy, mineralogist of France. The mist set me in this singing cave, and it has given me a piece of Iceland spar. Do not strike it carelessly: a crystal splits along its own planes, and every plane is a law of nature.',
    era: 'I was born at Saint-Just-en-Chaussee in France in 1743, and I died in Paris in 1822, in the age of revolutions and the first great museums. I gave my four volumes on mineralogy to the world in 1801.',
    deed: 'In 1784 a piece of calcareous spar broke in my hands and showed me a plane as smooth as a mirror. I went on dividing crystals until each fell to its smallest piece, and called that piece the integrant molecule. Every mineral has one fixed form, and I set them all down in 1801.',
  })
})()