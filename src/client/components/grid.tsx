'use client'

import React, { useState, useMemo, useContext, useEffect, memo } from 'react'
import { Card, CardContent } from '@/client/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table'
import { Input } from '@/client/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/client/components/ui/popover'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/client/components/ui/accordion'
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
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/utils'

type Props = Readonly<{
  data: DEVICE
  onRefetchAction: () => void
}>

interface TableProps {
  key: string
  value: string | number
  description?: string
}

interface HierarchicalTableProps extends TableProps {
  originalKey?: string
  children?: HierarchicalTableProps[]
}

const GRID_ID = 'accordion-grid'

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
          description: i === keyParts.length - 1 ? (description ?? '') : '',
          children: [],
        }
        cache[currentPath] = newItem
        currentLevel.push(newItem)
      }

      currentLevel = cache[currentPath].children ?? []
    }
  })

  return root
}

export default function NutGrid({ data, onRefetchAction }: Props) {
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
    const storedState = getLocalStorageItem(GRID_ID)
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
                    <HiOutlineChevronDown className='size-5!' />
                  ) : (
                    <HiOutlineChevronRight className='size-5!' />
                  )}
                </div>
              )}
              <div className='flex h-full flex-col justify-center'>
                <span
                  className={`${!useTreeData || row.getCanExpand() ? 'px-0' : 'px-5'} text-primary mb-0 inline font-normal`}
                >
                  {getValue()}
                </span>
              </div>
            </button>
            {row.original.description && (
              <Popover>
                <PopoverTrigger asChild className='flex flex-col justify-center'>
                  <Button variant='ghost' size='icon' className='cursor-pointer hover:bg-transparent'>
                    <HiOutlineInformationCircle className='text-muted-foreground size-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side='right'
                  className='border-border-card bg-muted text-muted-foreground border text-sm'
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
                  <HiOutlineChevronDown className='size-5!' />
                ) : (
                  <HiOutlineChevronRight className='size-5!' />
                )}
              </div>
            )}
            <span className='text-primary mb-0 text-lg font-semibold'>{t('grid.key')}</span>
          </button>
          <Button onClick={() => setUseTreeData(!useTreeData)} variant='ghost' className='cursor-pointer shadow-none'>
            {useTreeData ? <TbListTree className='size-6!' /> : <TbList className='size-6!' />}
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
          <span className='text-primary mb-0 font-normal'>{getValue() || ' '}</span>
        ),
      header: () => <span className='text-primary mb-0 text-lg font-semibold'>{t('grid.value')}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        const key = useTreeData ? (row.original.originalKey ?? '') : row.original.key
        const isRW = data.rwVars?.includes(key)
        return isRW ? (
          <span className='text-primary mb-0 font-normal'>
            <Button
              disabled={edit === (useTreeData ? row.original.originalKey : row.original.key)}
              onClick={() => handleEdit(useTreeData ? (row.original.originalKey ?? '') : row.original.key)}
              variant='secondary'
              className='cursor-pointer shadow-none'
            >
              <HiOutlinePencilSquare className='size-4!' />
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
        toast.error(String(res.error))
        return
      }

      handleClose()
      onRefetchAction()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      toast.error(message)
    }
  }

  const editInput = (key: string, value: string) => (
    <div className='flex'>
      <Input
        type={Number.isNaN(+value) ? 'text' : 'number'}
        className='w-full grow rounded border bg-transparent pl-2'
        defaultValue={value}
      />
      <div className='flex'>
        <Button className='cursor-pointer px-2' size='icon' onClick={() => handleSave(key, value)} variant='ghost'>
          <HiOutlineCheckCircle className='size-6! text-green-500' />
        </Button>
        <Button className='cursor-pointer px-2' size='icon' variant='ghost' onClick={handleClose}>
          <HiOutlineXCircle className='size-6! text-red-500' />
        </Button>
      </div>
    </div>
  )

  const handleAccordionChange = (value: boolean) => {
    // Store the new state in localStorage
    setLocalStorageItem(GRID_ID, value ? 'open' : 'closed')
    setAccordionOpen(value)
  }

  return (
    <Card className='border-border-card bg-card w-full border py-0 shadow-none' data-testid='grid'>
      <CardContent className='p-0!'>
        <Accordion
          type='single'
          collapsible
          className='w-full'
          value={accordionOpen ? GRID_ID : ''}
          onValueChange={() => handleAccordionChange(!accordionOpen)}
        >
          <AccordionItem value={GRID_ID} className='border-b-0!'>
            <AccordionTrigger className='cursor-pointer p-3'>{t(GRID_ID)}</AccordionTrigger>
            <AccordionContent className='overflow-auto pb-0!'>
              <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
              <Table className='w-full'>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`p-3 text-left ${header.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-border-card bg-muted border-b`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row, index) => (
                    <TableRow key={row.id} aria-rowindex={index}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          className={`w-1/2 ${cell.column.getIndex() === columns.length - 1 ? 'border-r-0' : 'border-r'} border-t p-3`}
                          key={cell.id}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export const MemoizedGrid = memo(NutGrid, (prev, next) => prev.data.vars === next.data.vars) as typeof NutGrid
