export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";

export async function fetchBackend(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Essential for participant sessions
  });
}
