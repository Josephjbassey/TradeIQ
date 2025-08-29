import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app, setupApp } from './index';

describe('Server API', () => {
  beforeAll(async () => {
    await setupApp();
  });

  it('should respond with 200 OK for GET /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
