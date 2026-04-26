import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup high-fidelity mock server for mission-critical quality auditing
export const server = setupServer(...handlers);
