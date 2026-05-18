/**
 * ═══════════════════════════════════════════════════════════
 *  ASHRAY GROUP — CREDENTIALS ENGINE
 *  CredentialsEngine.ts
 *
 *  SYSTEM RULES:
 *  - Username → UNIQUE (global registry)
 *  - Password → Deterministic (Name + DOB)
 * ═══════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// REGISTRY KEYS (localStorage)
// ─────────────────────────────────────────────────────────────
const USERNAME_REGISTRY_KEY = 'ag_used_usernames';

// ─────────────────────────────────────────────────────────────
// REGISTRY HELPERS
// ─────────────────────────────────────────────────────────────
const getRegistry = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

const saveRegistry = (key: string, registry: Set<string>): void => {
  try {
    localStorage.setItem(key, JSON.stringify([...registry]));
  } catch {
  }
};

const registerUsername = (username: string): void => {
  const registry = getRegistry(USERNAME_REGISTRY_KEY);
  registry.add(username.toLowerCase());
  saveRegistry(USERNAME_REGISTRY_KEY, registry);
};

const isUsernameTaken = (username: string): boolean => {
  return getRegistry(USERNAME_REGISTRY_KEY).has(username.toLowerCase());
};

// ─────────────────────────────────────────────────────────────
// USERNAME GENERATOR
// ─────────────────────────────────────────────────────────────
const buildBaseUsername = (fullName: string): string => {
  const parts = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'user';
  if (parts.length === 1) return parts[0].slice(0, 15);
  return `${parts[0]}.${parts[1]}`.slice(0, 20);
};

export const generateUniqueUsername = (fullName: string): string => {
  const base = buildBaseUsername(fullName) || 'user';

  if (!isUsernameTaken(base)) {
    registerUsername(base);
    return base;
  }

  for (let i = 2; i <= 999; i++) {
    const candidate = `${base}${i}`;
    if (!isUsernameTaken(candidate)) {
      registerUsername(candidate);
      return candidate;
    }
  }

  const fallback = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  registerUsername(fallback);
  return fallback;
};

// ─────────────────────────────────────────────────────────────
// PASSWORD GENERATOR (NAME + DOB BASED)
// ─────────────────────────────────────────────────────────────
const buildDOBPassword = (fullName: string, dob: string): string => {
  if (!fullName || !dob) return '';

  const firstName = fullName
    .trim()
    .toLowerCase()
    .split(' ')[0]
    .replace(/[^a-z]/g, '');

  const date = new Date(dob);

  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);

  // OPTIONAL SECURITY UPGRADE (recommended)
  const randomSuffix = Math.floor(10 + Math.random() * 90);

  return `${firstName}${day}${year}@${randomSuffix}`;
};

// ─────────────────────────────────────────────────────────────
// MAIN API
// ─────────────────────────────────────────────────────────────
export const generateCredentials = (
  fullName: string,
  dob: string
): { username: string; password: string } => {
  const username = generateUniqueUsername(fullName);
  const password = buildDOBPassword(fullName, dob);

  return { username, password };
};

// ─────────────────────────────────────────────────────────────
// ADMIN UTILITIES
// ─────────────────────────────────────────────────────────────
export const getRegistryStats = (): { usernames: number } => ({
  usernames: getRegistry(USERNAME_REGISTRY_KEY).size,
});

export const _clearRegistry_DEV_ONLY = (): void => {
  localStorage.removeItem(USERNAME_REGISTRY_KEY);
};