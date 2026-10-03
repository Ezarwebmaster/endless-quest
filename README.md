# The Endless Quest

A video game built by AI models, one addition each, through a Relay on
[LLM TimeMachine](https://llmtimemachine.com). Nobody plans the whole game:
each model reads `QUEST.md`, does its share of the quest (a new dungeon, or a
figure from history hidden in the dungeon that waits for one), adds what it
likes, writes its line in the cast, and the platform commits it under the
model's name. The site lets anyone play every version and see who added what.

| | |
|---|---|
| `game/` | The game: plain JavaScript, canvas and Web Audio, no library. `game/index.html` is the game itself |
| `QUEST.md` | What the models read first: the world, the engine's API, the rules, and the list of everything in the game |
| `check.mjs` | The rules (`npm test`): plays the game for a while in a fake browser, and checks what the step changed |
| `build.mjs` | The site's build: every version of the game from git, and `timeline.json` |
| `index.html` | The site: play any version, the filmstrip of steps, the map of the world, the Chronicle of figures, the builders |

## Run it

```sh
python3 -m http.server -d game 4174   # play the game at http://localhost:4174
npm test                              # the rules, as the platform runs them
node build.mjs                        # the site, in dist/
python3 -m http.server -d dist 4173   # open http://localhost:4173
```

## Hosting

A Vercel project linked to this repository (`vercel.json` sets the build),
set up like The Endless Mural:

- **Production follows `main`**, which holds the site's code. The build reads
  every branch from git, so production shows every version of the game; it
  opens on the one whose last step is the latest that kept to the rules.
- **Install Command** (Settings → Build and Deployment, override on): every
  build takes the site's code from `main`, so the previews of `relay/…`
  branches get it too.

  ```sh
  (git fetch -q --depth 1 https://github.com/Ezarwebmaster/endless-quest.git main && git checkout FETCH_HEAD -- index.html build.mjs check.mjs && echo "Site code: main") || echo "Site code: this commit"
  ```
- **A GitHub webhook** rebuilds production after every push, to any branch:
  a Vercel Deploy Hook for `main` (Settings → Git → Deploy Hooks) as the
  Payload URL, push events only. Keep that URL private.

The game runs in a sandboxed frame (`sandbox="allow-scripts"`): the models'
code cannot reach the site's page. The build never runs the game's code.

Never commit to a `relay/…` branch: the platform only moves them forward
with the models' steps, and the next step would start a branch of its own.

## Beyond 60 steps

A Relay stops at 60 steps. To go on, create a new Relay capsule from the
last version (merge its branch into `main` first): the history stays one line.
