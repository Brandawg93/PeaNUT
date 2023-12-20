import React from 'react'
import { Card, Typography } from '@material-tailwind/react'

type TableProps = {
  key: string
  value: any
}

export default function NutGrid(props: any) {
  const { data } = props

  if (!data || data.length === 0) {
    return null
  }
  let result: Array<TableProps> = []
  result = Object.entries(data)
    .filter(([k, v]) => k !== '__typename')
    .map(([k, v]) => ({ key: k.replace(/_/g, '.'), value: v || 'N/A' }))
  result.shift()

  return (
    <Card className='border-neutral-300 w-full overflow-scroll border border-solid shadow-none dark:bg-gray-950 border-gray-300 dark:border-gray-800'>
      <table className='w-full min-w-max table-auto text-left'>
        <thead>
          <tr>
            {Object.keys(result[0]).map((head: string, index: number) => {
              const isLast = index === Object.keys(result[0]).length - 1
              const lastClass = isLast ? '' : 'border-r'
              return (
                <th key={head} className={`border-b bg-gray-400 dark:bg-gray-700 dark:border-gray-600 ${lastClass} border-neutral-300 p-3`}>
                  <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>{head}</Typography>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {result.map(({ key, value }, index: number) => {
            const isLast = index === result.length - 1
            const lastClass = isLast ? '' : 'border-b dark:border-gray-800'
            return (
              <tr key={key}>
                <td className={`p-3 ${lastClass} border-neutral-300 border-r dark:border-gray-800`}>
                  <Typography className='mb-0 font-normal dark:text-white'>{key}</Typography>
                </td>
                <td className={`p-3 ${lastClass} border-neutral-300`}>
                  <Typography className='mb-0 font-normal dark:text-white'>{value}</Typography>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )

  // return <Grid data={result || (() => new Promise(() => {}))} columns={[{ name: 'key' }, { name: 'value' }]} sort />
}
