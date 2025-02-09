'use client'

import React, { useState, useMemo, useContext, useEffect } from 'react'
import { Card, CardContent } from '@/client/components/ui/card'
import { Input } from '@/client/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/client/components/ui/popover'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
} from 'react-icons/hi2'
import { LuChevronDown } from 'react-icons/lu'
import { TbList, TbListTree } from 'react-icons/tb'
import { Toaster, toast } from 'sonner'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/client/components/ui/collapsible'

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
  const cache: { [key: string]: HierarchicalTableProps } = {}

  input.forEach(({ key, value, description }) => {
    const keyParts = key.split('.')
    let currentPath = ''
    let currentLevel = root

    for (let i = 0; i < keyParts.length; i++) {
      const part = keyParts[i]
      currentPath = currentPath ? `${currentPath}.${part}` : part

      if (!cache[currentPath]) {
        const newItem: HierarchicalTableProps = {
          originalKey: currentPath,
          key: part,
          value: i === keyParts.length - 1 ? value : '',
          description: i === keyParts.length - 1 ? description || '' : '',
          children: [],
        }
        cache[currentPath] = newItem
        currentLevel.push(newItem)
      }

      currentLevel = cache[currentPath].children || []
    }
  })

  return root
}

export default function NutGrid({ data }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { theme } = useTheme()
  const { t } = useTranslation(lng)
  const [edit, setEdit] = useState<string>('')
  const [useTreeData, setUseTreeData] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<ExpandedState>(true)
  const [accordionOpen, setAccordionOpen] = useState<boolean>(true)
  const anyRW = data.rwVars?.length > 0

  useEffect(() => {
    // Get stored state from localStorage
    const storedState = localStorage.getItem('collapsible-grid')
    // Set to stored value if exists, otherwise default to open (id)
    setAccordionOpen(!storedState || storedState === 'open')
  }, [])

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
                    <HiOutlineChevronDown className='!h-5 !w-5' />
                  ) : (
                    <HiOutlineChevronRight className='!h-5 !w-5' />
                  )}
                </div>
              )}
              <div className='flex h-full flex-col justify-center'>
                <span
                  className={`${!useTreeData || row.getCanExpand() ? 'px-0' : 'px-5'} mb-0 inline font-normal text-primary`}
                >
                  {getValue()}
                </span>
              </div>
            </button>
            {row.original.description && (
              <Popover>
                <PopoverTrigger asChild className='flex flex-col justify-center'>
                  <Button variant='ghost' size='icon' className='hover:bg-transparent'>
                    <HiOutlineInformationCircle className='h-4 w-4 text-muted-foreground' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side='right'
                  className='border border-border-card bg-muted text-sm text-muted-foreground'
                >
                  <span>{row.original.description}</span>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )
      },
      header: ({ table }) => (
        <div className='flex items-center justify-between'>
          <button disabled={!useTreeData} onClick={table.getToggleAllRowsExpandedHandler()} className='flex'>
            {useTreeData && (
              <div className='flex h-[28px] flex-col justify-center'>
                {table.getIsAllRowsExpanded() ? (
                  <HiOutlineChevronDown className='!h-5 !w-5' />
                ) : (
                  <HiOutlineChevronRight className='!h-5 !w-5' />
                )}
              </div>
            )}
            <span className='mb-0 text-lg font-semibold text-primary'>{t('grid.key')}</span>
          </button>
          <Button onClick={() => setUseTreeData(!useTreeData)} variant='ghost' className='shadow-none'>
            {useTreeData ? <TbListTree className='!h-6 !w-6' /> : <TbList className='!h-6 !w-6' />}
          </Button>
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
            <Button
              disabled={edit === (useTreeData ? row.original.originalKey : row.original.key)}
              onClick={() => handleEdit(useTreeData ? row.original.originalKey || '' : row.original.key)}
              variant='secondary'
              className='shadow-none'
            >
              <HiOutlinePencilSquare className='!h-4 !w-4' />
            </Button>
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
      // eslint-disable-next-line react-compiler/react-compiler
      data.vars[key].value = value
      handleClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const editInput = (key: string, value: string) => (
    <div className='flex'>
      <Input
        type={Number.isNaN(+value) ? 'text' : 'number'}
        className='w-full flex-grow rounded border bg-transparent pl-2'
        defaultValue={value}
      />
      <div className='flex'>
        <Button className='px-2' size='icon' onClick={async () => await handleSave(key, value)} variant='ghost'>
          <HiOutlineCheckCircle className='!h-6 !w-6 text-green-500' />
        </Button>
        <Button className='px-2' size='icon' variant='ghost' onClick={handleClose}>
          <HiOutlineXCircle className='!h-6 !w-6 text-red-500' />
        </Button>
      </div>
    </div>
  )

  const handleCollapsibleChange = (value: boolean) => {
    // Store the new state in localStorage
    localStorage.setItem('collapsible-grid', value ? 'open' : 'closed')
    setAccordionOpen(value)
  }

  return (
    <Card className='w-full overflow-auto border border-border-card bg-card shadow-none' data-testid='grid'>
      <CardContent className='!p-0'>
        <Collapsible
          className='relative min-h-[40px] w-full'
          open={accordionOpen}
          onOpenChange={handleCollapsibleChange}
        >
          <CollapsibleTrigger className='absolute right-0 bg-transparent p-3'>
            <LuChevronDown
              className={`lucide lucide-chevron-down h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${accordionOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
            <table className='w-full table-auto'>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`p-3 text-left ${header.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-b border-border-card bg-muted`}
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

export const MemoizedGrid = React.memo(NutGrid, (prev, next) => prev.data.vars === next.data.vars) as typeof NutGrid
