import React from 'react'
import { Card } from '@material-tailwind/react'

type Props = {
  text: string
  description: string
}

export default function Kpi(props: Props) {
  const { text, description } = props
  return (
    <Card className='border-neutral-300 relative flex h-52 flex-row justify-around border border-solid border-gray-300 text-center shadow-none dark:border-gray-800 dark:bg-gray-950'>
      <div className='flex h-full flex-col justify-around pb-5 align-middle text-3xl font-semibold text-black dark:text-white'>
        {text}
      </div>
      <div className='absolute bottom-2.5 w-full text-xs font-semibold text-[#666666] dark:text-[#999999]'>
        {description}
      </div>
    </Card>
  )
}
