import React from 'react'
import Wrapper from '@/client/components/wrapper'
import { getDevices, checkSettings, disconnect } from '@/app/actions'

export default function Home() {
  return <Wrapper getDevicesAction={getDevices} checkSettingsAction={checkSettings} disconnectAction={disconnect} />
}
