import React from 'react'
import Connect from '@/client/components/connect'
import { addServer, testConnection } from '../actions'

export default function Login() {
  return <Connect addServerAction={addServer} testConnectionAction={testConnection} />
}
