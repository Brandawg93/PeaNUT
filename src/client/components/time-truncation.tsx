import { HiOutlineChevronDown, HiOutlineClock } from 'react-icons/hi2'
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
import { useTimeRange } from '@/client/context/time-range'

type Props = Readonly<{
  disabled: boolean
}>

// Time ranges in minutes (0 = all data)
const timeRanges = [
  { value: 0, label: 'all' },
  { value: 1, label: '1min' },
  { value: 5, label: '5min' },
  { value: 30, label: '30min' },
  { value: 60, label: '1hour' },
  { value: 1440, label: '24hours' },
]

export default function TimeTruncation(props: Props) {
  const { disabled } = props
  const { timeRange, setTimeRange } = useTimeRange()
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (value: number) => {
    setTimeRange(value)
    setIsOpen(false)
  }

  const isActive = (value: number) => {
    return timeRange === value ? 'bg-secondary-highlight!' : ''
  }

  return (
    <div className='flex'>
      <Button
        variant='secondary'
        title={t('sidebar.timeRange.title')}
        className='border-border-card pointer-events-none rounded-r-none border border-r-0 px-3 shadow-none disabled:opacity-100'
        disabled={true}
      >
        <HiOutlineClock className='size-4! stroke-2' />
      </Button>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='secondary'
            className='border-border-card cursor-pointer rounded-l-none border px-3 shadow-none'
            disabled={disabled}
          >
            <HiOutlineChevronDown
              className={`size-4 stroke-2 transition-transform ${isOpen ? 'rotate-180' : ''}`.trim()}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='min-w-0'>
          {timeRanges.map((range) => (
            <DropdownMenuItem
              key={range.value}
              className={`cursor-pointer text-lg font-semibold ${isActive(range.value)}`}
              onClick={() => handleSelect(range.value)}
            >
              {t(`sidebar.timeRange.${range.label}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
