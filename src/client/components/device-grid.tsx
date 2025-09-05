'use client'

import React, { useContext, memo, useMemo } from 'react'
import { LanguageContext } from '@/client/context/language'
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table'
import { DevicesData, DEVICE } from '@/common/types'
import { Button } from '@/client/components/ui/button'
import { Progress } from '@/client/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/client/components/ui/tooltip'
import {
  HiOutlineCheck,
  HiBolt,
  HiOutlineExclamationTriangle,
  HiOutlineExclamationCircle,
  HiXCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'
import { upsStatus, parseUpsStatus } from '@/common/constants'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@/hooks/useNavigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table'
import { secondsToDhms } from '@/lib/utils'

const columnHelper = createColumnHelper<DEVICE>()

type Props = Readonly<{
  data: DevicesData
}>

export default function DeviceGrid({ data }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { push } = useNavigation()

  const getStatus = (status: string) => {
    if (!status) return <></>
    if (status.startsWith('OL CHRG')) {
      return <HiBolt data-testid='bolt-icon' className='mb-1 inline-block size-6 text-yellow-400' />
    } else if (status.startsWith('OL')) {
      return (
        <HiOutlineCheck data-testid='check-icon' className='mb-1 inline-block size-6 stroke-[3px] text-green-400' />
      )
    } else if (status.startsWith('OB')) {
      return (
        <HiOutlineExclamationTriangle
          data-testid='triangle-icon'
          className='mb-1 inline-block size-6 stroke-[3px] text-yellow-400'
        />
      )
    } else if (status.startsWith('LB')) {
      return (
        <HiOutlineExclamationCircle
          data-testid='exclamation-icon'
          className='mb-1 inline-block size-6 stroke-[3px] text-red-400'
        />
      )
    } else if (status.startsWith(upsStatus.DEVICE_UNREACHABLE)) {
      return <HiXCircle data-testid='xcross-icon' className='mb-1 inline-block size-6 text-red-400' />
    } else {
      return <></>
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('device')}</span>,
        cell: (info) => <span className='text-primary mb-0 font-normal'>{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('description')}</span>,
        cell: (info) => <span className='text-primary mb-0 font-normal'>{info.getValue()}</span>,
      }),
      columnHelper.accessor(
        (row) => {
          const status = row.vars['ups.status']?.value
          return !status || status === '0' ? 'N/A' : status
        },
        {
          id: 'status',
          header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('status')}</span>,
          cell: (info) => {
            const status = info.getValue() as string
            return (
              <div className='flex items-center gap-2'>
                {getStatus(status)}
                <span className='text-primary mb-0 font-normal'>{parseUpsStatus(status) || status}</span>
              </div>
            )
          },
        }
      ),
      columnHelper.accessor((row) => row.vars['battery.charge']?.value ?? 0, {
        id: 'batteryCharge',
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('batteryCharge')}</span>,
        cell: (info) => {
          const value = info.getValue() as number
          const device = info.row.original
          const runtime = device.vars['battery.runtime']?.value
          const hasRuntime = runtime && +runtime > 0

          if (!value) return <>N/A</>

          const cellContent = (
            <div className='flex items-center gap-2'>
              <Progress value={value} />
              <span>{value}%</span>
            </div>
          )

          if (hasRuntime) {
            return (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <div className='w-full'>{cellContent}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t('batteryRuntime')}: {secondsToDhms(+runtime)}
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return cellContent
        },
      }),
      columnHelper.accessor((row) => row.vars['ups.load']?.value, {
        id: 'upsLoad',
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('currentLoad')}</span>,
        cell: (info) => {
          const value = info.getValue()
          const device = info.row.original
          const realpower = device.vars['ups.realpower']?.value
          const hasWattage = realpower && +realpower > 0

          if (!value) return <>N/A</>

          const cellContent = (
            <div className='flex items-center gap-2'>
              <Progress value={value as number} />
              <span>{value}%</span>
            </div>
          )

          if (hasWattage) {
            return (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <div className='w-full'>{cellContent}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t('currentWattage')}: {realpower}W
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return cellContent
        },
      }),
      columnHelper.accessor('name', {
        id: 'actions',
        header: () => <></>,
        cell: (info) => (
          <Button
            variant='outline'
            size='sm'
            className='flex cursor-pointer items-center gap-2'
            onClick={(e) => {
              e.stopPropagation()
              push(`/device/${info.getValue()}`)
            }}
          >
            <HiOutlineInformationCircle className='size-4' />
            {t('details')}
          </Button>
        ),
      }),
    ],
    [t, push]
  )

  const tableData = useMemo(
    () =>
      (data?.devices ?? []).filter((device) => {
        return device?.vars && Object.keys(device.vars).length > 0 && device.vars['ups.status']?.value !== 'N/A'
      }),
    [data?.devices]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table className='w-full'>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className='border-t p-3'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const MemoizedDeviceGrid = memo(DeviceGrid, (prev, next) => {
  // Only re-render if relevant device data has changed
  const prevDevices = prev.data.devices ?? []
  const nextDevices = next.data.devices ?? []

  // Check if devices array length changed
  if (prevDevices.length !== nextDevices.length) {
    return false // Re-render needed
  }

  // Check if any relevant device data has changed
  for (let i = 0; i < prevDevices.length; i++) {
    const prevDevice = prevDevices[i]
    const nextDevice = nextDevices[i]

    // Check if device name or description changed
    if (prevDevice.name !== nextDevice.name || prevDevice.description !== nextDevice.description) {
      return false // Re-render needed
    }

    // Check if relevant vars changed (only the ones used in the grid)
    const relevantVars = ['ups.status', 'battery.charge', 'ups.load']
    for (const varKey of relevantVars) {
      const prevValue = prevDevice.vars[varKey]?.value
      const nextValue = nextDevice.vars[varKey]?.value
      if (prevValue !== nextValue) {
        return false // Re-render needed
      }
    }
  }

  return true // No re-render needed
}) as typeof DeviceGrid
