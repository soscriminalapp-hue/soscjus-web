// Armazenamento de tokens no navegador. Só roda client-side.
// Chaves prefixadas pra não colidir com nada no domínio.

import type { AuthUser } from './types';

const ACCESS = 'soscjus.accessToken';
const REFRESH = 'soscjus.refreshToken';
const USER = 'soscjus.user';

const isBrowser = typeof window !== 'undefined';

export const tokens = {
  getAccess(): string | null {
    return isBrowser ? localStorage.getItem(ACCESS) : null;
  },
  getRefresh(): string | null {
    return isBrowser ? localStorage.getItem(REFRESH) : null;
  },
  getUser(): AuthUser | null {
    if (!isBrowser) return null;
    const raw = localStorage.getItem(USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  set(access: string, refresh: string, user: AuthUser): void {
    if (!isBrowser) return;
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
    localStorage.setItem(USER, JSON.stringify(user));
  },
  setAccess(access: string): void {
    if (isBrowser) localStorage.setItem(ACCESS, access);
  },
  clear(): void {
    if (!isBrowser) return;
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
  },
};
