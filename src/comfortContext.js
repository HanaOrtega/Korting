import { createContext } from 'react';
import { DEFAULTS, SCALES } from './comfort.js';

export const ComfortContext = createContext({ comfort: DEFAULTS, scale: SCALES[0], animated: true });
