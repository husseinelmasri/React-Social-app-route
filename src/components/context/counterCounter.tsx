import { useState } from 'react';

import { CounterContext } from './counterContext';

export default function ContentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <CounterContext.Provider value={{ counter, setCounter }}>
        {children}
      </CounterContext.Provider>
    </>
  );
}
