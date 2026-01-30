'use client'

import React, { useState, useMemo, useContext, memo, useRef } from 'react'
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
import { TbList, TbListTree, TbFilter, TbFilterFilled } from 'react-icons/tb'
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

const EditInput = ({
  varKey,
  value,
  onSave,
  onClose,
}: {
  varKey: string
  value: string
  onSave: (key: string, value: string) => void
  onClose: () => void
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSave = () => {
    const currentValue = inputRef.current?.value ?? value
    onSave(varKey, currentValue)
  }

  return (
    <div className='flex'>
      <Input
        ref={inputRef}
        type={Number.isNaN(+value) ? 'text' : 'number'}
        className='w-full grow rounded border bg-transparent pl-2'
        defaultValue={value}
      />
      <div className='flex'>
        <Button
          className='cursor-pointer px-2'
          size='icon'
          onClick={handleSave}
          variant='ghost'
          aria-label='Save changes'
        >
          <HiOutlineCheckCircle className='size-6! text-green-500' />
        </Button>
        <Button className='cursor-pointer px-2' size='icon' variant='ghost' onClick={onClose} aria-label='Cancel edit'>
          <HiOutlineXCircle className='size-6! text-red-500' />
        </Button>
      </div>
    </div>
  )
}

const KeyCell = ({ row, useTreeData, getValue }: { row: any; useTreeData: boolean; getValue: () => string }) => {
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
          <PopoverContent side='right' className='border-border-card bg-muted text-muted-foreground border text-sm'>
            <span>{row.original.description}</span>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

const KeyHeader = ({
  table,
  useTreeData,
  t,
  filterOpen,
  setFilterOpen,
  keyFilter,
  filterInputRef,
  setKeyFilter,
  setUseTreeData,
}: {
  table: any
  useTreeData: boolean
  t: (key: string) => string
  filterOpen: boolean
  setFilterOpen: (open: boolean) => void
  keyFilter: string
  filterInputRef: React.RefObject<HTMLInputElement | null>
  setKeyFilter: (val: string) => void
  setUseTreeData: (val: boolean) => void
}) => (
  <div className='flex items-center justify-between gap-2'>
    <button type='button' disabled={!useTreeData} onClick={table.getToggleAllRowsExpandedHandler()} className='flex'>
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
    <div className='flex items-center gap-2'>
      <Popover
        open={filterOpen}
        onOpenChange={(open) => {
          setFilterOpen(open)
          if (open && filterInputRef.current) {
            filterInputRef.current.value = keyFilter
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant={keyFilter ? 'secondary' : 'ghost'}
            size='icon'
            aria-label={t('grid.filter.placeholder')}
            type='button'
            className='relative cursor-pointer shadow-none'
          >
            {keyFilter ? <TbFilterFilled className='size-5! text-blue-600' /> : <TbFilter className='size-5!' />}
            {keyFilter && <span className='absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500'></span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='border-border-card bg-muted flex w-64 flex-col gap-2 border p-3' align='end'>
          <div className='relative flex gap-2'>
            <Input
              defaultValue={keyFilter}
              ref={filterInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setFilterOpen(false)
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  const value = filterInputRef.current?.value || ''
                  setKeyFilter(value)
                  setFilterOpen(false)
                }
              }}
              placeholder={t('grid.filter.placeholder')}
              className='border-border-card bg-background!'
            />
            <div className='flex justify-end gap-2 pt-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='hover:bg-primary-foreground! h-7 w-7 cursor-pointer p-0'
                aria-label={t('grid.filter.apply')}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const value = filterInputRef.current?.value || ''
                  setKeyFilter(value)
                  setFilterOpen(false)
                }}
              >
                <HiOutlineCheckCircle className='size-6 text-green-500' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='hover:bg-primary-foreground! h-7 w-7 cursor-pointer p-0'
                aria-label={t('grid.filter.clear')}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (filterInputRef.current) {
                    filterInputRef.current.value = ''
                  }
                  setKeyFilter('')
                  setFilterOpen(false)
                }}
              >
                <HiOutlineXCircle className='size-6 text-red-500' />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type='button'
        onClick={() => setUseTreeData(!useTreeData)}
        variant='ghost'
        className='cursor-pointer shadow-none'
      >
        {useTreeData ? <TbListTree className='size-6!' /> : <TbList className='size-6!' />}
      </Button>
    </div>
  </div>
)

const ValueHeader = ({ t }: { t: (key: string) => string }) => (
  <span className='text-primary mb-0 text-lg font-semibold'>{t('grid.value')}</span>
)

const ValueCell = ({
  row,
  useTreeData,
  getValue,
  edit,
  handleSave,
  handleClose,
}: {
  row: any
  useTreeData: boolean
  getValue: () => any
  edit: string
  handleSave: (key: string, value: string) => void
  handleClose: () => void
}) => {
  const key = useTreeData ? row.original.originalKey : row.original.key
  if (edit === key) {
    return (
      <EditInput varKey={row.getValue('key')} value={getValue().toString()} onSave={handleSave} onClose={handleClose} />
    )
  }
  return <span className='text-primary mb-0 font-normal'>{getValue() || ' '}</span>
}

const ActionsCell = ({
  row,
  useTreeData,
  data,
  edit,
  handleEdit,
}: {
  row: any
  useTreeData: boolean
  data: DEVICE
  edit: string
  handleEdit: (key: string) => void
}) => {
  const key = useTreeData ? (row.original.originalKey ?? '') : row.original.key
  const isRW = data.rwVars?.includes(key)
  if (!isRW) return null

  return (
    <span className='text-primary mb-0 font-normal'>
      <Button
        disabled={edit === (useTreeData ? row.original.originalKey : row.original.key)}
        onClick={() => handleEdit(useTreeData ? (row.original.originalKey ?? '') : row.original.key)}
        variant='secondary'
        className='cursor-pointer shadow-none'
        aria-label='Edit variable'
      >
        <HiOutlinePencilSquare className='size-4!' />
      </Button>
    </span>
  )
}

export default function NutGrid({ data, onRefetchAction }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { theme } = useTheme()
  const { t } = useTranslation(lng)
  const [edit, setEdit] = useState<string>('')
  const [useTreeData, setUseTreeData] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<ExpandedState>(true)
  const [keyFilter, setKeyFilter] = useState<string>('') // applied filter
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const filterInputRef = useRef<HTMLInputElement | null>(null)
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

  const filteredFlatData = useMemo<TableProps[]>(() => {
    const query = keyFilter.trim().toLowerCase()
    if (!query) return flatData
    return flatData.filter((row) => row.key.toLowerCase().includes(query))
  }, [flatData, keyFilter])

  const filterTree = (nodes: HierarchicalTableProps[], query: string): HierarchicalTableProps[] => {
    if (!query) return nodes
    const lowered = query.toLowerCase()
    const filterRec = (list: HierarchicalTableProps[]): HierarchicalTableProps[] => {
      const results: HierarchicalTableProps[] = []
      for (const node of list) {
        const children = node.children ? filterRec(node.children) : []
        const selfMatches = (node.originalKey ?? node.key).toLowerCase().includes(lowered)
        if (selfMatches || children.length > 0) {
          results.push({ ...node, children })
        }
      }
      return results
    }
    return filterRec(nodes)
  }

  const filteredHierarchicalData = useMemo<HierarchicalTableProps[]>(() => {
    const query = keyFilter.trim()
    if (!query) return hierarchicalData
    return filterTree(hierarchicalData, query)
  }, [hierarchicalData, keyFilter])

  const columnHelper = createColumnHelper<HierarchicalTableProps>()
  const columns = [
    columnHelper.accessor('key', {
      id: 'key',
      cell: (props) => <KeyCell {...props} useTreeData={useTreeData} />,
      header: (props) => (
        <KeyHeader
          {...props}
          useTreeData={useTreeData}
          t={t}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          keyFilter={keyFilter}
          filterInputRef={filterInputRef}
          setKeyFilter={setKeyFilter}
          setUseTreeData={setUseTreeData}
        />
      ),
    }),
    columnHelper.accessor('value', {
      id: 'value',
      cell: (props) => (
        <ValueCell {...props} useTreeData={useTreeData} edit={edit} handleSave={handleSave} handleClose={handleClose} />
      ),
      header: () => <ValueHeader t={t} />,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (props) => (
        <ActionsCell {...props} useTreeData={useTreeData} data={data} edit={edit} handleEdit={handleEdit} />
      ),
    }),
  ].filter((column) => column.id !== 'actions' || anyRW) // Hide actions column if there are no RW vars

  const tableConfig = {
    data: filteredFlatData,
    columns,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
  }

  const treeTableConfig = {
    data: filteredHierarchicalData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row: HierarchicalTableProps) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  }

  // eslint-disable-next-line react-hooks/incompatible-library
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
      const res = await saveVar(data.id, key, value)
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

  return (
    <Card className='border-border-card bg-card w-full border py-0 shadow-none' data-testid='grid'>
      <CardContent className='p-0!'>
        <Accordion type='single' className='w-full' value={GRID_ID}>
          <AccordionItem value={GRID_ID} className='border-b-0!'>
            <AccordionTrigger showChevron={false} className='cursor-default p-3 hover:no-underline'>
              {t(GRID_ID)}
            </AccordionTrigger>
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
