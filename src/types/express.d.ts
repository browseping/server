declare global {
  namespace Express {
    interface Locals {
      incrementEmailAttempt?: () => Promise<void>;
      clearEmailAttempts?: () => Promise<void>;
    }
  }
}

export {};
