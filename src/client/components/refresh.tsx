import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { Menu, MenuHandler, MenuList, MenuItem, IconButton } from '@material-tailwind/react'

export default function Refresh(props: any) {
  const { onClick, onRefetch, disabled } = props
  const [refreshInterval, setRefreshInterval] = useState(localStorage.getItem('refreshInterval') || '0')

  useEffect(() => {
    if (parseInt(refreshInterval) > 0) {
      const interval = setInterval(() => onRefetch(), parseInt(refreshInterval) * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, onRefetch])

  const handleSelect = (event: any) => {
    const value = event.target.value
    setRefreshInterval(value)
    localStorage.setItem('refreshInterval', value)
  }

  const isActive = (value: string) => {
    return refreshInterval === value ? 'bg-blue-700 text-white' : ''
  }

  return (
    <>
      <IconButton
        variant='outlined'
        className='text-md rounded-r-none dark:border-gray-500 dark:text-gray-100'
        onClick={onClick}
        disabled={disabled}
      >
        <ArrowPathIcon className={`${disabled ? 'animate-spin' : ''} h-4 w-4 stroke-[2px]`} />
      </IconButton>
      <Menu>
        <MenuHandler>
          <IconButton variant='outlined' className='text-md rounded-l-none dark:border-gray-500 dark:text-gray-100'>
            <ChevronDownIcon className='h-4 w-4 stroke-[2px]' />
          </IconButton>
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
