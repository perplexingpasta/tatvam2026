import { NextRequest } from 'next/server';

export function makeGetRequest(url: string, headers?: Record<string, string>): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
    headers: headers ?? {},
  });
}

export function makePostRequest(url: string, formData: FormData, headers?: Record<string, string>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: formData,
    headers: headers ?? {},
  });
}
