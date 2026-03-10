// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock environment variables
process.env.GOVERNANCE_API_URL = 'http://api-governance-service:5001';
process.env.NEXT_PUBLIC_GOVERNANCE_API_URL = 'http://localhost:5001';
