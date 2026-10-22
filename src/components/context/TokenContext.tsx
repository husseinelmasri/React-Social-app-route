import { useState } from 'react';
import type { ReactNode } from 'react';
import { TokenContext } from './tokenContext';

export default function TokenContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('userToken'),
  );

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
}
