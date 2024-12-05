'use client'

import 'react-toastify/dist/ReactToastify.css'
import React, { useState, useMemo, useContext, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button, IconButton, Tooltip, ButtonGroup } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon, PencilSquareIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { LanguageContext } from '@/client/context/language'
import { ThemeContext } from '@/client/context/theme'
import { DEVICE } from '@/common/types'
import { getAllVarDescriptions, saveVar } from '@/app/actions'

type TableProps = {
  key: string
  value: string | number
}

type Props = {
  data: DEVICE
}

export default function NutGrid(props: Props) {
  const { data } = props
  const lng = useContext<string>(LanguageContext)
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation(lng)
  const [edit, setEdit] = useState<number>(-1)
  const ref = useRef<any>(null)
  const { data: descriptions } = useQuery({
    queryKey: ['deviceDescriptions', data.name, data.vars],
    queryFn: () => getAllVarDescriptions(data.name, Object.keys(data.vars)),
  })

  const anyRW = data.rwVars?.length > 0

  const result = useMemo<TableProps[]>(
    () => Object.entries(data.vars).map(([k, v]) => ({ key: k, value: v?.value || 'N/A' })),
    []
  )

  if (!data) {
    return null
  }

  const handleEdit = (index: number) => {
    setEdit(index)
  }

  const handleClose = () => {
    setEdit(-1)
  }

  const handleSave = async (key: string) => {
    try {
      const res = await saveVar(data.name, key, ref.current.value)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      if (ref.current) data.vars[key].value = ref.current.value
      handleClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const editinput = (key: string, value: string) => (
    <>
      <div className='flex'>
        <input
          ref={ref}
          type={Number.isNaN(+value) ? 'text' : 'number'}
          className='w-full flex-grow rounded border border-gray-300 bg-transparent pl-2 text-gray-800 dark:border-gray-800 dark:text-gray-100'
          defaultValue={value}
        />
        <ButtonGroup size='sm' variant='text' className='divide-none'>
          <Button className='px-2' onClick={async () => await handleSave(key)} variant='text'>
            <CheckCircleIcon className='h-6 w-6 text-green-500' />
          </Button>
          <Button className='px-2' variant='text' onClick={() => handleClose()}>
            <XCircleIcon className='h-6 w-6 text-red-500' />
          </Button>
        </ButtonGroup>
      </div>
    </>
  )

  const columnHelper = createColumnHelper<TableProps>()
  const columns = [
    columnHelper.accessor('key', {
      id: 'key',
      cell: (info) => (
        <div className='flex justify-between'>
          <Typography className='mb-0 inline font-normal dark:text-white'>{info.getValue()}</Typography>
          <Tooltip
            className='border border-gray-400 bg-gray-300 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
            content={
              <Typography>
                {(descriptions?.data && descriptions.data[info.getValue()]) || 'Descripion Unavailable'}
              </Typography>
            }
            placement='right'
          >
            <InformationCircleIcon className='mt-1 inline h-4 w-4' />
          </Tooltip>
        </div>
      ),
      header: () => (
        <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>{t('grid.key')}</Typography>
      ),
    }),
    columnHelper.accessor('value', {
      id: 'value',
      cell: (info) =>
        edit === info.row.index ? (
          editinput(info.row.getValue('key'), info.getValue().toString())
        ) : (
          <Typography className='mb-0 font-normal dark:text-white'>{info.getValue() || ' '}</Typography>
        ),
      header: () => (
        <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>{t('grid.value')}</Typography>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        const isRW = data.rwVars?.includes(row.original.key)
        return isRW ? (
          <Typography className='mb-0 font-normal dark:text-white'>
            <IconButton
              disabled={edit === row.index}
              onClick={() => handleEdit(row.index)}
              variant='filled'
              className='bg-gray-100 shadow-none dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100'
            >
              <PencilSquareIcon className='h-4 w-4 text-gray-800 dark:text-gray-100' />
            </IconButton>
          </Typography>
        ) : null
      },
    }),
  ].filter((column) => column.id !== 'actions' || anyRW) // Hide actions column if there are no RW vars

  const table = useReactTable({
    data: result,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card
      className='border-neutral-300 w-full overflow-auto border border-solid border-gray-300 shadow-none dark:border-gray-800 dark:bg-gray-950'
      data-testid='grid'
    >
      <ToastContainer position='top-center' theme={theme} />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`bg-gray-400 p-3 text-left ${header.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-b border-gray-300 dark:border-gray-600 dark:bg-gray-700`}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
            return (
              <tr key={row.id} aria-rowindex={index}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    className={`w-1/2 ${cell.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-t border-gray-300 p-3 dark:border-gray-800`}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

export const MemoizedGrid = React.memo(NutGrid, (prev, next) => prev.data === next.data) as typeof NutGrid
