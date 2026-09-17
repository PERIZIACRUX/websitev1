// setup.ts
jest.mock("jose", () => ({
  SignJWT: class {
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return "mock-jwt-token"; }
  }
}));
