/**
 * Mock Authentication System
 *
 * IMPORTANT: This is a demo/prototype auth system using localStorage.
 * It is NOT secure for production. Passwords are stored with a simple
 * encoding (NOT real hashing). Replace with Firebase Auth or a real
 * backend before shipping to production.
 */

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type StoredUser = User & {
  // Simple base64 encoding — not real security
  _encodedPassword: string;
};

const USERS_KEY = "aq_users";
const SESSION_KEY = "aq_session";

// ── Helpers ────────────────────────────────────────────────────────────────

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function encodePassword(password: string): string {
  // Simple encoding — replace with bcrypt on a real backend
  return btoa(password + "_aq_salt");
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Auth API ───────────────────────────────────────────────────────────────

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string };

export function register(
  name: string,
  email: string,
  password: string
): AuthResult {
  const users = getStoredUsers();

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "An account with this email already exists." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const newUser: StoredUser = {
    id: generateId(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    _encodedPassword: encodePassword(password),
  };

  users.push(newUser);
  saveUsers(users);

  const { _encodedPassword: _, ...publicUser } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));

  return { success: true, user: publicUser };
}

export function login(email: string, password: string): AuthResult {
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return { success: false, error: "No account found with this email." };
  }

  if (user._encodedPassword !== encodePassword(password)) {
    return { success: false, error: "Incorrect password." };
  }

  const { _encodedPassword: _, ...publicUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));

  return { success: true, user: publicUser };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
