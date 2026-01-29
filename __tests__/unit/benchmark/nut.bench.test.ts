import { Nut } from '@/server/nut'
import PromiseSocket from '@/server/promise-socket'

// Mock constants
const TEST_HOST = 'localhost'
const TEST_PORT = 3493
const LATENCY_MS = 20

// 20 variables
const VAR_COUNT = 20
const MOCK_VARS = Array.from({ length: VAR_COUNT }, (_, i) => `VAR ups var.${i} "${i}"`).join('\n')
const MOCK_LIST_VAR_RESPONSE = `BEGIN LIST VAR ups\n${MOCK_VARS}\nEND LIST VAR ups`

// Skipped by default to avoid slowing down CI/CD
describe.skip('Nut Benchmark', () => {
  beforeEach(() => {
    jest.restoreAllMocks()

    // Mock connect with delay
    jest.spyOn(PromiseSocket.prototype, 'connect').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
    })

    // Mock close with delay
    jest.spyOn(PromiseSocket.prototype, 'close').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
    })

    // Mock write with delay
    jest.spyOn(PromiseSocket.prototype, 'write').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
    })

    // Mock readAll with delay and response logic
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockImplementation(async (command) => {
      await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

      if (command.startsWith('LIST VAR')) {
        return MOCK_LIST_VAR_RESPONSE
      }
      if (command.startsWith('GET DESC')) {
        // command is "GET DESC device variable"
        const parts = command.split(' ')
        const variable = parts[3] // parts[0]=GET, parts[1]=DESC, parts[2]=device, parts[3]=variable
        return `DESC ${parts[2]} ${variable} "Description for ${variable}"`
      }
      if (command.startsWith('GET TYPE')) {
        // command is "GET TYPE device variable"
        const parts = command.split(' ')
        const variable = parts[3]
        return `TYPE ${parts[2]} ${variable} STRING`
      }
      return 'OK\n'
    })
  })

  it('measures getData performance', async () => {
    const nut = new Nut(TEST_HOST, TEST_PORT)

    const start = performance.now()
    const data = await nut.getData('ups')
    const end = performance.now()

    const duration = end - start
    console.log(`getData for ${VAR_COUNT} variables took ${duration.toFixed(2)}ms`)

    expect(Object.keys(data).length).toBe(VAR_COUNT)
  })
})
