import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { Menu, MenuHandler, MenuList, MenuItem, Button } from '@material-tailwind/react'

type Props = {
  onClick: () => void
  onRefreshChange: (value: string) => void
  refreshInterval: string
  disabled: boolean
}

export default function Refresh(props: Props) {
  const { onClick, onRefreshChange, refreshInterval, disabled } = props

  const handleSelect = (event: any) => {
    const value = event.target.value
    onRefreshChange(value)
    localStorage.setItem('refreshInterval', value)
  }

  const isActive = (value: string) => {
    return refreshInterval === value ? 'bg-blue-700 text-white' : ''
  }

  return (
    <>
      <Button
        variant='filled'
        className='text-md inline-flex w-1/2 justify-center rounded-r-none border-r bg-gray-400 text-black shadow-none dark:bg-gray-800 dark:text-white'
        onClick={onClick}
        disabled={disabled}
      >
        <ArrowPathIcon className={`${disabled ? 'animate-spin' : ''} h-4 w-4 stroke-[2px]`} />
      </Button>
      <Menu>
        <MenuHandler>
          <Button
            variant='filled'
            className='text-md inline-flex w-1/2 justify-center rounded-l-none bg-gray-400 text-black shadow-none dark:bg-gray-800 dark:text-white'
          >
            <ChevronDownIcon className='h-4 w-4 stroke-[2px]' />
          </Button>
        </MenuHandler>
        <MenuList className='border-gray-300 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'>
          <MenuItem className={`text-lg font-semibold ${isActive('0')}`} value={'0'} onClick={handleSelect}>
            off
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('1')}`} value={'1'} onClick={handleSelect}>
            1s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('3')}`} value={'3'} onClick={handleSelect}>
            3s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('5')}`} value={'5'} onClick={handleSelect}>
            5s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('10')}`} value={'10'} onClick={handleSelect}>
            10s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('30')}`} value={'30'} onClick={handleSelect}>
            30s
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}
