import '@testing-library/jest-dom';

process.env.NEXT_PUBLIC_VIBE_TOKEN_CONTRACT_ID =
  process.env.NEXT_PUBLIC_VIBE_TOKEN_CONTRACT_ID || 'CD76SQMY64AT4AKTV6VHRF7MMHLC3JPQZ2W4TS57CS4VWE22E4A7G7K6';
process.env.NEXT_PUBLIC_JUKEBOX_CONTRACT_ID =
  process.env.NEXT_PUBLIC_JUKEBOX_CONTRACT_ID || 'CAVVNHZ3JH7M4MHFYVNKTR6BX6VLOUEG7R4DLEAWB26AXIVCMJBBB2QT';
process.env.NEXT_PUBLIC_HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
process.env.NEXT_PUBLIC_SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';


// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0;
  state = 'running';
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  resume() {
    return Promise.resolve();
  }
}

(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;
