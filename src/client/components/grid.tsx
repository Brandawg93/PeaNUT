'use client'

import 'react-toastify/dist/ReactToastify.css'
import React, { useState, useMemo, useContext } from 'react'
import { Card, Typography, Button, IconButton, Tooltip, ButtonGroup } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Bars4Icon,
  BarsArrowDownIcon,
} from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  ExpandedState,
} from '@tanstack/react-table'

import { LanguageContext } from '@/client/context/language'
import { ThemeContext } from '@/client/context/theme'
import { DEVICE } from '@/common/types'
import { saveVar } from '@/app/actions'

type Props = {
  data: DEVICE
}

interface TableProps {
  key: string
  value: string | number
  description?: string
}

interface HierarchicalTableProps extends TableProps {
  children?: HierarchicalTableProps[]
}

const transformInput = (input: TableProps[]): HierarchicalTableProps[] => {
  const root: HierarchicalTableProps[] = []

  input.forEach(({ key, value, description }) => {
    const keyParts = key.split('.')
    let currentLevel = root

    keyParts.forEach((part, index) => {
      let existingItem = currentLevel.find((item) => item.key === part)

      if (!existingItem) {
        existingItem = { key: part, value: index === keyParts.length - 1 ? value : '', description: '', children: [] }
        currentLevel.push(existingItem)
      }

      if (index === keyParts.length - 1) {
        existingItem.value = value // Assign the value at the last part
        existingItem.description = description || '' // Assign the description if available
      }

      currentLevel = existingItem.children || []
    })
  })

  return root
}

export default function NutGrid(props: Props) {
  const { data } = props
  const lng = useContext<string>(LanguageContext)
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation(lng)
  const [edit, setEdit] = useState<number>(-1)
  const [useTreeData, setUseTreeData] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const anyRW = data.rwVars?.length > 0

  const hierarchicalData = useMemo<HierarchicalTableProps[]>(
    () =>
      transformInput(
        Object.entries(data.vars).map(([k, v]) => ({ key: k, value: v?.value || 'N/A', description: v?.description }))
      ),
    [data.vars]
  )

  const flatData = useMemo<TableProps[]>(
    () =>
      Object.entries(data.vars).map(([k, v]) => ({ key: k, value: v?.value || 'N/A', description: v?.description })),
    [data.vars]
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

  const handleSave = async (key: string, value: string) => {
    try {
      const res = await saveVar(data.name, key, value)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      data.vars[key].value = value
      handleClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const editinput = (key: string, value: string) => (
    <>
      <div className='flex'>
        <input
          type={Number.isNaN(+value) ? 'text' : 'number'}
          className='w-full flex-grow rounded border border-gray-300 bg-transparent pl-2 text-gray-800 dark:border-gray-800 dark:text-gray-100'
          defaultValue={value}
        />
        <ButtonGroup size='sm' variant='text' className='divide-none'>
          <Button className='px-2' onClick={async () => await handleSave(key, value)} variant='text'>
            <CheckCircleIcon className='h-6 w-6 text-green-500' />
          </Button>
          <Button className='px-2' variant='text' onClick={() => handleClose()}>
            <XCircleIcon className='h-6 w-6 text-red-500' />
          </Button>
        </ButtonGroup>
      </div>
    </>
  )

  const columnHelper = createColumnHelper<HierarchicalTableProps>()
  const columns = [
    columnHelper.accessor('key', {
      id: 'key',
      cell: ({ row, getValue }) => {
        const expandStyle = row.getCanExpand() ? undefined : { cursor: 'default' }
        return (
          <div
            className='flex justify-between'
            style={{
              paddingLeft: `${row.depth * 2}rem`,
            }}
          >
            <button onClick={row.getToggleExpandedHandler()} className='flex' style={{ ...expandStyle }}>
              {row.getCanExpand() && (
                <div className='flex h-full flex-col justify-center'>
                  {row.getIsExpanded() ? (
                    <ChevronDownIcon className='h-4 w-4' />
                  ) : (
                    <ChevronRightIcon className='h-4 w-4' />
                  )}
                </div>
              )}
              <Typography
                className={`${!useTreeData || row.getCanExpand() ? 'px-0' : 'px-5'} mb-0 inline font-normal dark:text-white`}
              >
                {getValue()}
              </Typography>
            </button>
            {row.original.description && (
              <Tooltip
                className='border border-gray-400 bg-gray-300 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                content={<Typography>{row.original.description}</Typography>}
                placement='right'
              >
                <InformationCircleIcon className='mt-1 inline h-4 w-4' />
              </Tooltip>
            )}
          </div>
        )
      },
      header: () => (
        <div className='flex items-center justify-between'>
          <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>{t('grid.key')}</Typography>{' '}
          <IconButton
            onClick={() => setUseTreeData(!useTreeData)}
            variant='text'
            className='shadow-none dark:text-gray-100'
          >
            {useTreeData ? <BarsArrowDownIcon className='h-4 w-4' /> : <Bars4Icon className='h-4 w-4' />}
          </IconButton>
        </div>
      ),
    }),
    columnHelper.accessor('value', {
      id: 'value',
      cell: ({ row, getValue }) =>
        edit === row.index ? (
          editinput(row.getValue('key'), getValue().toString())
        ) : (
          <Typography className='mb-0 font-normal dark:text-white'>{getValue() || ' '}</Typography>
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

  const tableConfig = {
    data: flatData,
    columns,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
  }

  const treeTableConfig = {
    data: hierarchicalData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row: HierarchicalTableProps) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  }
  const table = useReactTable(useTreeData ? treeTableConfig : tableConfig)

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

export const MemoizedGrid = React.memo(NutGrid, (prev, next) => prev.data.vars === next.data.vars) as typeof NutGrid
