import { HiOutlineChevronDown, HiOutlineArrowPath } from 'react-icons/hi2'
import React, { useContext } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/client/components/ui/dropdown-menu'
import { Button } from '@/client/components/ui/button'
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

  const handleSelect = (value: number) => {
    onRefreshChange(value)
    localStorage.setItem('refreshInterval', `${value}`)
    setIsOpen(false)
  }

  const isActive = (value: number) => {
    return refreshInterval === value ? 'bg-secondary-highlight!' : ''
  }

  return (
    <>
      <Button
        variant='secondary'
        title={t('sidebar.refresh')}
        className='border-border-card rounded-r-none border border-r-0 px-3 shadow-none'
        onClick={() => {
          setEffect(true)
          onClick()
        }}
        onAnimationEnd={() => setEffect(false)}
        disabled={disabled}
      >
        <HiOutlineArrowPath className={`h-4! w-4! stroke-2 ${effect && 'animate-spin-once'}`.trim()} />
      </Button>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' className='border-border-card rounded-l-none border px-3 shadow-none'>
            <HiOutlineChevronDown
              className={`h-4 w-4 stroke-2 transition-transform ${isOpen ? 'rotate-180' : ''}`.trim()}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='min-w-0'>
          {intervals.map((value) => (
            <DropdownMenuItem
              key={value}
              className={`cursor-pointer text-lg font-semibold ${isActive(value)}`}
              onClick={() => handleSelect(value)}
            >
              {value === 0 ? 'off' : `${value}s`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
