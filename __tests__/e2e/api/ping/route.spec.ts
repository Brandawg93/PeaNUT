import { expect, test } from '@playwright/test';

test.describe('Ping', () => {
    test('should reply with pong', async ({
        request,
      }) => {
        const create = await request.get('/api/ping')
        const createJson = await create.json();
  
        expect(create.status()).toBe(200);
        expect(createJson).toBe('pong');  
      });
});