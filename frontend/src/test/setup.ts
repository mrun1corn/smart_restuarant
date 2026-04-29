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
