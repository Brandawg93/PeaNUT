import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const approvalLabel = 'approved-device'
const statuses = new Map([
  ['✅ Fully Operational', '✅'],
  ['⚠️ Partially Operational', '⚠️'],
  ['❌ Not Operational', '❌'],
])
const fields = ['Manufacturer', 'Model', 'Driver', 'Status', 'Notes']

function normalize(value) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
}

function manufacturer(value) {
  return ['cps', 'cyberpower', 'cyber power systems', 'cyberpower (cps)'].includes(normalize(value)) ? 'CPS' : value
}

function escapeCell(value) {
  return value
    .replace(/[&<>"'\\|`*_[\]!~@]/g, (character) => `&#${character.codePointAt(0)};`)
    .replace(/\r?\n/g, '<br>')
}

function cells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim().replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))))
}

export function parseReport(body) {
  const sections = new Map()
  let section
  let fence
  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    const delimiter = line.match(/^\s*(`{3,}|~{3,})/)
    if (delimiter) {
      if (!fence) fence = delimiter[1]
      else if (delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length) fence = undefined
    }
    const heading = !fence && !delimiter && line.match(/^### (.+?)\s*$/)
    if (heading) {
      section = heading[1]
      if (sections.has(section)) throw new Error('Duplicate form headings. Use the Tested Device form.')
      sections.set(section, [])
    } else if (section) {
      sections.get(section).push(line)
    }
  }

  const values = fields.map((field) => {
    const value = (sections.get(field) || []).join('\n').trim()
    return value === '_No response_' ? '' : value
  })
  for (let index = 0; index < 4; index++) {
    if (!values[index] || /[\r\n]/.test(values[index]) || values[index].length > 200) {
      throw new Error(`Missing or invalid ${fields[index]}. Use the Tested Device form and reapply approved-device.`)
    }
  }
  if (!/^[a-z][a-z0-9_-]{0,63}$/.test(values[2]))
    throw new Error('Driver must be a NUT driver name, such as usbhid-ups.')
  if (!statuses.has(values[3])) throw new Error('Select an operational status from the Tested Device form.')
  if (values[4].length > 4000) throw new Error('Notes must be 4,000 characters or fewer.')

  return {
    manufacturer: manufacturer(values[0]),
    model: values[1],
    driver: values[2],
    status: statuses.get(values[3]),
    notes: values[4],
  }
}

export function updateWiki(markdown, report, issueNumber, issueUrl) {
  const lines = markdown.split('\n')
  const header = lines.findIndex(
    (line) => cells(line).map(normalize).join('|') === 'manufacturer|model|driver|status|notes'
  )
  if (header < 0 || !/^\s*\|?\s*:?-+/.test(lines[header + 1] || '')) {
    throw new Error('The tested-device wiki table could not be found. No changes were published.')
  }
  const digest = createHash('sha256').update(JSON.stringify(report)).digest('hex')
  const marker = `<!-- tested-device:${issueNumber}:${digest} -->`
  if (markdown.includes(`<!-- tested-device:${issueNumber}:`)) {
    if (markdown.includes(marker)) return { markdown, changed: false }
    throw new Error('This issue was already published with different details. Reconcile its wiki entry manually.')
  }

  let insertion = header + 2
  let groupEnd
  for (; insertion < lines.length; insertion++) {
    const row = cells(lines[insertion])
    if (row.length !== 5) break
    const sameManufacturer = normalize(manufacturer(row[0])) === normalize(report.manufacturer)
    if (sameManufacturer) groupEnd = insertion + 1
    if (
      sameManufacturer &&
      normalize(row[1]) === normalize(report.model) &&
      normalize(row[2]) === normalize(report.driver)
    ) {
      throw new Error('This manufacturer, model, and driver are already listed. Review the existing entry manually.')
    }
  }
  const notes = [escapeCell(report.notes), `[Report #${issueNumber}](${issueUrl}) ${marker}`].filter(Boolean).join(' ')
  const row = [report.manufacturer, report.model, report.driver, report.status].map(escapeCell)
  lines.splice(groupEnd ?? insertion, 0, `${row.join(' | ')} | ${notes} |`)
  return { markdown: lines.join('\n'), changed: true }
}

export async function publishWiki({
  repository,
  serverUrl,
  report,
  issue,
  beforePush,
  token = process.env.WIKI_TOKEN,
}) {
  if (!token) throw new Error('A wiki authentication token is required.')
  const directory = await mkdtemp(join(tmpdir(), 'peanut-wiki-'))
  // Pass credentials through the environment so errors never include them in command arguments or remote URLs.
  const env = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_CONFIG_COUNT: '3',
    GIT_CONFIG_KEY_0: `http.${serverUrl}/.extraheader`,
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`,
    GIT_CONFIG_KEY_1: 'credential.helper',
    GIT_CONFIG_VALUE_1: '',
    GIT_CONFIG_KEY_2: 'core.hooksPath',
    GIT_CONFIG_VALUE_2: '/dev/null',
  }
  const git = (...args) => exec('git', args, { cwd: directory, env })
  try {
    await git('clone', '--depth=1', `${serverUrl}/${repository.owner}/${repository.repo}.wiki.git`, '.')
    const file = join(directory, 'Tested-UPS-Devices.md')
    const result = updateWiki(await readFile(file, 'utf8'), report, issue.number, issue.html_url)
    await beforePush()
    if (result.changed) {
      await writeFile(file, result.markdown)
      await git('add', 'Tested-UPS-Devices.md')
      await git(
        '-c',
        'user.name=github-actions[bot]',
        '-c',
        'user.email=41898282+github-actions[bot]@users.noreply.github.com',
        'commit',
        '-m',
        `Add tested device from #${issue.number}`
      )
      await git('push', 'origin', 'HEAD')
    }
    return result
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

export async function publishApprovedDevice({ github, context, core, writeWiki = publishWiki }) {
  const { payload, repo: repository } = context
  if (payload.action !== 'labeled' || payload.label?.name !== approvalLabel || payload.issue?.pull_request) {
    throw new Error('Only an approved-device label on an issue can publish a device.')
  }
  const { data: permission } = await github.rest.repos.getCollaboratorPermissionLevel({
    ...repository,
    username: payload.sender.login,
  })
  if (!['admin', 'write', 'maintain'].includes(permission.permission)) {
    throw new Error('Approval requires a maintainer with write access to this repository.')
  }
  const issueParameters = { ...repository, issue_number: payload.issue.number }
  const checkApproval = async () => {
    const { data: issue } = await github.rest.issues.get(issueParameters)
    const labels = issue.labels.map((label) => (typeof label === 'string' ? label : label.name))
    if (issue.state !== 'open' || !labels.includes(approvalLabel) || !labels.includes('tested device')) {
      throw new Error('The report must be open and have both tested device and approved-device labels.')
    }
    if (issue.body !== payload.issue.body || issue.title !== payload.issue.title) {
      throw new Error('The report changed after approval. Review it and remove/reapply approved-device.')
    }
    return issue
  }
  const issue = await checkApproval()
  const report = parseReport(issue.body || '')
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const result = await writeWiki({ repository, serverUrl, report, issue, beforePush: checkApproval })
  await checkApproval()
  await github.rest.issues.update({ ...issueParameters, state: 'closed', state_reason: 'completed' })
  await core.summary
    .addHeading('Tested device published')
    .addRaw(
      `Report #${issue.number} ${result.changed ? 'was added to' : 'is already recorded in'} the wiki and is now closed.`
    )
    .write()
}
