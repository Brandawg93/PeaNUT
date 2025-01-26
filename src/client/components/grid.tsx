'use client'

import React, { useState, useMemo, useContext } from 'react'
import { Button, IconButton, ButtonGroup } from '@material-tailwind/react'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineArrowUturnDown,
} from 'react-icons/hi2'
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
import { useTheme } from 'next-themes'
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
  originalKey?: string
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
        existingItem = {
          originalKey: keyParts.slice(0, index + 1).join('.'),
          key: part,
          value: index === keyParts.length - 1 ? value : '',
          description: '',
          children: [],
        }
        currentLevel.push(existingItem)
      }

      if (index === keyParts.length - 1) {
        existingItem.originalKey = key // Save the original key
        existingItem.value = value // Assign the value at the last part
        existingItem.description = description || '' // Assign the description if available
      }

      currentLevel = existingItem.children || []
    })
  })

  return root
}

export default function NutGrid({ data }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation(lng)
  const [edit, setEdit] = useState<string>('')
  const [useTreeData, setUseTreeData] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<ExpandedState>(true)
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

  const handleEdit = (key: string) => {
    setEdit(key)
  }

  const handleClose = () => {
    setEdit('')
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

  const editInput = (key: string, value: string) => (
    <div className='flex'>
      <input
        type={Number.isNaN(+value) ? 'text' : 'number'}
        className='w-full flex-grow rounded border border-gray-300 bg-transparent pl-2 text-gray-800 dark:border-gray-800 dark:text-gray-100'
        defaultValue={value}
      />
      <ButtonGroup size='sm' variant='text' className='divide-none'>
        <Button className='px-2' onClick={async () => await handleSave(key, value)} variant='text'>
          <HiOutlineCheckCircle className='h-6 w-6 text-green-500' />
        </Button>
        <Button className='px-2' variant='text' onClick={handleClose}>
          <HiOutlineXCircle className='h-6 w-6 text-red-500' />
        </Button>
      </ButtonGroup>
    </div>
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
                    <HiOutlineChevronDown className='h-4 w-4' />
                  ) : (
                    <HiOutlineChevronRight className='h-4 w-4' />
                  )}
                </div>
              )}
              <span
                className={`${!useTreeData || row.getCanExpand() ? 'px-0' : 'px-5'} mb-0 inline font-normal text-primary`}
              >
                {getValue()}
              </span>
            </button>
            {row.original.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='flex flex-col justify-center'>
                    <HiOutlineInformationCircle className='h-4 w-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent side='right' className='border bg-primary-foreground text-sm text-muted-foreground'>
                    <span>{row.original.description}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      },
      header: () => (
        <div className='flex items-center justify-between'>
          <button disabled={!useTreeData} onClick={table.getToggleAllRowsExpandedHandler()} className='flex'>
            {useTreeData && (
              <div className='flex h-[28px] flex-col justify-center'>
                {table.getIsAllRowsExpanded() ? (
                  <HiOutlineChevronDown className='h-4 w-4 text-primary' />
                ) : (
                  <HiOutlineChevronRight className='h-4 w-4 text-primary' />
                )}
              </div>
            )}
            <span className='mb-0 text-lg font-semibold text-primary'>{t('grid.key')}</span>
          </button>
          <IconButton onClick={() => setUseTreeData(!useTreeData)} variant='text' className='text-primary shadow-none'>
            <HiOutlineArrowUturnDown className={`${useTreeData ? '-rotate-90' : 'rotate-0'} h-4 w-4`} />
          </IconButton>
        </div>
      ),
    }),
    columnHelper.accessor('value', {
      id: 'value',
      cell: ({ row, getValue }) =>
        edit === (useTreeData ? row.original.originalKey : row.original.key) ? (
          editInput(row.getValue('key'), getValue().toString())
        ) : (
          <span className='mb-0 font-normal text-primary'>{getValue() || ' '}</span>
        ),
      header: () => <span className='mb-0 text-lg font-semibold text-primary'>{t('grid.value')}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        const key = useTreeData ? row.original.originalKey || '' : row.original.key
        const isRW = data.rwVars?.includes(key)
        return isRW ? (
          <span className='mb-0 font-normal text-primary'>
            <IconButton
              disabled={edit === (useTreeData ? row.original.originalKey : row.original.key)}
              onClick={() => handleEdit(useTreeData ? row.original.originalKey || '' : row.original.key)}
              variant='filled'
              className='bg-gray-100 shadow-none dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100'
            >
              <HiOutlinePencilSquare className='h-4 w-4 text-gray-800 dark:text-gray-100' />
            </IconButton>
          </span>
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
    <Card className='w-full overflow-auto border border-border-card shadow-none' data-testid='grid'>
      <ToastContainer position='top-center' theme={resolvedTheme} />
      <table className='w-full table-auto'>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`bg-gray-400 p-3 text-left ${header.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-b dark:bg-gray-700`}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} aria-rowindex={index}>
              {row.getVisibleCells().map((cell) => (
                <td
                  className={`w-1/2 ${cell.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-t p-3`}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export const MemoizedGrid = React.memo(NutGrid, (prev, next) => prev.data.vars === next.data.vars) as typeof NutGrid
