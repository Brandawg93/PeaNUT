import React from 'react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import QueryWrapper from '@/client/context/query-client'
import { checkSettings, getSettings } from '@/app/actions'

export default function Settings() {
  return (
    <QueryWrapper>
      <SettingsWrapper checkSettingsAction={checkSettings} getSettingsAction={getSettings} />
    </QueryWrapper>
  )
}
