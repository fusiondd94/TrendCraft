/**
 * Auth client for TrendCraft.
 *
 * Stores session tokens in localStorage.
 * Calls the backend API when available, falls back to mock data otherwise.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const TOKEN_KEY = "trendcraft_token";
const USER_KEY = "trendcraft_user";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------------
// Mock users (fallback when API is unavailable)
// ---------------------------------------------------------------------------

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "demo@trendcraft.dev": {
    password: "password123",
    user: {
      id: "user-mock-001",
      name: "Demo User",
      email: "demo@trendcraft.dev",
      createdAt: "2026-01-15T08:00:00Z",
    },
  },
};

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------

const API_BASE = "/api/auth";

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let error: AuthError;
    try {
      error = (await res.json()) as AuthError;
    } catch {
      error = { message: `Request failed with status ${res.status}` };
    }
    throw error;
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Mock fallback implementations
// ---------------------------------------------------------------------------

function mockSignup(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_USERS[email]) {
        reject({ message: "An account with this email already exists." });
        return;
      }

      const user: User = {
        id: `user-mock-${Date.now()}`,
        name,
        email,
        createdAt: new Date().toISOString(),
      };
      const token = `mock-token-${user.id}-${Date.now()}`;

      MOCK_USERS[email] = { password, user };
      storeSession(token, user);
      resolve({ user, token });
    }, 500);
  });
}

function mockLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const record = MOCK_USERS[email];
      if (!record || record.password !== password) {
        reject({ message: "Invalid email or password." });
        return;
      }

      const token = `mock-token-${record.user.id}-${Date.now()}`;
      storeSession(token, record.user);
      resolve({ user: record.user, token });
    }, 500);
  });
}

function mockGetCurrentUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getStoredUser();
      if (!user) {
        reject({ message: "Not authenticated." });
        return;
      }
      resolve(user);
    }, 200);
  });
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * Tries the real API first, falls back to mock data on failure.
 */
export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const result = await apiCall<AuthResponse>("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    storeSession(result.token, result.user);
    return result;
  } catch {
    // Fall back to mock
    return mockSignup(name, email, password);
  }
}

/**
 * Log in an existing user.
 * Tries the real API first, falls back to mock data on failure.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const result = await apiCall<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    storeSession(result.token, result.user);
    return result;
  } catch {
    // Fall back to mock
    return mockLogin(email, password);
  }
}

/**
 * Log out the current user.
 */
export async function logout(): Promise<void> {
  try {
    await apiCall<{ success: boolean }>("/logout", { method: "POST" });
  } catch {
    // Ignore API errors on logout
  }
  clearSession();
}

/**
 * Get the currently authenticated user.
 * Tries the real API first, falls back to stored session data.
 */
export async function getCurrentUser(): Promise<User | null> {
  // Check if we have a stored session first
  const stored = getStoredUser();
  if (!stored && !getStoredToken()) {
    return null;
  }

  try {
    const result = await apiCall<{ user: User }>("/me");
    return result.user;
  } catch {
    // Fall back to stored user data
    if (stored) return stored;
    try {
      return await mockGetCurrentUser();
    } catch {
      return null;
    }
  }
}

/**
 * Check if the user is currently authenticated (has a stored session).
 */
export function isAuthenticated(): boolean {
  return getStoredToken() !== null && getStoredUser() !== null;
}