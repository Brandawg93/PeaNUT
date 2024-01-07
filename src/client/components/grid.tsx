import React from 'react'
import { Card, IconButton, Typography } from '@material-tailwind/react'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'
import { DEVICE, VARS } from '@/common/types'

type TableProps = {
  key: string
  value: any
}

type Props = {
  data: DEVICE
  lng: string
}

export default function NutGrid(props: Props) {
  const { data } = props
  const { t } = useTranslation(props.lng)

  if (!data) {
    return null
  }
  let result: Array<TableProps> = []
  result = Object.entries(data.vars)
    .filter(([k, v]) => k !== '__typename')
    .map(([k, v]) => ({ key: k, value: v || 'N/A' }))
  result.shift()

  const editBtn = (
    <IconButton variant='filled' className='dark:border-gray-500 dark:text-gray-100'>
      <PencilSquareIcon className='h-4 w-4 text-gray-800 dark:text-gray-100' />
    </IconButton>
  )

  return (
    <Card className='border-neutral-300 w-full overflow-scroll border border-solid border-gray-300 shadow-none dark:border-gray-800 dark:bg-gray-950'>
      <table className='w-full min-w-max table-auto text-left'>
        <thead>
          <tr>
            {Object.keys(result[0]).map((head: string, index: number) => {
              return (
                <th
                  key={head}
                  className={`border-neutral-300 border-b border-r bg-gray-400 p-3 dark:border-gray-600 dark:bg-gray-700`}
                >
                  <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>
                    {t(`grid.${head}`)}
                  </Typography>
                </th>
              )
            })}
            <th className='border-neutral-300 w-[65px] border-b bg-gray-400 p-3 dark:border-gray-600 dark:bg-gray-700'>
              <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>&nbsp;</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.map(({ key, value }, index: number) => {
            const isLast = index === result.length - 1
            const lastClass = isLast ? '' : 'border-b dark:border-gray-800'
            const isRW = data.rwVars.includes(key as keyof VARS)
            return (
              <tr key={key}>
                <td className={`p-3 ${lastClass} border-neutral-300 border-r dark:border-gray-800`}>
                  <Typography className='mb-0 font-normal dark:text-white'>{key}</Typography>
                </td>
                <td className={`p-3 ${lastClass} border-neutral-300 border-r dark:border-gray-800`}>
                  <Typography className='mb-0 font-normal dark:text-white'>{value}</Typography>
                </td>
                <td className={`p-3 ${lastClass} border-neutral-300 w-[65px]`}>
                  <Typography className='mb-0 font-normal dark:text-white'>{isRW ? editBtn : null} </Typography>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
