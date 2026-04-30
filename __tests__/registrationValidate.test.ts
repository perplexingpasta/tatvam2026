import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/registration/validate/route';
import { makeGetRequest } from './helpers/makeRequest';
import { adminDb } from '@/lib/firebaseAdmin';

vi.mock('@/lib/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn(),
  },
}));

describe('GET /api/registration/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockDbResponse(emailConflicts: boolean, phoneConflicts: boolean, collegeIdConflicts: boolean) {
    const getMock = vi.fn().mockImplementation(function (this: { _field: string, _val: unknown }) {
      const field = this._field;
      const val = this._val;
      let empty = true;
      if (field === 'email' && emailConflicts) empty = false;
      if (field === 'phone' && phoneConflicts) empty = false;
      if (field === 'collegeIdNumber' && collegeIdConflicts) empty = false;
      
      return Promise.resolve({
        empty,
        docs: empty ? [] : [{ data: () => ({ [field]: Array.isArray(val) ? val[0] : val }) }]
      });
    });

    const whereMock = vi.fn().mockImplementation((field, op, val) => {
      return {
        get: getMock,
        _field: field,
        _val: val
      };
    });

    vi.mocked(adminDb.collection).mockReturnValue({ where: whereMock } as unknown as ReturnType<typeof adminDb.collection>);
  }

  it('No params provided -> 200, conflicts: []', async () => {
    mockDbResponse(false, false, false);
    const req = makeGetRequest('http://localhost/api/registration/validate');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.conflicts).toEqual([]);
  });

  it('Email conflict -> 200, conflicts contains email', async () => {
    mockDbResponse(true, false, false);
    const req = makeGetRequest('http://localhost/api/registration/validate?emails=john@example.com');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.conflicts).toContainEqual({ field: 'email', value: 'john@example.com' });
  });

  it('Phone conflict -> 200, conflicts contains phone', async () => {
    mockDbResponse(false, true, false);
    const req = makeGetRequest('http://localhost/api/registration/validate?phones=1234567890');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.conflicts).toContainEqual({ field: 'phone', value: '1234567890' });
  });

  it('collegeId conflict -> 200, conflicts contains collegeIdNumber', async () => {
    mockDbResponse(false, false, true);
    const req = makeGetRequest('http://localhost/api/registration/validate?collegeIds=COL-123');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.conflicts).toContainEqual({ field: 'collegeIdNumber', value: 'COL-123' });
  });

  it('No conflict (clean) -> 200, conflicts: []', async () => {
    mockDbResponse(false, false, false);
    const req = makeGetRequest('http://localhost/api/registration/validate?emails=john@example.com&phones=1234567890');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.conflicts).toEqual([]);
  });

  it('Rate limit -> 429', async () => {
    const uniqueIp = `192.168.2.${Math.floor(Math.random() * 255)}`;
    
    // Call 30 times (limit is 30)
    for (let i = 0; i < 30; i++) {
      const req = makeGetRequest('http://localhost/api/registration/validate', { 'x-forwarded-for': uniqueIp });
      await GET(req);
    }

    // 31st call
    const req = makeGetRequest('http://localhost/api/registration/validate', { 'x-forwarded-for': uniqueIp });
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.success).toBe(false);
  });
});
