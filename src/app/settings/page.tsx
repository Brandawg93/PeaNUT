import React from 'react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import { checkSettings, getSettings, setSettings } from '@/app/actions'

export default function Settings() {
  return (
    <SettingsWrapper
      checkSettingsAction={checkSettings}
      getSettingsAction={getSettings}
      setSettingsAction={setSettings}
    />
  )
}
