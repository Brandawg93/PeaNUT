import { NotifierSettings } from '@/common/types'
import { Ntfy, NtfyConfig } from '@/server/notifications/ntfy'
import { Stdout, StdoutConfig } from '@/server/notifications/stdout'

export function NotifierFactory(settings: NotifierSettings) {
  switch (settings.name) {
    case 'stdout':
      return new Stdout(settings.name, settings.triggers, settings.config as unknown as StdoutConfig)
    case 'ntfy':
      return new Ntfy(settings.name, settings.triggers, settings.config as unknown as NtfyConfig)
    default:
      throw new Error('Unknown notification provider ' + settings.name)
  }
}
