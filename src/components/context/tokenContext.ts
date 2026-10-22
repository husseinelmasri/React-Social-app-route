import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type TokenContextType = {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

export const TokenContext = createContext<TokenContextType | null>(null);
