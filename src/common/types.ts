export type VAR = {
  value: string | number
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
