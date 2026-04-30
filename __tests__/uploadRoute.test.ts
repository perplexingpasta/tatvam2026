import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/image/route';
import { makePostRequest } from './helpers/makeRequest';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

vi.mock('@/lib/cloudinaryUpload', () => ({
  uploadToCloudinary: vi.fn(),
}));

describe('POST /api/upload/image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB = "20";
  });

  function makeFormData(overrides: { file?: File | string | null, folder?: string | null, emptyBody?: boolean, wrongMime?: boolean, largeFile?: boolean } = {}) {
    const formData = new FormData();
    if (!overrides.emptyBody) {
      if (overrides.file !== null) {
        let fileType = "image/webp";
        if (overrides.wrongMime) fileType = "application/pdf";
        
        const size = overrides.largeFile ? 21 * 1024 * 1024 : 1024;
        const arrayBuffer = new ArrayBuffer(size);
        const file = new File([arrayBuffer], "test.webp", { type: fileType });
        formData.append('file', overrides.file ?? file);
      }
      if (overrides.folder !== null) {
        formData.append('folder', overrides.folder ?? "payment-proofs");
      }
    }
    return formData;
  }

  it('Valid WebP file + valid folder -> 200', async () => {
    vi.mocked(uploadToCloudinary).mockResolvedValueOnce({
      originalUrl: "https://res.cloudinary.com/test/original.webp",
      transformedUrl: "https://res.cloudinary.com/test/upload/f_auto,q_auto,w_800/original.webp"
    });

    const formData = makeFormData();
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.originalUrl).toBeDefined();
    expect(json.transformedUrl).toBeDefined();
  });

  it('Valid JPEG file + folder "college-ids" -> 200', async () => {
    vi.mocked(uploadToCloudinary).mockResolvedValueOnce({
      originalUrl: "https://res.cloudinary.com/test/original.jpg",
      transformedUrl: "https://res.cloudinary.com/test/upload/f_auto,q_auto,w_800/original.jpg"
    });

    const formData = makeFormData({ folder: "college-ids" });
    const arrayBuffer = new ArrayBuffer(1024);
    const file = new File([arrayBuffer], "test.jpg", { type: "image/jpeg" });
    formData.set('file', file);
    
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('Invalid folder "hacked-folder" -> 400', async () => {
    const formData = makeFormData({ folder: "hacked-folder" });
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('Invalid MIME type "application/pdf" -> 400', async () => {
    const formData = makeFormData({ wrongMime: true });
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('File exceeding 20MB -> 400', async () => {
    const formData = makeFormData({ largeFile: true });
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("20MB");
  });

  it('Wrong content-type header -> 415', async () => {
    const req = new Request('http://localhost/api/upload/image', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    }) as unknown as NextRequest; // mock NextRequest
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(415);
    expect(json.success).toBe(false);
  });

  it('Missing file field -> 400', async () => {
    const formData = makeFormData({ file: null });
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("File is required.");
  });

  it('Cloudinary upload throws -> 503', async () => {
    vi.mocked(uploadToCloudinary).mockRejectedValueOnce(new Error('Cloudinary error'));

    const formData = makeFormData();
    const req = makePostRequest('http://localhost/api/upload/image', formData);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
  });
});
