// Fully local, device-only account system. No network, no cloud.
// Accounts and the active session live in the browser's storage.

const ACCOUNTS_KEY = "skillwise-accounts-v1";
const SESSION_KEY = "skillwise-session-v1";

export type LocalAccount = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type LocalUser = Pick<LocalAccount, "id" | "email" | "fullName" | "phone">;

function readAccounts(): LocalAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as LocalAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: LocalAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomHex(bytes = 16) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function toUser(account: LocalAccount): LocalUser {
  return { id: account.id, email: account.email, fullName: account.fullName, phone: account.phone };
}

export function getCurrentUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.sessionStorage.getItem(SESSION_KEY) ?? window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const account = readAccounts().find((item) => item.id === raw);
  return account ? toUser(account) : null;
}

function startSession(id: string, remember: boolean) {
  window.sessionStorage.setItem(SESSION_KEY, id);
  if (remember) window.localStorage.setItem(SESSION_KEY, id);
  else window.localStorage.removeItem(SESSION_KEY);
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

export async function registerAccount(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}): Promise<{ user?: LocalUser; error?: string }> {
  const email = normalizeEmail(input.email);
  const accounts = readAccounts();
  if (accounts.some((account) => account.email === email)) {
    return { error: "An account already exists for this email. Sign in instead." };
  }
  const salt = randomHex();
  const account: LocalAccount = {
    id: randomHex(8),
    email,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    salt,
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  startSession(account.id, true);
  return { user: toUser(account) };
}

export async function signIn(
  email: string,
  password: string,
  remember = true,
): Promise<{ user?: LocalUser; error?: string }> {
  const account = readAccounts().find((item) => item.email === normalizeEmail(email));
  if (!account) return { error: "No account found for this email." };
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) return { error: "Incorrect password." };
  startSession(account.id, remember);
  return { user: toUser(account) };
}

export async function changePassword(
  email: string,
  currentPassword: string,
  nextPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const accounts = readAccounts();
  const index = accounts.findIndex((item) => item.email === normalizeEmail(email));
  const account = accounts[index];
  if (!account) return { ok: false, error: "Account not found." };
  const hash = await hashPassword(currentPassword, account.salt);
  if (hash !== account.passwordHash) return { ok: false, error: "Current password is incorrect." };
  const salt = randomHex();
  accounts[index] = { ...account, salt, passwordHash: await hashPassword(nextPassword, salt) };
  writeAccounts(accounts);
  return { ok: true };
}

export async function resetPassword(
  email: string,
  nextPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const accounts = readAccounts();
  const index = accounts.findIndex((item) => item.email === normalizeEmail(email));
  const account = accounts[index];
  if (!account) return { ok: false, error: "No account found for this email." };
  const salt = randomHex();
  accounts[index] = { ...account, salt, passwordHash: await hashPassword(nextPassword, salt) };
  writeAccounts(accounts);
  return { ok: true };
}

export function deleteAccount(id: string) {
  writeAccounts(readAccounts().filter((account) => account.id !== id));
  signOut();
}
