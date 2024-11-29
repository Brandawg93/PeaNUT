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

export type server = {
  HOST: string
  PORT: number
  USERNAME?: string
  PASSWORD?: string
}
