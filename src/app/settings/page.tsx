import React from 'react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import {
  checkSettings,
  getSettings,
  setSettings,
  updateServers,
  testConnection,
  testInfluxConnection,
} from '@/app/actions'

export default function Settings() {
  return (
    <SettingsWrapper
      checkSettingsAction={checkSettings}
      getSettingsAction={getSettings}
      setSettingsAction={setSettings}
      updateServersAction={updateServers}
      testConnectionAction={testConnection}
      testInfluxConnectionAction={testInfluxConnection}
    />
  )
}
