import { expect, test } from '@playwright/test'

test.describe('Devices collection', () => {
  test('should get devices', async ({ request }) => {
    const res = await request.get('/api/v1/devices')
    const json = (await res.json()) as Array<Record<string, any>>

    expect(res.status()).toBe(200)
    expect(json).toHaveLength(4)
    expect(json[0]['device.serial']).toBe('test1')
    expect(json[1]['device.serial']).toBe('test2')
    expect(json[2]['device.serial']).toBe('test3')
  })
})

test.describe('Device', () => {
  test('should get a device', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups')
    const json = (await res.json()) as Record<string, any>

    expect(res.status()).toBe(200)
    expect(json['device.serial']).toBe('test1')
  })

  test('should get clients', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/clients')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toHaveLength(1)
  })

  test('should get vars', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/vars')
    const json = (await res.json()) as Record<string, any>

    expect(res.status()).toBe(200)
    expect(json['device.serial']).toBe('test1')
  })

  test('should get rwvars', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/rwvars')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(Array.isArray(json)).toBe(true)
  })

  test('should get description', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/description')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toBe('CPS Test')
  })
})

test.describe('Device var', () => {
  test('should get var', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/var/device.serial')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toBe('test1')
  })

  test('should return 404 for unknown var', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/var/device.serial.not.found')
    const json = await res.json()

    expect(res.status()).toBe(404)
    expect(json).toBe(`Parameter device.serial.not.found on device ups not found`)
  })

  test('should save var', async ({ request }) => {
    const res = await request.post('/api/v1/devices/ups/var/battery.charge.low', { data: '9' })
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toBe('Variable battery.charge.low on device ups saved successfully')
  })

  test('should get var type', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/var/battery.charge.low/type')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toBe('RW NUMBER')
  })

  test('should get var description', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/var/device.serial/description')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toBe('Device serial number')
  })

  test('should return 404 for unknown var enum', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/var/ups.type/enum')
    const json = await res.json()

    expect(res.status()).toBe(404)
    expect(json).toBe(`Parameter ups.type on device ups not found`)
  })

  test('should get var range', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/var/battery.charge/range')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(Array.isArray(json)).toBe(true)
  })
})

test.describe('Device commands', () => {
  test('should get commands', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/commands')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(json).toContain('driver.reload')
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

  test('should get command description', async ({ request }) => {
    const res = await request.get('/api/v1/devices/ups/command/test.command/description')
    const json = await res.json()

    expect(res.status()).toBe(200)
    expect(typeof json).toBe('string')
  })
})
