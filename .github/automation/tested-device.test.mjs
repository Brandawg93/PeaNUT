import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { parseReport, publishApprovedDevice, publishWiki, updateWiki } from './tested-device.mjs'

const exec = promisify(execFile)
const body = `### Manufacturer

CyberPower

### Model

VP1000ELCD

### Driver

usbhid-ups

### Status

✅ Fully Operational

### Notes

Serial number reports 0.
Self tests do not work.`
const wiki = `Please add tested devices below.

Manufacturer | Model | Driver | Status | Notes |
------------ | ----- | ------ | ------ | ----- |
CPS | CP1500PFCLCD | usbhid-ups | ✅ | Existing note |
APC | Back-UPS BX750MI | usbhid-ups | ✅ | |

Keep this footer.
`
const issueUrl = 'https://github.com/Brandawg93/PeaNUT/issues/500'

test('parses the form, including Windows line endings, multiline notes, and the CPS alias', () => {
  assert.deepEqual(parseReport(body.replaceAll('\n', '\r\n')), {
    manufacturer: 'CPS',
    model: 'VP1000ELCD',
    driver: 'usbhid-ups',
    status: '✅',
    notes: 'Serial number reports 0.\nSelf tests do not work.',
  })
})

test('allows absent and unanswered optional notes, and all three operational statuses', () => {
  for (const [status, emoji] of [
    ['✅ Fully Operational', '✅'],
    ['⚠️ Partially Operational', '⚠️'],
    ['❌ Not Operational', '❌'],
  ]) {
    const report = parseReport(body.split('### Notes')[0].replace('✅ Fully Operational', status))
    assert.equal(report.notes, '')
    assert.equal(report.status, emoji)
  }
  assert.equal(parseReport(`${body.split('### Notes')[0]}### Notes\n\n_No response_`).notes, '')
})

test('rejects free-text reports, missing fields, duplicate headings, and invalid driver/status values', () => {
  for (const invalid of [
    'Brand: APC\nModel: BX2200MI',
    body.replace('VP1000ELCD', '_No response_'),
    `${body}\n### Model\nAnother model`,
    body.replace('usbhid-ups', '$(touch /tmp/injected)'),
    body.replace('✅ Fully Operational', 'Works'),
    body.replace('VP1000ELCD', 'Two\nModels'),
  ]) {
    assert.throws(() => parseReport(invalid))
  }
})

test('preserves headings inside a fenced note as text', () => {
  assert.match(parseReport(`${body}\n\n\`\`\`\n### Manufacturer\nnot a field\n\`\`\``).notes, /### Manufacturer/)
})

test('preserves Notes subheadings and all following limitations, including repeated subheadings', () => {
  const notes = 'Basic readings work.\n\n### Limitations\nSelf-tests fail.\n\n### Limitations\nNo output voltage.'
  for (const text of [notes.split('\n\n### Limitations\nNo output voltage.')[0], notes]) {
    const report = parseReport(`${body.split('### Notes')[0]}### Notes\n\n${text}`)
    assert.equal(report.notes, text)
    const result = updateWiki(wiki, report, 500, issueUrl)
    assert.ok(result.markdown.includes('Basic readings work.<br><br>### Limitations<br>Self-tests fail.'))
  }
})

test('inserts in the manufacturer group, preserves existing content, and links the source issue', () => {
  const result = updateWiki(wiki, parseReport(body), 500, issueUrl)
  assert.equal(result.changed, true)
  assert.match(result.markdown, /Existing note \|\nCPS \| VP1000ELCD/)
  assert.match(result.markdown, /0\.<br>Self tests do not work\./)
  assert.ok(result.markdown.includes(`[Report #500](${issueUrl})`))
  assert.ok(result.markdown.endsWith('\nKeep this footer.\n'))
  assert.equal(
    result.markdown
      .split('\n')
      .filter((line) => !line.includes('VP1000ELCD'))
      .join('\n'),
    wiki
  )
})

test('escapes HTML, markdown, table delimiters, and mention syntax in submitted text', () => {
  const report = parseReport(body)
  report.model = 'VP|1000'
  report.notes = '<img src=x> [link](evil) `code` *bold* @user \\ |\nNext'
  const { markdown } = updateWiki(wiki, report, 500, issueUrl)
  const row = markdown.split('\n').find((line) => line.includes('[Report #500]'))
  assert.equal(row.split('|').length, 6)
  assert.ok(!row.includes('<img'))
  assert.ok(!row.includes('[link]'))
  assert.ok(!row.includes('@user'))
  assert.match(row, /&#124;/)
  assert.match(row, /<br>Next/)
})

test('does not duplicate a published report on retry and rejects later changes to it', () => {
  const report = parseReport(body)
  const first = updateWiki(wiki, report, 500, issueUrl)
  assert.deepEqual(updateWiki(first.markdown, report, 500, issueUrl), { markdown: first.markdown, changed: false })
  assert.throws(() => updateWiki(first.markdown, { ...report, notes: 'Changed' }, 500, issueUrl), /different details/)
})

test('keeps existing duplicate devices for manual review, including aliases and case differences', () => {
  const report = parseReport(body.replace('VP1000ELCD', ' cp1500pfclcd '))
  assert.throws(() => updateWiki(wiki, report, 500, issueUrl), /already listed/)
  assert.throws(() => updateWiki('No table', report, 500, issueUrl), /table could not be found/)
  const otherDriver = updateWiki(wiki, { ...report, driver: 'snmp-ups' }, 500, issueUrl)
  assert.equal(otherDriver.changed, true)
})

test('checks duplicate devices on and after wiki rows with escaped pipes', () => {
  const escapedWiki = wiki.replace('Existing note', 'Readings work \\| self-tests fail')
  for (const [manufacturer, model] of [
    ['CPS', 'CP1500PFCLCD'],
    ['APC', 'Back-UPS BX750MI'],
  ]) {
    const report = { ...parseReport(body), manufacturer, model }
    assert.throws(() => updateWiki(escapedWiki, report, 500, issueUrl), /already listed/)
  }
})

test('recognizes escaped pipes in model names and preserves existing table rows when inserting', () => {
  const escapedWiki = wiki.replace('CP1500PFCLCD', 'CP1500\\|PFCLCD')
  const duplicate = { ...parseReport(body), model: 'CP1500|PFCLCD' }
  assert.throws(() => updateWiki(escapedWiki, duplicate, 500, issueUrl), /already listed/)
  const result = updateWiki(escapedWiki, parseReport(body), 500, issueUrl)
  assert.ok(result.markdown.includes('CPS | CP1500\\|PFCLCD | usbhid-ups | ✅ | Existing note |'))
  assert.match(result.markdown, /Existing note \|\nCPS \| VP1000ELCD/)
})

test('handles paired backslashes before a table separator', () => {
  const escapedWiki = wiki.replace('CP1500PFCLCD |', 'CP1500PFCLCD\\\\ |')
  const duplicate = { ...parseReport(body), model: 'CP1500PFCLCD\\' }
  assert.throws(() => updateWiki(escapedWiki, duplicate, 500, issueUrl), /already listed/)
})

test('fails closed on malformed wiki rows instead of skipping duplicate checks', () => {
  for (const row of [
    'CPS | Incomplete | usbhid-ups | ✅ |',
    'CPS | Ambiguous | usbhid-ups | ✅ | Unescaped | pipe |',
  ]) {
    const malformedWiki = wiki.replace('CPS | CP1500PFCLCD | usbhid-ups | ✅ | Existing note |', row)
    assert.throws(() => updateWiki(malformedWiki, parseReport(body), 500, issueUrl), /malformed wiki table row/i)
  }
})

function setup(overrides = {}) {
  const issue = {
    number: 500,
    title: '[Tested Device]: CyberPower VP1000ELCD',
    body,
    state: 'open',
    labels: [{ name: 'tested device' }, { name: 'approved-device' }],
    html_url: issueUrl,
  }
  const operations = []
  let reads = 0
  const github = {
    rest: {
      repos: {
        getCollaboratorPermissionLevel: async () => ({ data: { permission: overrides.permission || 'write' } }),
      },
      issues: {
        get: async () => {
          reads++
          return { data: overrides.currentIssue?.(reads, issue) || issue }
        },
        update: async (parameters) => operations.push(parameters),
      },
    },
  }
  const context = {
    repo: { owner: 'Brandawg93', repo: 'PeaNUT' },
    payload: {
      action: 'labeled',
      label: { name: 'approved-device' },
      sender: { login: 'maintainer' },
      issue: { ...issue, ...overrides.eventIssue },
    },
  }
  const summary = { addHeading: () => summary, addRaw: () => summary, write: async () => {} }
  const writeWiki = async (parameters) => {
    await parameters.beforePush()
    operations.push('push')
    return { changed: true }
  }
  return { github, context, core: { summary }, writeWiki, operations }
}

test('a maintainer approval pushes the wiki before closing the issue as completed', async () => {
  const fixture = setup()
  await publishApprovedDevice(fixture)
  assert.deepEqual(fixture.operations, [
    'push',
    { owner: 'Brandawg93', repo: 'PeaNUT', issue_number: 500, state: 'closed', state_reason: 'completed' },
  ])
})

test('refuses approval from read/triage users and refuses pull requests', async () => {
  for (const options of [{ permission: 'read' }, { eventIssue: { pull_request: {} } }]) {
    const fixture = setup(options)
    await assert.rejects(publishApprovedDevice(fixture))
    assert.deepEqual(fixture.operations, [])
  }
})

test('opening a report or applying a different label cannot publish it', async () => {
  for (const change of [{ action: 'opened' }, { label: { name: 'tested device' } }]) {
    const fixture = setup()
    Object.assign(fixture.context.payload, change)
    await assert.rejects(publishApprovedDevice(fixture))
    assert.deepEqual(fixture.operations, [])
  }
})

test('closed, unapproved, unclassified, and edited reports cannot publish', async () => {
  for (const change of [
    { state: 'closed' },
    { labels: [{ name: 'tested device' }] },
    { labels: [{ name: 'approved-device' }] },
    { body: `${body}\nEdited` },
    { title: 'Edited title' },
  ]) {
    const fixture = setup({ currentIssue: (_, issue) => ({ ...issue, ...change }) })
    await assert.rejects(publishApprovedDevice(fixture))
    assert.deepEqual(fixture.operations, [])
  }
})

test('rechecks the approval before pushing and after publishing, before closing', async () => {
  for (const changedOnRead of [2, 3]) {
    const fixture = setup({
      currentIssue: (reads, issue) => (reads >= changedOnRead ? { ...issue, body: `${body}\nEdited` } : issue),
    })
    await assert.rejects(publishApprovedDevice(fixture), /changed after approval/)
    assert.deepEqual(fixture.operations, changedOnRead === 2 ? [] : ['push'])
  }
})

test('failed wiki pushes leave the issue open', async () => {
  const fixture = setup()
  fixture.writeWiki = async () => {
    throw new Error('Push rejected')
  }
  await assert.rejects(publishApprovedDevice(fixture), /Push rejected/)
  assert.deepEqual(fixture.operations, [])
})

test('a retry after successful publication can close without a second wiki push', async () => {
  const fixture = setup()
  fixture.writeWiki = async ({ beforePush }) => {
    await beforePush()
    return { changed: false }
  }
  await publishApprovedDevice(fixture)
  assert.equal(fixture.operations.length, 1)
  assert.equal(fixture.operations[0].state, 'closed')
})

test('publishes through real Git and safely retries without another commit', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'peanut-wiki-test-'))
  const repository = { owner: 'owner', repo: 'PeaNUT' }
  const remote = join(directory, 'owner', 'PeaNUT.wiki.git')
  const seed = join(directory, 'seed')
  const git = (...args) =>
    exec('git', [
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      '-c',
      'core.hooksPath=/dev/null',
      ...args,
    ])
  try {
    await mkdir(join(directory, 'owner'), { recursive: true })
    await git('init', '--bare', '--initial-branch=master', remote)
    await git('clone', remote, seed)
    await writeFile(join(seed, 'Tested-UPS-Devices.md'), wiki)
    await git('-C', seed, 'add', '.')
    await git('-C', seed, 'commit', '-m', 'Initial wiki')
    await git('-C', seed, 'push', 'origin', 'HEAD')
    let checks = 0
    const options = {
      repository,
      serverUrl: pathToFileURL(directory).href,
      report: parseReport(body),
      issue: { number: 500, html_url: issueUrl },
      token: 'test-token',
      beforePush: async () => checks++,
    }
    assert.equal((await publishWiki(options)).changed, true)
    assert.equal((await publishWiki(options)).changed, false)
    assert.equal(checks, 2)
    const { stdout: count } = await git('--git-dir', remote, 'rev-list', '--count', 'HEAD')
    assert.equal(count.trim(), '2')
    await git('-C', seed, 'pull', '--ff-only')
    assert.match(await readFile(join(seed, 'Tested-UPS-Devices.md'), 'utf8'), /VP1000ELCD/)

    await assert.rejects(
      publishWiki({
        ...options,
        issue: { number: 501, html_url: issueUrl.replace('500', '501') },
        report: { ...options.report, model: 'New model' },
        beforePush: async () => {
          await writeFile(join(seed, 'Other-page.md'), 'Concurrent wiki edit')
          await git('-C', seed, 'add', '.')
          await git('-C', seed, 'commit', '-m', 'Concurrent edit')
          await git('-C', seed, 'push', 'origin', 'HEAD')
        },
      }),
      /rejected/
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
