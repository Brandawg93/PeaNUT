'use client'

import React, { useContext, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiQuestionMarkCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'
import { TbSettings } from 'react-icons/tb'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import NavBar from '@/client/components/navbar'
import NavBarControls from '@/client/components/navbar-controls'
import Footer from '@/client/components/footer'
import Loader from '@/client/components/loader'
import { LanguageContext } from '@/client/context/language'
import { DevicesData, DEVICE } from '@/common/types'
import { upsStatus } from '@/common/constants'
import DayNightSwitch from './daynight'
import LanguageSwitcher from './language-switcher'
import { Card } from '@/client/components/ui/card'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table'
import { Progress } from '@/client/components/ui/progress'
type Props = Readonly<{
  getDevicesAction: () => Promise<DevicesData>
  logoutAction: () => void
}>

const getStatus = (status: string) => {
  if (!status) return <></>
  if (status.startsWith('OL')) {
    return <HiOutlineCheck data-testid='check-icon' className='mb-1 inline-block size-6 stroke-[3px] text-green-400' />
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
  } else {
    return <></>
  }
}

export default function Wrapper({ getDevicesAction, logoutAction }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: async () => await getDevicesAction(),
  })

  const columnHelper = createColumnHelper<DEVICE>()
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
      columnHelper.accessor((row) => row.vars['ups.status']?.value ?? 'N/A', {
        id: 'status',
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('status')}</span>,
        cell: (info) => {
          const status = info.getValue() as string
          return (
            <div className='flex items-center gap-2'>
              {getStatus(status)}
              <span className='text-primary mb-0 font-normal'>
                {upsStatus[status as keyof typeof upsStatus] || status}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor((row) => row.vars['battery.charge']?.value ?? 0, {
        id: 'batteryCharge',
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('batteryCharge')}</span>,
        cell: (info) => {
          const value = info.getValue() as number
          if (!value) return <>N/A</>
          return (
            <div className='flex items-center gap-2'>
              <Progress value={value} />
              <span>{value}%</span>
            </div>
          )
        },
      }),
      columnHelper.accessor((row) => row.vars['ups.load']?.value, {
        id: 'upsLoad',
        header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('currentLoad')}</span>,
        cell: (info) => {
          const value = info.getValue()
          if (!value) return <>N/A</>
          return (
            <div className='flex items-center gap-2'>
              <Progress value={value as number} />
              <span>{value}%</span>
            </div>
          )
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
              router.push(`/device/${info.getValue()}`)
            }}
          >
            <HiOutlineInformationCircle className='size-4' />
            {t('details')}
          </Button>
        ),
      }),
    ],
    [t, router]
  )

  const table = useReactTable({
    data: (data?.devices || []).filter((device) => {
      return device?.vars && Object.keys(device.vars).length > 0 && device.vars['ups.status']?.value !== 'N/A'
    }),
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const loadingWrapper = (
    <div
      className='bg-background absolute top-0 left-0 flex h-full w-full items-center justify-center text-center'
      data-testid='loading-wrapper'
    >
      <Loader />
    </div>
  )

  if (!data?.devices || isLoading) {
    return loadingWrapper
  }
  if (data.devices.length === 0) {
    return (
      <div className='bg-background flex h-full min-h-screen flex-col' data-testid='empty-wrapper'>
        <NavBar>
          <div className='flex justify-end space-x-2'>
            <DayNightSwitch />
            <LanguageSwitcher />
            <Button
              variant='ghost'
              size='lg'
              className='px-3'
              title={t('sidebar.settings')}
              aria-label={t('sidebar.settings')}
              onClick={() => router.push('/settings')}
            >
              <TbSettings className='size-6! stroke-[1.5px]' />
            </Button>
          </div>
        </NavBar>
        <div className='flex flex-1 flex-col items-center justify-center'>
          <Card className='border-border-card bg-card flex flex-col items-center p-6 shadow-none'>
            <div className='flex flex-col items-center pb-2'>
              <HiQuestionMarkCircle className='text-destructive mb-4 text-8xl' />
              <p>{t('noDevicesError')}</p>
            </div>
            <div>
              <Button
                variant='default'
                title={t('sidebar.settings')}
                className='shadow-none'
                onClick={() => router.push('/settings')}
              >
                <TbSettings className='size-6! stroke-[1.5px]' />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div data-testid='wrapper' className='bg-background flex h-full min-h-screen flex-col'>
      <NavBar>
        <NavBarControls
          disableRefresh={isLoading}
          onRefreshClick={() => refetch()}
          onRefetch={() => refetch()}
          onLogout={logoutAction}
          failedServers={data.failedServers}
        />
      </NavBar>
      <div className='flex grow justify-center px-3'>
        <div className='container'>
          <Card className='border-border-card bg-card mb-4 w-full border shadow-none'>
            <div className='p-4'>
              <Table className='w-full'>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
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
            </div>
          </Card>
        </div>
      </div>
      <div className='flex justify-center px-3'>
        <div className='container'>
          <Footer updated={data.updated} />
        </div>
      </div>
    </div>
  )
}
