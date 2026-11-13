import React from 'react'
import DeviceWrapper from '@/client/components/device-wrapper'
import QueryWrapper from '@/client/context/query-client'
import { getDevice, runCommand, logout } from '@/app/actions'
import { decodeDeviceId } from '@/lib/utils'

export default async function Home({ params }: { readonly params: Promise<{ device: string }> }) {
  const { device } = await params
  return (
    <QueryWrapper>
      <DeviceWrapper
        device={decodeDeviceId(device)}
        getDeviceAction={getDevice}
        runCommandAction={runCommand}
        logoutAction={logout}
      />
    </QueryWrapper>
  )
}
