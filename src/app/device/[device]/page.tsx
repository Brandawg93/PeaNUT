import React from 'react'
import DeviceWrapper from '@/client/components/device-wrapper'
import QueryWrapper from '@/client/context/query-client'
import { getDevice, runCommand, logout } from '@/app/actions'

export default async function Home({ params }: { readonly params: Promise<{ device: string }> }) {
  const { device } = await params
  // Decode URL-encoded device ID (e.g., "192.168.1.10%3A3493%2Fups" -> "192.168.1.10:3493/ups")
  const decodedDevice = decodeURIComponent(device)
  return (
    <QueryWrapper>
      <DeviceWrapper
        device={decodedDevice}
        getDeviceAction={getDevice}
        runCommandAction={runCommand}
        logoutAction={logout}
      />
    </QueryWrapper>
  )
}
