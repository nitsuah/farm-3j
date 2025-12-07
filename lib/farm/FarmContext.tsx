'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FarmState, FarmAction } from './types';
import { farmReducer, initialFarmState } from './farmReducer';

interface FarmContextType {
  state: FarmState;
  dispatch: React.Dispatch;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(farmReducer, initialFarmState);

  return (
    <FarmContext.Provider value={{ state, dispatch }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
