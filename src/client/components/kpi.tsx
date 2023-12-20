import React from 'react'
import { Card } from '@material-tailwind/react'

export default function Kpi(props: any) {
  const { text, description } = props
  return (
    <Card className='border-neutral-300 relative flex h-52 flex-row justify-around border border-solid text-center shadow-none dark:bg-gray-950 border-gray-300 dark:border-gray-800'>
      <div className='flex h-full flex-col justify-around pb-5 align-middle text-3xl font-semibold text-black dark:text-white'>
        {text}
      </div>
      <div className='absolute bottom-2.5 w-full text-xs font-semibold text-[#666666] dark:text-[#999999]'>{description}</div>
    </Card>
  )
}
