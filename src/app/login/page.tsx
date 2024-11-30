import React from 'react'
import Connect from '@/client/components/connect'
import { updateServers, testConnection } from '../actions'

export default function Login() {
  return <Connect updateServersAction={updateServers} testConnectionAction={testConnection} />
}
