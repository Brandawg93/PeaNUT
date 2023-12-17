import React from 'react'
import { Grid } from 'gridjs-react'

export default function NutGrid(props: any) {
  const { data } = props
  let result: any = []
  if (data) {
    result = Object.entries(data).map(([k, v]) => ({ key: k.replace(/_/g, '.'), value: v || 'N/A' }))
    result.shift()
  }

  return <Grid data={result || (() => new Promise(() => {}))} columns={[{ name: 'key' }, { name: 'value' }]} sort />
}
