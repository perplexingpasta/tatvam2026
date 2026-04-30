import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/merch/order/route';
import { makePostRequest } from './helpers/makeRequest';
import { merchCatalogue } from '@/lib/merchCatalogue';
import { merchCatalogue } from '@/lib/merchCatalogue';

vi.mock('@/lib/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        set: vi.fn(),
        get: vi.fn().mockResolvedValue({ exists: false })
      }))
    })),
  },
}));

vi.mock('@/lib/merchSheetsSync', () => ({
  attemptMerchSyncWithFallback: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({})
    }
  }
}));

describe('merchCatalogue & POST /api/merch/order', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Catalogue Integrity', () => {
    it('All items have required fields and attributes', () => {
      merchCatalogue.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.price).toBeGreaterThan(0);
        expect(item.isAvailable).toBeDefined();
        expect(item.attributes.length).toBeGreaterThan(0);
      });
    });

    it('No duplicate item IDs in merchCatalogue', () => {
      const ids = merchCatalogue.map(i => i.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('Price validation in /api/merch/order', () => {
    function makeOrderFormData(units: Record<string, unknown>[]) {
      const formData = new FormData();
      formData.append('buyerName', 'Test Buyer');
      formData.append('buyerEmail', 'test@example.com');
      formData.append('buyerPhone', '1234567890');
      formData.append('utrNumber', '123456789012');
      formData.append('paymentScreenshotUrl', 'https://res.cloudinary.com/test/image.webp');
      formData.append('units', JSON.stringify(units));
      return formData;
    }

    it('Price cross-validation logic (price mismatch -> 400)', async () => {
      // Find a real item from the catalogue
      const item = merchCatalogue[0];
      
      const units = [{
        itemId: item.id,
        itemName: item.name,
        price: item.price - 100, // Mismatched price
        attributes: {}
      }];

      const formData = makeOrderFormData(units);
      const req = makePostRequest('http://localhost/api/merch/order', formData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Price mismatch");
    });

    it('Item not in catalogue -> 400', async () => {
      const units = [{
        itemId: "unknown-item-123",
        itemName: "Unknown",
        price: 100,
        attributes: {}
      }];

      const formData = makeOrderFormData(units);
      const req = makePostRequest('http://localhost/api/merch/order', formData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("not found in catalogue");
    });

    it('Item with isAvailable: false -> 400', async () => {
      // Find a real item from the catalogue
      const item = merchCatalogue[0];
      
      // We temporarily mock the catalogue to make it unavailable
      const originalIsAvailable = item.isAvailable;
      item.isAvailable = false;
      
      const units = [{
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        attributes: {}
      }];

      const formData = makeOrderFormData(units);
      const req = makePostRequest('http://localhost/api/merch/order', formData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("is no longer available");

      // Restore
      item.isAvailable = originalIsAvailable;
    });

    it('Valid order creates order successfully -> 200', async () => {
      // Find a real item from the catalogue
      const item = merchCatalogue[0];
      
      const units = [{
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        attributes: { size: "M" }
      }];

      const formData = makeOrderFormData(units);
      const req = makePostRequest('http://localhost/api/merch/order', formData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.orderId).toBeDefined();
    });
  });
});
