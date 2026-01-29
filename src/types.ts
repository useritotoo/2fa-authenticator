export interface Account {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  digits: number;
  period: number;
  order: number;
  isPublic: boolean;
}

export interface AccountWithCode extends Account {
  code: string;
  remaining: number;
}

export interface Env {
  KV: KVNamespace;
  ASSETS: Fetcher;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  PUBLIC_MODE?: string;
}
