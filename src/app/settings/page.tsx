import React from 'react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import {
  checkSettings,
  getSettings,
  setSettings,
  exportSettings,
  importSettings,
  updateServers,
  deleteSettings,
  testConnection,
  testInfluxConnection,
} from '@/app/actions'

export default function Settings() {
  return (
    <SettingsWrapper
      checkSettingsAction={checkSettings}
      getSettingsAction={getSettings}
      setSettingsAction={setSettings}
      exportSettingsAction={exportSettings}
      importSettingsAction={importSettings}
      deleteSettingsAction={deleteSettings}
      updateServersAction={updateServers}
      testConnectionAction={testConnection}
      testInfluxConnectionAction={testInfluxConnection}
    />
  )
}
