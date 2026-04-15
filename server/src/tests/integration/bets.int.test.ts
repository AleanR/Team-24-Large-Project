import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';
import { getBetsByUserWithGames } from '../../modules/bets/bets.model';

// Mock bets model dependencies used by bets controllers
vi.mock('../../modules/bets/bets.model', () => ({
  BetModel: {},
  createBet: vi.fn(),
  deleteBetById: vi.fn(),
  getBetById: vi.fn(),
  getBets: vi.fn(),
  getBetsByUser: vi.fn(),
  getBetsByUserWithGames: vi.fn(),
}));

vi.mock('../../modules/users/users.model', () => ({
  deductKnightPoints: vi.fn(),
}));

vi.mock('../../modules/services/bet.service', () => ({
  placeBet: vi.fn(),
}));

describe('Bets integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it('POST /api/bets returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/bets')
      .send({
        stake: 100,
        legs: [],
      });

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/my returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets/my');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/my/list returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets/my/list');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/user/:id/list returns 200 (public route)', async () => {
    (getBetsByUserWithGames as any).mockResolvedValue([{ _id: 'bet1' }]);

    const res = await request(app).get('/api/bets/user/123/list');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ _id: 'bet1' }]);
  });
});