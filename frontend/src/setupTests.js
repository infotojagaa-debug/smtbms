import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish MISSION-CRITICAL API mocking before all tests
beforeAll(() => server.listen());

// Reset any runtime handlers tests may use
afterEach(() => server.resetHandlers());

// Terminate mock server upon cycle completion
afterAll(() => server.close());

// Mock high-fidelity browser globals
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};
