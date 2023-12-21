import React, { useState } from 'react'
import Image from 'next/image'
import { Navbar, Typography, Select, Option } from '@material-tailwind/react'

import logo from '@/app/icon.svg'
import Refresh from './refresh'
import { DEVICE } from '@/common/types'

export default function NavBar(props: any) {
  const { onRefreshClick, onRefetch, onDeviceChange, devices, disableRefresh } = props
  const [device, setDevice] = useState(devices[0])

  const handleSelect = (eventKey: any) => {
    setDevice(devices.find((d: DEVICE) => d['device.serial'] === eventKey))
    onDeviceChange(eventKey)
  }

  const dropdown = (
    <Select variant='standard' label='Select Device' onChange={handleSelect} value={device['device.serial']}>
      {devices.map((d: DEVICE) => (
        <Option key={d['device.serial']} value={d['device.serial']}>{`${d['device.mfr']} ${d['device.model']}`}</Option>
      ))}
    </Select>
  )

  return (
    <Navbar
      variant='gradient'
      color='gray'
      className='sticky top-0 z-10 mb-4 flex h-max max-w-full justify-center rounded-none bg-gradient-to-t from-gray-300 to-gray-100 px-4 py-2 lg:px-8 lg:py-4 dark:from-gray-950 dark:to-gray-900'
    >
      <div className='container'>
        <div className='flex items-center justify-between'>
          <Typography
            as='a'
            href='#'
            className='flex cursor-pointer py-1.5 text-xl font-medium text-black no-underline dark:text-white'
          >
            <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
            &nbsp;PeaNUT
          </Typography>
          <div className='flex items-center'>
            {devices.length > 1 ? dropdown : null}
            &nbsp;
            <Refresh disabled={disableRefresh} onClick={onRefreshClick} onRefetch={onRefetch} />
          </div>
        </div>
      </div>
    </Navbar>
  )
}
