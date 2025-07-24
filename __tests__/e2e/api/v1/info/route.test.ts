import { expect, test } from '@playwright/test'

test.describe('Info', () => {
  test('should get application information', async ({ request }) => {
    const req = await request.get('/api/v1/info')
    const data = await req.json()

    expect(req.status()).toBe(200)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('version')
    expect(data).toHaveProperty('description')
    expect(data).toHaveProperty('nodeVersion')
    expect(data).toHaveProperty('platform')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('memoryUsage')
    expect(data).toHaveProperty('environment')
    expect(data).toHaveProperty('buildTime')
    expect(data).toHaveProperty('repository')

    // Check specific values
    expect(typeof data.name).toBe('string')
    expect(typeof data.version).toBe('string')
    expect(typeof data.description).toBe('string')
    expect(typeof data.repository).toBe('string')
    expect(typeof data.uptime).toBe('number')
    expect(typeof data.memoryUsage).toBe('object')
    expect(data.memoryUsage).toHaveProperty('rss')
    expect(data.memoryUsage).toHaveProperty('heapTotal')
    expect(data.memoryUsage).toHaveProperty('heapUsed')
  })
})
