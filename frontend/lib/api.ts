const normalizeBackendBaseUrl = (rawUrl: string) => {
  const trimmed = (rawUrl || "http://localhost:3001").trim();
  if (!trimmed) return "http://localhost:3001";

  return trimmed.replace(/\/+$/, "").replace(/\/api\/v1$/, "").replace(/\/api$/, "");
};

export const BACKEND_URL = normalizeBackendBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001",
);

export async function fetchBackend(endpoint: string, options: RequestInit = {}) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BACKEND_URL}${normalizedEndpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Essential for participant sessions
  });
}
