export type VAR = {
  value: string
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
