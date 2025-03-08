import React from 'react'
import Wrapper from '@/client/components/wrapper'
import QueryWrapper from '@/client/context/query-client'
import { getDevices, logout } from '@/app/actions'

export default function Home() {
  return (
    <QueryWrapper>
      <Wrapper getDevicesAction={getDevices} logoutAction={logout} />
    </QueryWrapper>
  )
}
