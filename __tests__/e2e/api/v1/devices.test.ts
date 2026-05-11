import { expect, test, APIRequestContext } from '@playwright/test'

async function expectJsonGet(request: APIRequestContext, path: string, status: number, assert: (json: any) => void) {
  const res = await request.get(path)
  const json = await res.json()
  expect(res.status()).toBe(status)
  assert(json)
}

test.describe('Devices collection', () => {
  test('should get devices', async ({ request }) => {
    await expectJsonGet(request, '/api/v1/devices', 200, (json: Array<Record<string, any>>) => {
      expect(json).toHaveLength(4)
      expect(json[0]['device.serial']).toBe('test1')
      expect(json[1]['device.serial']).toBe('test2')
      expect(json[2]['device.serial']).toBe('test3')
    })
  })
})

test.describe('Device', () => {
  const cases: Array<{ name: string; path: string; assert: (json: any) => void }> = [
    {
      name: 'should get a device',
      path: '/api/v1/devices/ups',
      assert: (json) => expect(json['device.serial']).toBe('test1'),
    },
    {
      name: 'should get clients',
      path: '/api/v1/devices/ups/clients',
      assert: (json) => expect(json).toHaveLength(1),
    },
    {
      name: 'should get vars',
      path: '/api/v1/devices/ups/vars',
      assert: (json) => expect(json['device.serial']).toBe('test1'),
    },
    {
      name: 'should get rwvars',
      path: '/api/v1/devices/ups/rwvars',
      assert: (json) => expect(Array.isArray(json)).toBe(true),
    },
    {
      name: 'should get description',
      path: '/api/v1/devices/ups/description',
      assert: (json) => expect(json).toBe('CPS Test'),
    },
  ]

  for (const { name, path, assert } of cases) {
    test(name, async ({ request }) => {
      await expectJsonGet(request, path, 200, assert)
    })
  }
})

test.describe('Device var', () => {
  const getCases: Array<{ name: string; path: string; status?: number; assert: (json: any) => void }> = [
    {
      name: 'should get var',
      path: '/api/v1/devices/ups/var/device.serial',
      assert: (json) => expect(json).toBe('test1'),
    },
    {
      name: 'should return 404 for unknown var',
      path: '/api/v1/devices/ups/var/device.serial.not.found',
      status: 404,
      assert: (json) => expect(json).toBe('Parameter device.serial.not.found on device ups not found'),
    },
    {
      name: 'should get var type',
      path: '/api/v1/devices/ups/var/battery.charge.low/type',
      assert: (json) => expect(json).toBe('RW NUMBER'),
    },
    {
      name: 'should get var description',
      path: '/api/v1/devices/ups/var/device.serial/description',
      assert: (json) => expect(json).toBe('Device serial number'),
    },
    {
      name: 'should return 404 for unknown var enum',
      path: '/api/v1/devices/ups/var/ups.type/enum',
      status: 404,
      assert: (json) => expect(json).toBe('Parameter ups.type on device ups not found'),
    },
    {
      name: 'should get var range',
      path: '/api/v1/devices/ups/var/battery.charge/range',
      assert: (json) => expect(Array.isArray(json)).toBe(true),
    },
  ]

  for (const { name, path, status = 200, assert } of getCases) {
    test(name, async ({ request }) => {
      await expectJsonGet(request, path, status, assert)
    })
  }

  test('should save var', async ({ request }) => {
    const res = await request.post('/api/v1/devices/ups/var/battery.charge.low', { data: '9' })
    const json = await res.json()
    expect(res.status()).toBe(200)
    expect(json).toBe('Variable battery.charge.low on device ups saved successfully')
  })
})

test.describe('Device commands', () => {
  test('should get commands', async ({ request }) => {
    await expectJsonGet(request, '/api/v1/devices/ups/commands', 200, (json) => expect(json).toContain('driver.reload'))
  })

  test('should get command description', async ({ request }) => {
    await expectJsonGet(request, '/api/v1/devices/ups/command/test.command/description', 200, (json) =>
      expect(typeof json).toBe('string')
    )
  })

  test('should run command', async ({ request }) => {
    const res = await request.post('/api/v1/devices/ups/command/driver.reload')
    const text = await res.text()
    expect(res.status()).toBe(200)
    expect(text).toBe('"Command driver.reload on device ups run successfully"')
  })

  test('should execute command via param route', async ({ request }) => {
    const res = await request.post('/api/v1/devices/ups/command/driver.reload')
    const json = await res.json()
    expect(res.status()).toBe(200)
    expect(typeof json).toBe('string')
  })
})
