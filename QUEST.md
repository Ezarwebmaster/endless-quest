# The Endless Quest

A top-down adventure in a fantasy kingdom, built by AI models one addition
at a time. Nobody plans the whole game: each model adds one thing of its own
choosing. Visitors play every version and see which model added what.

## The world

The kingdom has no name yet, no map and no villain: only Willow Meadow,
where a young traveller with a red scarf wakes up with nothing. Roads leave
the meadow to the north and to the east, into the mist: the lands beyond are
not built yet. Who the traveller is, what threatens the kingdom and what lies
past the mist are for the models to write, one step at a time. What the
others wrote stays true: build on it, never contradict it.

The mist does not only hide the lands nobody has built. It swallows people
from other times, real people from our world's past, and leaves them lost in
the kingdom's dungeons, one in each. Under the old willow of the meadow, in
the Willow Hollow, the traveller can already meet the first of them: Ada
Lovelace. Every figure the traveller finds joins the Chronicle (C).

## How the code is organized

- `game/index.html` loads every script in order: the engine, the palette,
  the cast, then the content. Add a `<script>` line for each new file, at
  the end.
- `game/engine.js`: the engine, one global `Q` (the API below).
- `game/palette.js`: the colours, one character each.
- `game/cast.js`: the cast, one line per model (see "The cast").
- `game/content/`: everything in the game, one file per addition, named
  after it (`content/sword.js`, `content/slime.js`). A figure from history
  gets a file of its own (`content/ada.js`), a dungeon too
  (`content/hollow.js`: its name, its tiles, its things).
- `game/content/rooms/X_Y.js`: one room of the world per file, named after
  its place on the world grid; a dungeon's rooms go in a folder named after
  it (`content/rooms/hollow/0_0.js`).
- `content/figures.js` (dungeons, figures, the Chronicle) and
  `content/door.js` (doors and stairs) are the base of the quest.

Plain classic scripts: no modules, no build step, no library, nothing from
the internet, no `fetch` (keep data in the scripts). Wrap each file in
`(() => { … })()` so its names never clash with another file's.

## The screen and the world grid

- The screen is 512 × 448 pixels: a 64-pixel bar at the top (hearts, room
  name), then the room, 16 × 12 tiles of 32 × 32 pixels (512 × 384).
- Rooms sit on a grid. Room `X_Y` is one screen; `X+1_Y` lies east of it and
  `X_Y+1` south. `0_0` is Willow Meadow.
- The hero walks off an edge into the neighbouring room, through any tile
  that is not solid. An opening must line up with the neighbour's (same row
  or column), or it leads into a wall.
- Openings toward rooms nobody has built show mist, and tell the player the
  land is not built yet.
- A dungeon is a grid of its own: its rooms are keyed `grid:X_Y`
  (`hollow:0_0`, `hollow:1_0`…). They join each other by their edges, and
  the world only through doors and stairs (`content/door.js`).
- Positions are pixels inside the room (x 0–512, y 0–384). An entity's x, y
  is the top-left corner of its box.

## The look

Fine pixel art, like a cosy modern pixel game: 32 pixels per tile, a dark
outline around every object and character, two or three shades per colour,
light from the top left, a soft shadow under whatever stands on the ground.
Characters have big heads (about 18 pixels of head on a 30-pixel body), as
the hero does. Every pixel comes from the palette (`game/palette.js`); draw
whole pixels only (`Q.paint`, `Q.sprite`), and keep smooth effects for light
(`Q.glow`).

## Your share of the quest

Every step does its share of the quest, then whatever it likes. `npm test`
says which share is yours: it lists the dungeons and who hides in each.

- **A dungeon waits for its figure**: hide a figure from history in it,
  then add one more thing of your choice anywhere in the game.
- **Every dungeon has its figure**: build a new dungeon and leave it empty
  of figures: the next model hides one there.

**A dungeon** is any place of its own, off the roads, and you choose what
it is: a volcano, a haunted forest, an ice cave, a tower in the clouds, a
sunken temple, a clockwork factory, a crypt… One room or several, with
monsters, puzzles or treasure if you want, in a look of its own (its own
tiles, its own light). It does not have to look like the Willow Hollow:
copy how the Hollow is built, not how it looks. It needs a name
(`Q.dungeon`) and a way in from the world that a player can find: a door, a
stair, a gate, a hole, a path into the trees (`content/door.js`). See
`content/hollow.js` and `content/rooms/hollow/`.

**A figure** is a real person, lost in the kingdom. See `content/ada.js`.
- Someone who died more than 70 years ago: a scientist, an inventor, a
  mathematician, an explorer, a doctor, an artist… scientists and inventors
  above all.
- Never a religious figure, never a political or military leader, never
  anyone known for crimes or hatred, never anyone alive or recently dead.
- Someone famous whose life you know well: every date and every fact they
  tell must be true. They may wonder at the kingdom and the mist; what they
  say of their own life stays history.
- Someone not in the game yet (the engine refuses a second one).
- Drawn so a player knows them at a glance: their famous hair, beard,
  clothes, or the thing they hold (Einstein's white hair and moustache, a
  telescope for Galileo). The look of the game: big head, outline, palette.
- Somewhere in their dungeon a player can reach.

## The cast

`game/cast.js` lists every model that built the game, in the order they
came, and rolls on the title screen. Add your line at the end, never change
the others:
`Q.credit({ by: 'Your name', date: '2026-10-04', did: 'What you added, in one sentence.' })`
`by` is the model you are, as the platform told you; `date` is today, as
`npm test` prints it (YYYY-MM-DD); `did` says what a player will find, in
plain words (under 160 characters). A line's place in the list is its step
number.

## The engine: Q

**Sprites and drawing**
- `Q.paint(w, h, p => …)` → a sprite drawn with shapes, whole pixels only:
  `p.rect`, `p.ellipse`, `p.circle`, `p.line`, `p.poly`, `p.dot`,
  `p.dither`, `p.rows`, then `p.outline('k')`; `p.mirror()` copies the left
  half onto the right. Every shape takes a palette key and may take `only`
  (a key or a list of keys) to paint just over those colours: that is how
  to shade inside a shape. The way to draw anything bigger than a few pixels;
  see content/hero.js and content/tiles.js.
- `Q.sprite(rows)` → a sprite from rows of palette keys, one character per
  pixel (`.` is clear): handy for small things (an icon, a coin).
- `Q.draw(sprite, x, y, flip)`, `Q.drawOn(entity, sprite, flip)` (feet on
  the entity's box), `Q.shadow(entity, width)` (call it first in draw()),
  `Q.glow(x, y, radius, colour, strength)` (a soft light).
- `Q.text(str, x, y, colour, scale, shadow)`: the 5 × 7 pixel font;
  `Q.textWidth(str, scale)`.
- `Q.ctx`: the canvas 2D context, for anything else. Draw in the `draw`
  event (room space) or the `hud` event (screen space).

**Tiles and rooms**
- `Q.tile(ch, { name, sprite, solid })`; or `variants: [sprites]` (picked
  by position, so a field doesn't repeat), `frames: [sprites], fps` to
  animate it, or `draw(x, y, tileX, tileY, map)` to draw it yourself, edges
  toward other tiles included. A sprite taller than 32 stands on its tile
  and rises over the row above (a tree, a tower). `Q.tile(ch, def, 'crypt')`
  makes a tile that exists only in the rooms of the dungeon `crypt`: a
  dungeon can use any character, even one the world uses for something
  else. Any character works, letters with accents too.
- `Q.room('X_Y', { name, map, things, enter(room), update(room, dt), draw(room) })`:
  `map` is 12 strings of 16 tile characters; `things` is a list of
  `[type, tileX, tileY, props]`, spawned on every visit. A dungeon's rooms:
  `Q.room('crypt:0_0', …)`.
- `Q.here`: the current room, `{ key, grid, x, y, def, map, entities }`.
  `Q.tileAt(x, y)`, `Q.setTile(tileX, tileY, ch)` (until the hero leaves),
  `Q.neighbour(dx, dy)`.
- `Q.goto('X_Y', x, y)`: moves the hero to a room at once, with a short
  fade. Usually through a door: `['door', tileX, tileY, { to: 'crypt:0_0', at: [7, 10], face: 'up' }]`.

**Dungeons and figures** (content/figures.js)
- `Q.dungeon('crypt', { name: 'The Sunken Crypt' })`: its rooms are
  `crypt:X_Y`.
- `Q.figure({ name, born, died, room: 'crypt:1_0', at: [tileX, tileY], sprite, hello, era, deed })`:
  `born` and `died` are years (negative before Christ); `hello` is what
  they say first, `era` answers "When did you live?" and `deed` "What did
  you do?", each under 300 characters. The engine spawns them, runs the
  talk and keeps the Chronicle. `Q.figures`, `Q.dungeons`, `Q.met(figure)`.

**Entities**
- `Q.entity(type, { w, h, solid, init(e), update(e, dt), draw(e), touch(e), interact(e), hit(e, damage, from) })`:
  `touch` runs while it overlaps the hero, `interact` when the hero faces
  it and presses act, `hit` when something strikes it.
- `Q.spawn(type, x, y, props)` → the entity, in the current room (rooms
  respawn their things on every visit). `Q.remove(e)`, `Q.all(type)`.
- `Q.move(e, dx, dy)`: moves with collisions (solid tiles, solid entities);
  false when blocked. `Q.blocked(x, y, w, h, self)`.
- `Q.overlap(a, b)`. `Q.strike(box, damage, from)` hits every entity with a
  `hit` handler inside a box: use it for any attack.
- `Q.hero`: the hero, an entity (`dir` is up, down, left or right; `speed`
  in pixels per second).

**The player**
- `Q.state`: `{ hp, maxHp, items, flags }`, hp in half hearts, reset at
  every new game. Add your own fields in a `start` handler.
- `Q.hurt(amount, from)`, `Q.heal(amount)`. At 0 the hero falls and the
  player starts again.
- `Q.give(item, n)`, `Q.has(item, n)`, `Q.take(item, n)`;
  `Q.flag(name, value)` remembers anything for the rest of the game.

**Messages and sound**
- `Q.say(text or [pages], done)`: a message box; the game waits while it is
  open. `Q.ask(text, [choices], pick)`: a message that ends with up to four
  choices; `pick(index, label)` runs. `Q.toast(text, seconds)`: a short
  line that does not stop the game.
- `Q.overlay({ update(dt), draw() })`: a full screen over the paused game
  (a map, an inventory); `update` returns false to close it.
- `Q.sfx(name, def)`, `Q.play(name)`, `Q.beep({ wave, freq, to, dur, vol, delay })`;
  `Q.audio()` → the AudioContext, null until the player pressed a key.

**Input and events**
- `Q.down(action)`, `Q.pressed(action)`: the actions are left, right, up,
  down, act, alt and book. `Q.keys` maps `KeyboardEvent.code` to actions;
  add your own (`Q.keys.KeyI = 'inventory'`).
- `Q.on(event, fn)`, `Q.emit(event, …)`: `boot` (once, every script loaded:
  check your content there), `start`, `enter(room)`,
  `update(dt)`, `draw` (room space, over the entities), `hud` (screen
  space), `act`, `alt`, `hurt(amount, from)`, `death`, `give(item, n)`. An
  `act` handler that used the key returns true, so the others don't react.
- `Q.time` in seconds, `Q.mode`: title, play or over.

## Controls

Arrows or WASD to move, Space or J to act (read, talk, open, and whatever
else act comes to mean), K for a second action, C for the Chronicle (on the
title screen, the cast). Never change what an existing key does.

## The rules

`npm test` checks them; a step that breaks one is marked broken.
1. The game must still start and run: `npm test` plays it for a while
   (every room, every figure, falling and starting again) in a fake
   browser, and fails on any error.
2. Build on the others' work: never delete or rewrite what they added. Edit
   their files only where your addition hooks in. Never delete a file, and
   remove at most 300 lines.
3. Work inside game/ and QUEST.md only.
4. Nothing from the internet: no http(s) links, no CDN, no npm package.
5. Add one line about your addition to "What's in the game" below: what it
   is and where a player finds it.
6. Do your share of the quest (a figure, or a new dungeon) and add your
   line to the cast.

## What's in the game

- The engine: rooms on a grid, tiles, entities, messages, sounds and hearts.
- The hero: a traveller with a red scarf who walks in four directions, unarmed.
- Willow Meadow (0_0): trees, a pond, flowers, a boulder, the old willow, and roads north and east into the mist.
- A wooden sign by the road in Willow Meadow, which greets the traveller.
- Doors and stairs (content/door.js): touch one and the hero goes to another room.
- The Willow Hollow (hollow:0_0), the first dungeon: a cave among the roots of the old willow, lit by glowing mushrooms. The way in is the hollow at the foot of the willow.
- Ada Lovelace (1815-1852), the first figure from history: at her desk in the Willow Hollow.
- The Chronicle (C): every figure the traveller has met, and where the others are lost.
- The cast (game/cast.js): every model that built the game, rolling on the title screen.
- Starglass Glade (1_0): the eastern road from Willow Meadow reaches a blue-domed tower; signs in both meadows point the way.
- Starglass Tower (starglass:0_0 and starglass:0_-1): light three numbered lanterns in order to open the stairs, with progress remembered for the current game.
- The Waiting Observatory (starglass:0_-1): a brass telescope, an empty blue chair and starry windows, left without a figure for the next model; clear floor at [5, 4] is available for their arrival.
- Caroline Herschel (1750-1848), the second figure from history: in the Waiting Observatory of Starglass Tower, beside her telescope.
- Comet sweeping (content/comets.js): once Caroline is found, use the telescope in the Waiting Observatory, steer the lens with the arrows, press Space or J on three comets to earn an extra heart; K puts it down.
- Copper Ridge (0_-1): the northern road from Willow Meadow climbs past pine crags and boulders to a grand arched portal embedded in the cliff; a signpost points the way.
- The Clockwork Vault (clockwork:0_0 and clockwork:0_-1): turn three brass pressure regulator levers in The Gearworks to unlock the gate to the upper chamber.
- The Master Atelier (clockwork:0_-1): a workshop of ticking machinery under the swinging pendulum of the Great Chronometer, with a drafting desk, an automaton owl, and clear floor at [7, 4] waiting for the next figure from history.
- Charles Babbage (1791-1871), the third figure from history: at the drafting desk in the Master Atelier of the Clockwork Vault, turning a brass gear.
- The Difference Engine (content/difference-engine.js): once Babbage is found, turn the crank of the brass calculating machine in the Master Atelier to compute a table of squares and earn an extra heart.
- Saltmarsh Shore (-1_0): the western road from Willow Meadow reaches the sea, where an old sea wall runs into the water; a tide gate set in it is the way down.
- The Sunken Temple (brine:0_0 and brine:0_-1): a drowned hall of wet flagstone under the shore. Light the three sunken braziers, in any order, and the water drains and the Tide Gate opens.
- The Shrine of the Tide (brine:0_-1): the dry heart of the temple, with a stone altar and clear floor around it left empty for the next figure from history.
- Tide wisps (content/brine.js): pale jellies of light that drift over the flooded hall and sting the traveller; face one and press Space or J to disperse its spray.
- John Harrison (1693-1776), the fourth figure from history: at the dry altar of the Shrine of the Tide, with the brass sea clock in his hands.
- The sea clock (content/chronometer.js): once Harrison is found, set the hands of his chronometer to the tide hour in his tide table; the first tide hour kept earns an extra heart.
- The Glacier's Heart (icecave:0_0 and icecave:0_-1): north from Copper Ridge along the mountain road, a frozen cave of ice walls and hanging waterfalls. A warm spring steams in its deep chamber, drifted over by frost motes.
- Anders Celsius (1701-1744), the fifth figure from history: at the warm spring at the heart of The Glacier's Heart, thermometer in hand.
- The Minstrel's Airs (content/music.js): quiet music that plays on its own, a different air for the meadow, each dungeon and the title screen.
- The South Hollow (0_1): a meadow path south of Willow Meadow, the long grass parting around a dark mouth in the hillside.
- The Crystal Caverns (crystal:0_0 and crystal:0_-1): a cave of dark stone and singing crystals, south of the meadow. Light the three crystal pedestals and the crystal door slides open.
- The Chamber of Echoes (crystal:0_-1): the inner heart of the caverns, its floor swept clean and crystals singing in the hall above, left empty for the next figure from history.
- Fixed: the western road from Willow Meadow now lands on open sand at Saltmarsh Shore instead of on a rock, and John Harrison's dates are his true ones (1693-1776).
- Fixed: the Drowned Antechamber's exit now sits in the bottom wall, and the shore door lands the traveller on the bottom walkway clear of it.
- Rene Just Hauy (1743-1822), the sixth figure from history, the father of modern crystallography: in the Chamber of Echoes, at the foot of the Crystal Caverns, with a piece of Iceland spar in his hand.
- Hauy's cleavage table (content/cleavage.js): a slab of dark wood with an iron anvil and a swinging mirror in the Chamber of Echoes. Once Hauy is found, strike the spar while the mirror lies level with its natural face; three clean cleavings free the integrant molecule and earn an extra heart.
- The Windward Rise (1_1): south of Starglass Glade a grassy rise, where a pale stair climbs off the hilltop into the clouds: the way into The Cloudspire.
- The Cloudspire (spire:0_0 and spire:0_-1): a tower above the clouds of pale cloudstone. Turn its three brass weather vanes into the wind, watching the drifting streaks, and the Sky Gate swings open.
- The Orrery Chamber (spire:0_-1): the quiet top room of the spire, its brass rings turning above the clouds, its floor left empty and waiting for the next figure from history.
- Cloud gusts (content/spire.js): little puffs of cloud that drift through the Cloudspire and shove the traveller along; they cannot sting, only push.
- Luke Howard (1772-1864), the seventh figure from history, the man who named the clouds: in the Orrery Chamber at the top of the Cloudspire, with his weather chart in his hands.
- Howard's cloud chart (content/howard.js): three clouds drift under the brass rings of the Orrery Chamber; face one and press Space or J to give it the name Howard gave it (cirrus, cumulus, stratus). Name all three and you gain a heart, and his compass.
- The brass compass (content/compass.js): Howard's gift, drawn in the corner of the screen once you carry it; press K to take it in hand, and its needle settles toward the nearest figure from history you have not met, by the road that leads to that figure's dungeon.
- The Cinder Headland (2_0): a new trail east from Starglass Glade, where the grass gives way to grey ash and a smoking volcano stands with a stair of black rock going down its throat.
- The Emberdeep (volcano:0_0 and volcano:0_-1): the hall under the volcano, where lava runs between banks of basalt. Heave each of the three iron vent lids up three times and the lava runs off and the Slag Gate grinds open.
- Cinder motes (content/volcano.js): embers that drift through the Emberdeep and sting the traveller; face one and press Space or J to fan it out into grey ash.
- The Ember Furnace (volcano:0_-1): the chamber at the heart of the volcano, a great forge still burning at the north wall, its floor swept clean and left empty for the next figure from history.
- A low, smoky air for the Emberdeep (content/music.js), among the Minstrel's airs.
