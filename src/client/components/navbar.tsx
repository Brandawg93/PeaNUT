import React, { useState } from 'react'
import Image from 'next/image'
import { Navbar, Typography, Select, Option } from '@material-tailwind/react'

import logo from '@/app/icon.svg'
import Refresh from './refresh'

export default function NavBar(props: any) {
  const { onRefreshClick, onRefreshIntervalChange, onDeviceChange, devices } = props
  const [device, setDevice] = useState(devices[0])

  const handleSelect = (eventKey: any) => {
    setDevice(devices.find((d: any) => d.device_serial === eventKey))
    onDeviceChange(eventKey)
  }

  const dropdown = (
    <Select variant='standard' label='Select Device' onChange={handleSelect} value={device.device_serial}>
      {devices.map((d: any) => (
        <Option key={d.device_serial} value={d.device_serial}>{`${d.device_mfr} ${d.device_model}`}</Option>
      ))}
    </Select>
  )

  return (
    <Navbar variant='gradient' color='gray' className='sticky top-0 z-10 mb-4 flex h-max max-w-full justify-center rounded-none px-4 py-2 lg:px-8 lg:py-4 bg-gradient-to-t from-gray-300 to-gray-100 dark:from-gray-950 dark:to-gray-900'>
      <div className='container'>
        <div className='flex items-center justify-between'>
          <Typography as='a' href='#' className='flex cursor-pointer py-1.5 text-xl text-black dark:text-white font-medium no-underline'>
            <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
            &nbsp;PeaNUT
          </Typography>
          <div className='flex items-center'>
            {devices.length > 1 ? dropdown : null}
            &nbsp;
            <Refresh onClick={onRefreshClick} onChange={onRefreshIntervalChange} />
          </div>
        </div>
      </div>
    </Navbar>
  )
}
