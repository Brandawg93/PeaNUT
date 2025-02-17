import React from 'react'
import Wrapper from '@/client/components/wrapper'
import QueryWrapper from '@/client/context/query-client'
import { getDevices, runCommand, logout } from '@/app/actions'

export default function Home() {
  return (
    <QueryWrapper>
      <Wrapper getDevicesAction={getDevices} runCommandAction={runCommand} logoutAction={logout} />
    </QueryWrapper>
  )
}
