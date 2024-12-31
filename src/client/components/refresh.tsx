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
  const [isOpen, setIsOpen] = React.useState(false)
  const [effect, setEffect] = React.useState(false)

  const handleSelect = (event: any) => {
    const value = event.target.value as number
    onRefreshChange(value)
    localStorage.setItem('refreshInterval', `${value}`)
    setIsOpen(false)
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
        onClick={() => {
          setEffect(true)
          onClick()
        }}
        onAnimationEnd={() => setEffect(false)}
        disabled={disabled}
      >
        <ArrowPathIcon className={`h-4 w-4 stroke-2 ${effect && 'animate-spin-once'}`.trim()} />
      </Button>
      <Menu open={isOpen} handler={setIsOpen}>
        <MenuHandler>
          <Button
            variant='filled'
            className='text-md inline-flex w-1/2 justify-center rounded-l-none bg-gray-400 text-black shadow-none hover:shadow-none dark:bg-gray-800 dark:text-white'
          >
            <ChevronDownIcon className={`h-4 w-4 stroke-2 transition-transform ${isOpen ? 'rotate-180' : ''}`.trim()} />
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
