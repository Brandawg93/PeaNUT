export type VAR = {
  value: string | number
  description?: string
  type?: string
  enum?: Array<string>
  range?: Array<string>
}

export type VARS = {
  [x: string]: VAR
}

export type DEVICE = {
  name: string
  description: string
  vars: VARS
  rwVars: Array<keyof VARS>
  commands: Array<string>
  clients: Array<string>
}

export type DeviceData = {
  devices: Array<DEVICE> | undefined
  updated: Date
  error: string | undefined
}

export type server = {
  HOST: string
  PORT: number
  USERNAME?: string
  PASSWORD?: string
}

export type VarDescription = {
  data: { [x: string]: string } | undefined
  error: string | undefined
}

export const NotificationProviders = ['ntfy', 'stdout'] as const
export const NotificationTriggerOperations = ['changes', 'is_below', 'is_above'] as const

export type NotificationTrigger = {
  variable: string
  operation: (typeof NotificationTriggerOperations)[number]
  targetValue?: number
}

export type NotifierSettings = {
  name: (typeof NotificationProviders)[number]
  triggers: Array<NotificationTrigger>
  config?: { [x: string]: string }
}

export type Notification = {
  title: string
  message?: string
  timestamp: Date
}
