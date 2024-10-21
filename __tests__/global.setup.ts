import { test as setup } from '@playwright/test'
import { YamlSettings } from '@/server/settings'

setup('create new database', () => {
  new YamlSettings('./config/settings.yml')
})
