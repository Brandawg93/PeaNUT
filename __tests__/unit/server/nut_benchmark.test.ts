import { Nut } from '@/server/nut'
import PromiseSocket from '@/server/promise-socket'
import { resetCaches } from '@/server/nut-cache'

const TEST_HOSTNAME = 'localhost'
const TEST_PORT = 3493

describe('Nut Performance Benchmark', () => {
  beforeEach(() => {
    resetCaches()
    jest.restoreAllMocks()
    jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  })

  it('should measure the number of socket calls for getData', async () => {
    const nut = new Nut(TEST_HOSTNAME, TEST_PORT)

    let callCount = 0
    const _readAllSpy = jest.spyOn(PromiseSocket.prototype, 'readAll').mockImplementation(async (command: string) => {
      callCount++
      if (command.startsWith('LIST VAR')) {
        return `BEGIN LIST VAR ups
VAR ups var1 "val1"
VAR ups var2 "val2"
END LIST VAR ups`
      }
      if (command.startsWith('GET DESC')) {
        // return a valid response format
        const variable = command.split(' ')[3]
        return `DESC ups ${variable} "Description for ${variable}"`
      }
      if (command.startsWith('GET TYPE')) {
        const variable = command.split(' ')[3]
        return `TYPE ups ${variable} STRING`
      }
      return 'OK\n'
    })

    console.log('--- First Poll ---')
    await nut.getData('ups')
    const firstPollCount = callCount
    console.log(`First poll calls: ${firstPollCount}`)

    console.log('--- Second Poll ---')
    // Reset call count? Or keep cumulative. Let's keep cumulative but track diff.
    const beforeSecond = callCount
    await nut.getData('ups')
    const secondPollCount = callCount - beforeSecond
    console.log(`Second poll calls: ${secondPollCount}`)

    // Expectation: Without optimization, secondPollCount should be equal to firstPollCount (5)
    // With optimization, secondPollCount should be 1 (only LIST VAR)

    expect(firstPollCount).toBe(5) // 1 LIST + 2 * (DESC + TYPE)
    expect(secondPollCount).toBe(1) // Optimized: only 1 LIST VAR call, metadata cached
  })
})
