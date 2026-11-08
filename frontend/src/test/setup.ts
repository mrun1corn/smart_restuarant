import '@testing-library/jest-dom';
import { act } from 'react';
import * as React from 'react';

// React 19 moved act to 'react' package
// @ts-ignore
if (!React.act) {
  // @ts-ignore
  React.act = act;
}

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
