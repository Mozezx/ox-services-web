import { createContext, useContext, ReactNode } from 'react'

export const SkipClerkContext = createContext(false)

export function useSkipClerk() {
  return useContext(SkipClerkContext)
}

export function SkipClerkProvider({ children, value }: { children: ReactNode; value: boolean }) {
  return (
    <SkipClerkContext.Provider value={value}>
      {children}
    </SkipClerkContext.Provider>
  )
}
