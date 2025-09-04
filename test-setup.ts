import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.OPENAI_API_KEY = "test-key";
process.env.SESSION_SECRET = "test-secret";