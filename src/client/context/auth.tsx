'use client'

import React, { createContext, useContext, useMemo } from 'react'

type AuthContextValue = {
  readonly authEnabled: boolean
}

const AuthContext = createContext<AuthContextValue>({ authEnabled: false })

type AuthProviderProps = Readonly<{
  authEnabled: boolean
  children: React.ReactNode
}>

export function AuthProvider({ authEnabled, children }: AuthProviderProps) {
  const value = useMemo(() => ({ authEnabled }), [authEnabled])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
