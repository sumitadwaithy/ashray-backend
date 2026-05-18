import { buildApiUrl } from './apiConfig';

export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = buildApiUrl(path);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  return res;
}

export async function apiFetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    console.error(`❌ API ERROR ${path}`, res.status);
    return null;
  }

  const contentType = res.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error(`❌ NON-JSON ${path}`, text);
    return null;
  }

  return res.json();
}