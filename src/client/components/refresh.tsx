import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import React, { useContext } from 'react'
import { Menu, MenuHandler, MenuList, MenuItem, Button } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'
type Props = {
  onClick: () => void
  onRefreshChange: (value: number) => void
  refreshInterval: number
  disabled: boolean
}

const intervals = [0, 1, 3, 5, 10, 30]

export default function Refresh(props: Props) {
  const { onClick, onRefreshChange, refreshInterval, disabled } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const handleSelect = (event: any) => {
    const value = event.target.value as number
    onRefreshChange(value)
    localStorage.setItem('refreshInterval', `${value}`)
  }

  const isActive = (value: number) => {
    return refreshInterval === value ? 'bg-blue-700 text-white' : ''
  }

  return (
    <>
      <Button
        variant='filled'
        title={t('sidebar.refresh')}
        className='text-md inline-flex w-1/2 justify-center rounded-r-none border-r bg-gray-400 text-black shadow-none hover:shadow-none dark:bg-gray-800 dark:text-white'
        onClick={onClick}
        disabled={disabled}
      >
        <ArrowPathIcon className={`${disabled ? 'animate-spin' : ''} h-4 w-4 stroke-[2px]`} />
      </Button>
      <Menu>
        <MenuHandler>
          <Button
            variant='filled'
            className='text-md inline-flex w-1/2 justify-center rounded-l-none bg-gray-400 text-black shadow-none hover:shadow-none dark:bg-gray-800 dark:text-white'
          >
            <ChevronDownIcon className='h-4 w-4 stroke-[2px]' />
          </Button>
        </MenuHandler>
        <MenuList className='min-w-0 border-gray-300 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'>
          {intervals.map((value) => (
            <MenuItem
              key={value}
              className={`text-lg font-semibold ${isActive(value)}`}
              value={value}
              onClick={handleSelect}
            >
              {value === 0 ? 'off' : `${value}s`}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  )
}
