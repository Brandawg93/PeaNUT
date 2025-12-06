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

// Raw device info returned directly from NUT protocol (before adding id/server)
export type NutDevice = {
  name: string
  description: string
  vars: VARS
  rwVars: Array<keyof VARS>
  commands: Array<string>
  clients: Array<string>
}

// Full device with composite ID and server info for multi-server support
export type DEVICE = NutDevice & {
  id: string // URL-safe identifier "host_port_name" for unique identification
  server: string // "host:port" for display/disambiguation
}

export type DevicesData = {
  devices: Array<DEVICE> | undefined
  updated: Date
  failedServers: Array<string> | undefined
}

export type DeviceData = {
  device: DEVICE
  updated: Date
}

export type server = {
  HOST: string
  PORT: number
  USERNAME?: string
  PASSWORD?: string
  DISABLED?: boolean
}

export type VarDescription = {
  data: { [x: string]: string } | undefined
  error: string | undefined
}
