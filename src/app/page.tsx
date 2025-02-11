import React from 'react'
import Wrapper from '@/client/components/wrapper'
import QueryWrapper from '@/client/context/query-client'
import { getDevices, checkSettings, runCommand } from '@/app/actions'

export default function Home() {
  return (
    <QueryWrapper>
      <Wrapper getDevicesAction={getDevices} checkSettingsAction={checkSettings} runCommandAction={runCommand} />
    </QueryWrapper>
  )
}
