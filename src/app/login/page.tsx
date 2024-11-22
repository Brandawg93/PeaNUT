import React from 'react'
import Connect from '@/client/components/connect'
import { setSettings, testConnection } from '../actions'

export default function Login() {
  return <Connect setSettingsAction={setSettings} testConnectionAction={testConnection} />
}
