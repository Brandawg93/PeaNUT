import React from 'react'
import DeviceWrapper from '@/client/components/device-wrapper'
import QueryWrapper from '@/client/context/query-client'
import { getDevice, runCommand, logout } from '@/app/actions'

export default async function Home({ params }: { params: Promise<{ device: string }> }) {
  const { device } = await params
  return (
    <QueryWrapper>
      <DeviceWrapper device={device} getDeviceAction={getDevice} runCommandAction={runCommand} logoutAction={logout} />
    </QueryWrapper>
  )
}
