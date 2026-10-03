#!/usr/bin/env node
// The site's build (Vercel runs it, see vercel.json): the page, every version
// of the game as files to play, and timeline.json, read from git itself.
// Each commit LLM TimeMachine made is a step: who built it (the commit's
// author, set to the model), what it says it did (the commit message, and its
// line in QUEST.md), what it changed, and whether it kept to the rules: the
// ones a diff can show (check.mjs), and what `npm test` gave when the platform
// played the step (the commit's Checks: and Broken: lines). The game's code
// never runs here. Every branch is read; GitHub's API is never called.
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { changeProblems, linkProblems, questItems } from './check.mjs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
const tryGit = (...args) => { try { return git(...args) } catch { return '' } }
const ok = (...args) => { try { git(...args); return true } catch { return false } }
const OUT = 'dist'
const VIA = /\s*\(via LLM TimeMachine\)\s*$/

const remote = tryGit('remote', 'get-url', 'origin').trim()
const fromRemote = remote.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/)
const repo = {
  owner: process.env.VERCEL_GIT_REPO_OWNER || fromRemote?.[1] || null,
  name: process.env.VERCEL_GIT_REPO_SLUG || fromRemote?.[2] || null,
}

// Hosts clone shallow and with one branch: fetch the full history and the
// others. When the checkout has no usable origin, the public repo serves.
const sources = [remote && 'origin', repo.owner && repo.name && `https://github.com/${repo.owner}/${repo.name}.git`].filter(Boolean)
const shallow = () => tryGit('rev-parse', '--is-shallow-repository').trim() === 'true'
const source = sources.find(src => ok('fetch', '--quiet', ...(shallow() ? ['--unshallow'] : []), src, '+refs/heads/*:refs/remotes/origin/*'))
console.log(source ? `Fetched every branch from ${source}.` : 'Could not fetch the other branches: only the checkout is shown.')

const refs = tryGit('for-each-ref', '--format=%(refname)', 'refs/remotes/origin', 'refs/heads').split('\n')
  .filter(r => r && !r.endsWith('/HEAD'))
const branchName = r => r.replace(/^refs\/(remotes\/origin|heads)\//, '')
const current = process.env.VERCEL_GIT_COMMIT_REF || tryGit('rev-parse', '--abbrev-ref', 'HEAD').trim() || 'main'

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

// ------------------------------------------------------------ the versions
const blobs = new Map()
const blob = id => { if (!blobs.has(id)) blobs.set(id, execFileSync('git', ['cat-file', 'blob', id], { maxBuffer: 64 * 1024 * 1024 })); return blobs.get(id) }
const versions = {}
// The dungeons and the figures from history a script declares, read from its
// text (comments left out); the code itself never runs here.
function questOf(text, dungeons, figures) {
  const code = text.replace(/^\s*\/\/.*$/gm, '')
  for (const m of code.matchAll(/\bQ\.dungeon\(\s*(['"`])([a-z][a-z0-9-]*)\1\s*,\s*\{[^}]*?\bname:\s*(['"`])(.{1,60}?)\3/g)) dungeons.push({ id: m[2], name: m[4] })
  for (const chunk of code.split(/\bQ\.figure\(\s*\{/).slice(1)) {
    const str = k => chunk.match(new RegExp(`\\b${k}:\\s*(['"\`])(.{1,80}?)\\1`))?.[2] ?? null
    const num = k => { const m = chunk.match(new RegExp(`\\b${k}:\\s*(-?\\d{1,4})\\b`)); return m ? Number(m[1]) : null }
    const name = str('name')
    if (name) figures.push({ name, born: num('born'), died: num('died'), room: str('room') })
  }
}
// Writes game/ as it was at a commit to dist/v/<sha>/, and lists its rooms,
// its dungeons and its figures.
function version(sha) {
  if (versions[sha]) return versions[sha]
  const rooms = [], dungeons = [], figures = []
  for (const line of tryGit('ls-tree', '-r', sha, '--', 'game/').split('\n').filter(Boolean)) {
    const [meta, path] = line.split('\t')
    const id = meta.split(' ')[2]
    const file = `${OUT}/v/${sha}/${path.slice('game/'.length)}`
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, blob(id))
    const room = path.match(/^game\/content\/rooms\/(-?\d+_-?\d+)\.js$/)
    if (room) {
      const name = blob(id).toString('utf8').match(/\bname:\s*(['"`])(.{1,48}?)\1/)?.[2] || null
      rooms.push({ key: room[1], name })
    }
    if (path.endsWith('.js')) questOf(blob(id).toString('utf8'), dungeons, figures)
  }
  for (const f of figures) f.dungeon = f.room?.split(':')[0] ?? null
  return (versions[sha] = { sha, date: tryGit('show', '-s', '--format=%aI', sha).trim(), rooms, dungeons, figures })
}

// --------------------------------------------------------------- the steps
const commits = {}
function readCommit(sha) {
  if (commits[sha] !== undefined) return commits[sha]
  const [, parent = '', author, date, message] = git('show', '-s', '--format=%H%x1f%P%x1f%an%x1f%aI%x1f%B', sha).split('\x1f')
  if (!VIA.test(author)) return (commits[sha] = null)   // the base, or the site's own code
  const firstParent = parent.trim().split(' ')[0] || null
  const changes = git('diff-tree', '--root', '--no-commit-id', '-r', '--name-status', '--no-renames', sha).split('\n').filter(Boolean)
    .map(l => { const [status, ...p] = l.split('\t'); return { status: status[0], path: p.join('\t') } })
  const numstat = git('diff-tree', '--root', '--no-commit-id', '-r', '--numstat', '--no-renames', sha).split('\n').filter(Boolean)
    .map(l => l.split('\t'))
  const plus = numstat.reduce((n, [a]) => n + (Number(a) || 0), 0)
  const minus = numstat.reduce((n, [, d]) => n + (Number(d) || 0), 0)
  const questBefore = firstParent ? tryGit('show', `${firstParent}:QUEST.md`) : ''
  const questAfter = tryGit('show', `${sha}:QUEST.md`)
  const known = new Set(questItems(questBefore))
  const texts = changes.filter(c => c.status !== 'D').map(c => ({ path: c.path, text: tryGit('show', `${sha}:${c.path}`) }))
  const problems = [...changeProblems({ changes, removed: minus, questBefore, questAfter }), ...linkProblems(texts)]
  const lines = message.trim().split('\n')
  const trailer = key => lines.find(l => l.startsWith(`${key}:`))?.slice(key.length + 1).trim() || null
  const checks = trailer('Checks')
  if (trailer('Broken') === 'yes' || checks === 'failed' || checks === 'timed out') {
    problems.unshift(`npm test ${checks === 'timed out' ? 'timed out' : 'failed'} when LLM TimeMachine played this step`)
  }
  const tail = lines.findIndex(l => /^(Model|Capsule|Checks|Broken):/.test(l))
  const changelog = lines.slice(1, tail === -1 ? undefined : tail).join('\n').trim()
  const v = version(sha)
  const was = firstParent ? version(firstParent) : { dungeons: [], figures: [] }
  return (commits[sha] = {
    sha,
    parent: firstParent,
    author: author.replace(VIA, ''),
    date,
    subject: lines[0] || '',
    changelog: changelog === '(no changelog)' ? '' : changelog,
    model: lines.find(l => l.startsWith('Model:'))?.slice(6).trim() || null,
    capsule: lines.find(l => l.startsWith('Capsule:'))?.slice(8).trim() || null,
    checks,
    added: questItems(questAfter).filter(i => !known.has(i)),
    files: changes,
    plus,
    minus,
    rooms: v.rooms,
    dungeons: v.dungeons,
    figures: v.figures,
    builtDungeons: v.dungeons.filter(d => !was.dungeons.some(o => o.id === d.id)).map(d => d.id),
    hidFigures: v.figures.filter(f => !was.figures.some(o => o.name === f.name)).map(f => f.name),
    passed: !problems.length,
    problems,
  })
}

// The checkout itself counts as the current branch: a host may build a detached HEAD.
let branches = [...refs.map(ref => ({ ref, name: branchName(ref) })), { ref: 'HEAD', name: current }].map(({ ref, name }) => {
  const chain = tryGit('rev-list', '--reverse', '--first-parent', ref).split('\n').filter(Boolean)
  const first = chain.findIndex(sha => readCommit(sha))
  const steps = first === -1 ? [] : chain.slice(first).map(readCommit).filter(Boolean).map(c => c.sha)
  // The base: the version the first step started from (or the tip, before any step).
  const base = first === -1 ? chain.at(-1) : chain[first - 1] ?? null
  return { name, base: base ?? null, steps }
}).filter(b => b.base || b.steps.length)
// One entry per name (a local and a fetched copy: the further one, since
// branches only move forward). Then drop a branch that another one simply
// continues (a pull-request branch, or a line built further), unless what
// comes after broke a rule: a broken step gets a branch of its own, and the
// line it left must stay visible. Of two branches with the same steps, keep
// the Relay's main line.
const byName = new Map()
for (const b of branches) if (!byName.has(b.name) || b.steps.length > byName.get(b.name).steps.length) byName.set(b.name, b)
branches = [...byName.values()]
const prefixOf = (a, b) => a.steps.length < b.steps.length && a.steps.every((s, i) => b.steps[i] === s)
const same = (a, b) => a.steps.length === b.steps.length && a.steps.every((s, i) => b.steps[i] === s)
const continues = (a, b) => prefixOf(a, b) && b.steps.slice(a.steps.length).every(s => commits[s]?.passed)
const isMain = b => /(^|\/)main$/.test(b.name)
const preferred = (o, b) => (isMain(o) && !isMain(b)) || (isMain(o) === isMain(b) && o.name < b.name)
// The deployed branch leads when it holds steps (the preview of a branch
// shows that branch). Production builds main, which holds none: the version
// whose last step is the latest one that kept to the rules leads then, the
// one being built on.
const deployed = branches.find(b => b.name === current && b.steps.length) ?? null
branches = branches.filter(b => b === deployed || !branches.some(o =>
  o !== b && (continues(b, o) || (same(b, o) && (o === deployed || preferred(o, b))))))
const tip = b => commits[b.steps.at(-1)]
const lead = deployed ?? branches.filter(b => b.steps.length && tip(b)?.passed)
  .sort((a, b) => Date.parse(tip(b).date) - Date.parse(tip(a).date) || b.steps.length - a.steps.length)[0] ?? null
branches.sort((a, b) => (a === lead ? -1 : b === lead ? 1 : b.steps.length - a.steps.length || a.name.localeCompare(b.name)))
for (const b of branches) if (b.base) version(b.base)

for (const f of ['index.html']) cpSync(f, `${OUT}/${f}`)
const used = new Set(branches.flatMap(b => b.steps))
writeFileSync(`${OUT}/timeline.json`, JSON.stringify({
  builtAt: new Date().toISOString(),
  repo,
  current,
  branches,
  bases: Object.fromEntries(branches.filter(b => b.base).map(b => [b.base, versions[b.base]])),
  commits: Object.fromEntries(Object.entries(commits).filter(([sha, c]) => c && used.has(sha))),
}))
console.log(`Built ${OUT}/: ${branches.length} branch(es), ${used.size} step(s), ${Object.keys(versions).length} playable version(s). Current branch: ${current}.`)
