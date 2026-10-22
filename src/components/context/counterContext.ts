import { createContext, Dispatch, SetStateAction } from 'react';

type CounterContextType = {
  counter: number;
  setCounter: Dispatch<SetStateAction<number>>;
};

export const CounterContext = createContext<CounterContextType | null>(null);
