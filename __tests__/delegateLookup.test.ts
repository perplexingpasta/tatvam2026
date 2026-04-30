import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/delegates/lookup/route';
import { makeGetRequest } from './helpers/makeRequest';
import { adminDb } from '@/lib/firebaseAdmin';

vi.mock('@/lib/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn(),
  },
  adminStorage: {}
}));

describe('GET /api/delegates/lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockDelegateResponse(exists: boolean, data?: Record<string, unknown>) {
    const getMock = vi.fn().mockResolvedValue({
      exists,
      data: () => data,
    });
    const docMock = vi.fn().mockReturnValue({ get: getMock });
    vi.mocked(adminDb.collection).mockReturnValue({ doc: docMock } as unknown as ReturnType<typeof adminDb.collection>);
  }

  it('Valid delegate ID, delegate found -> 200, safe response', async () => {
    const delegateData = {
      name: "John",
      collegeName: "JSSMC",
      delegateTier: "tier1",
      teamId: "T1",
      email: "john@example.com",
      phone: "12345",
      collegeIdNumber: "123",
      collegeIdImageUrl: "http...",
      paymentScreenshotUrl: "http...",
      registeredEventIds: []
    };
    mockDelegateResponse(true, delegateData);

    const req = makeGetRequest('http://localhost/api/delegates/lookup?id=DEL-123');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.delegate).toBeDefined();
    expect(json.delegate.name).toBe("John");
    expect(json.delegate.collegeName).toBe("JSSMC");
    expect(json.delegate.delegateTier).toBe("tier1");
    expect(json.delegate.teamId).toBe("T1");

    // MUST NOT contain sensitive data
    expect(json.delegate.email).toBeUndefined();
    expect(json.delegate.phone).toBeUndefined();
    expect(json.delegate.collegeIdNumber).toBeUndefined();
    expect(json.delegate.collegeIdImageUrl).toBeUndefined();
    expect(json.delegate.paymentScreenshotUrl).toBeUndefined();
  });

  it('Delegate not found -> 404', async () => {
    mockDelegateResponse(false);

    const req = makeGetRequest('http://localhost/api/delegates/lookup?id=DEL-123');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it('Missing id param -> 400', async () => {
    const req = makeGetRequest('http://localhost/api/delegates/lookup');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('Delegate already registered for the given eventId -> 409', async () => {
    const delegateData = {
      name: "John",
      registeredEventIds: ["event1"]
    };
    mockDelegateResponse(true, delegateData);

    const req = makeGetRequest('http://localhost/api/delegates/lookup?id=DEL-123&eventId=event1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toBe("already_registered");
  });

  it('Rate limit exceeded -> 429', async () => {
    // Need to reset the limit or use a different IP
    // The rate limit in the original code is per IP, we'll use a unique IP
    const uniqueIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
    
    // Call 20 times (limit is 20)
    for (let i = 0; i < 20; i++) {
      const req = makeGetRequest('http://localhost/api/delegates/lookup', { 'x-forwarded-for': uniqueIp });
      await GET(req);
    }

    // 21st call
    const req = makeGetRequest('http://localhost/api/delegates/lookup', { 'x-forwarded-for': uniqueIp });
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.success).toBe(false);
  });
});
