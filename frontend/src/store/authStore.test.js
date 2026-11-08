import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null });
  });

  it('initializes with null user and token when localStorage is empty', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('stores user data and token on login', () => {
    const userData = { id: 'user-1', name: 'Admin', role: 'admin' };
    const token = 'sample-jwt-token';

    useAuthStore.getState().login(userData, token);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(userData);
    expect(state.token).toBe(token);
    expect(localStorage.getItem('token')).toBe(token);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(userData);
  });

  it('clears user data and token on logout', () => {
    useAuthStore.getState().login({ id: 'user-1' }, 'token-123');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
