import React from 'react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import {
  checkSettings,
  getSettings,
  setSettings,
  updateServers,
  deleteSettings,
  testConnection,
  testInfluxConnection,
  updateNotificationProviders,
  testNotificationProvider,
} from '@/app/actions'

export default function Settings() {
  return (
    <SettingsWrapper
      checkSettingsAction={checkSettings}
      getSettingsAction={getSettings}
      setSettingsAction={setSettings}
      deleteSettingsAction={deleteSettings}
      updateServersAction={updateServers}
      testConnectionAction={testConnection}
      testInfluxConnectionAction={testInfluxConnection}
      updateNotificationProvidersAction={updateNotificationProviders}
      testNotificationProviderAction={testNotificationProvider}
    />
  )
}
