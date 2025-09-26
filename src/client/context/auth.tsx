'use client'

import React, { createContext, useContext } from 'react'

type AuthContextValue = {
  readonly authEnabled: boolean
}

const AuthContext = createContext<AuthContextValue>({ authEnabled: false })

type AuthProviderProps = Readonly<{
  authEnabled: boolean
  children: React.ReactNode
}>

export function AuthProvider({ authEnabled, children }: AuthProviderProps) {
  return <AuthContext.Provider value={{ authEnabled }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
